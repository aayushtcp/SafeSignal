"""OpenWeatherMap helpers + threshold checks for system alerts."""

from __future__ import annotations

import json
import logging
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass

from datetime import timedelta

from django.conf import settings
from django.utils import timezone

from .consumers import area_group_name, normalize_area_name
from .models import Alert, ChatMessage, Disaster, UserProfile

logger = logging.getLogger(__name__)

# Demo thresholds (metric)
HEAT_TEMP_C = 35.0
COLD_TEMP_C = 5.0
RAIN_MM_1H = 5.0
# Don't re-alert the same area+type within this window
DEDUP_HOURS = 6

OWM_URL = 'https://api.openweathermap.org/data/2.5/weather'


@dataclass
class WeatherReading:
    area_name: str
    latitude: float
    longitude: float
    temp_c: float
    rain_mm: float
    condition: str
    raw_city: str


@dataclass
class ThresholdHit:
    alert_type: str
    title: str
    message: str


def _api_key() -> str:
    return (getattr(settings, 'OPENWEATHERMAP_API_KEY', None) or '').strip()


def fetch_weather_by_coords(lat: float, lon: float) -> dict:
    key = _api_key()
    if not key:
        raise RuntimeError(
            'OPENWEATHERMAP_API_KEY is not set. Add it to dbackend/.env'
        )
    params = urllib.parse.urlencode({
        'lat': lat,
        'lon': lon,
        'appid': key,
        'units': 'metric',
    })
    url = f'{OWM_URL}?{params}'
    req = urllib.request.Request(url, headers={'User-Agent': 'SafeSignal/1.0'})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode())


def reading_from_owm(data: dict, fallback_area: str | None = None) -> WeatherReading:
    rain = 0.0
    if isinstance(data.get('rain'), dict):
        rain = float(data['rain'].get('1h') or data['rain'].get('3h') or 0)
    weather0 = (data.get('weather') or [{}])[0]
    city = data.get('name') or fallback_area or 'unknown'
    area = normalize_area_name(city)
    return WeatherReading(
        area_name=area,
        latitude=float(data['coord']['lat']),
        longitude=float(data['coord']['lon']),
        temp_c=float(data['main']['temp']),
        rain_mm=rain,
        condition=weather0.get('main', '') or '',
        raw_city=city,
    )


def evaluate_thresholds(reading: WeatherReading) -> list[ThresholdHit]:
    hits: list[ThresholdHit] = []
    if reading.temp_c >= HEAT_TEMP_C:
        hits.append(ThresholdHit(
            alert_type='heat',
            title=f'Heat warning — {reading.raw_city}',
            message=(
                f'Temperature is {reading.temp_c:.1f}°C in {reading.raw_city}. '
                f'Stay hydrated and avoid prolonged outdoor activity.'
            ),
        ))
    if reading.temp_c <= COLD_TEMP_C:
        hits.append(ThresholdHit(
            alert_type='cold',
            title=f'Cold warning — {reading.raw_city}',
            message=(
                f'Temperature is {reading.temp_c:.1f}°C in {reading.raw_city}. '
                f'Dress warmly and check on vulnerable people nearby.'
            ),
        ))
    rainy = reading.rain_mm >= RAIN_MM_1H or reading.condition.lower() in {
        'rain', 'thunderstorm', 'drizzle',
    }
    if rainy and reading.rain_mm >= RAIN_MM_1H:
        hits.append(ThresholdHit(
            alert_type='rain',
            title=f'Rain warning — {reading.raw_city}',
            message=(
                f'Heavy rain ({reading.rain_mm:.1f} mm) reported near {reading.raw_city}. '
                f'Watch for flooding and avoid low-lying roads.'
            ),
        ))
    elif reading.condition.lower() in {'thunderstorm'} and reading.rain_mm > 0:
        hits.append(ThresholdHit(
            alert_type='rain',
            title=f'Storm warning — {reading.raw_city}',
            message=(
                f'Thunderstorm conditions near {reading.raw_city}. '
                f'Seek shelter and avoid open areas.'
            ),
        ))
    return hits


def collect_locations() -> list[tuple[float, float, str | None]]:
    """Unique lat/lon samples from user profiles and disasters."""
    seen: set[tuple[float, float]] = set()
    locations: list[tuple[float, float, str | None]] = []

    def add(lat, lon, hint=None):
        if lat is None or lon is None:
            return
        key = (round(float(lat), 2), round(float(lon), 2))
        if key in seen:
            return
        seen.add(key)
        locations.append((float(lat), float(lon), hint))

    for p in UserProfile.objects.exclude(latitude__isnull=True).exclude(longitude__isnull=True):
        add(p.latitude, p.longitude)

    for d in Disaster.objects.all().only('latitude', 'longitude', 'country')[:200]:
        add(d.latitude, d.longitude, d.country)

    return locations


def recently_alerted(area_name: str, alert_type: str) -> bool:
    since = timezone.now() - timedelta(hours=DEDUP_HOURS)
    return Alert.objects.filter(
        area_name=area_name,
        alert_type=alert_type,
        source='system',
        created_at__gte=since,
    ).exists()


def create_and_broadcast_alert(
    *,
    reading: WeatherReading,
    hit: ThresholdHit,
    broadcast: bool = True,
) -> Alert:
    from asgiref.sync import async_to_sync
    from channels.layers import get_channel_layer

    alert = Alert.objects.create(
        area_name=reading.area_name,
        alert_type=hit.alert_type,
        title=hit.title,
        message=hit.message,
        source='system',
        latitude=reading.latitude,
        longitude=reading.longitude,
        temperature_c=reading.temp_c,
        rain_mm=reading.rain_mm,
    )

    chat = ChatMessage.objects.create(
        area_name=reading.area_name,
        user=None,
        message=hit.message,
        message_type='system',
    )

    data = {
        'type': 'alert',
        'id': chat.id,
        'alert_id': alert.id,
        'area_name': reading.area_name,
        'message': hit.message,
        'title': hit.title,
        'alert_type': hit.alert_type,
        'sender': 'SafeSignal Bot',
        'source': 'system',
        'temperature_c': reading.temp_c,
        'rain_mm': reading.rain_mm,
        'created_at': chat.created_at.isoformat(),
    }

    if broadcast:
        channel_layer = get_channel_layer()
        if channel_layer is not None:
            group = area_group_name(reading.area_name)
            try:
                async_to_sync(channel_layer.group_send)(
                    group,
                    {'type': 'area.event', 'data': data},
                )
            except Exception as exc:
                logger.warning('WebSocket broadcast failed for %s: %s', group, exc)

    return alert


def run_weather_check(*, broadcast: bool = True, force: bool = False) -> dict:
    """
    Fetch weather for known locations; create system alerts when thresholds hit.
    Returns a summary dict for admin / CLI.
    """
    if not _api_key():
        return {
            'ok': False,
            'error': 'OPENWEATHERMAP_API_KEY is not set in environment / .env',
            'checked': 0,
            'alerts_created': 0,
            'created': [],
        }

    locations = collect_locations()
    if not locations:
        return {
            'ok': True,
            'error': None,
            'checked': 0,
            'alerts_created': 0,
            'created': [],
            'note': 'No UserProfile/Disaster coordinates found to check.',
        }

    created: list[dict] = []
    errors: list[str] = []
    checked = 0

    for lat, lon, hint in locations:
        try:
            data = fetch_weather_by_coords(lat, lon)
            reading = reading_from_owm(data, fallback_area=hint)
            checked += 1
        except urllib.error.HTTPError as exc:
            errors.append(f'{lat},{lon}: HTTP {exc.code}')
            continue
        except Exception as exc:
            errors.append(f'{lat},{lon}: {exc}')
            continue

        for hit in evaluate_thresholds(reading):
            if not force and recently_alerted(reading.area_name, hit.alert_type):
                continue
            alert = create_and_broadcast_alert(
                reading=reading, hit=hit, broadcast=broadcast,
            )
            created.append({
                'id': alert.id,
                'area_name': alert.area_name,
                'alert_type': alert.alert_type,
                'title': alert.title,
            })

    return {
        'ok': True,
        'error': None,
        'checked': checked,
        'alerts_created': len(created),
        'created': created,
        'errors': errors,
    }
