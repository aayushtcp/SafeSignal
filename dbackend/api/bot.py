"""SafeSignal Bot — weather scrapes + USGS quake alerts every 5 minutes."""

from __future__ import annotations

import logging
import re
import threading
import time

import requests
from asgiref.sync import async_to_sync
from bs4 import BeautifulSoup
from channels.layers import get_channel_layer

from .consumers import area_group_name, normalize_area_name
from .models import Alert, ChatMessage
from .weather import collect_locations, fetch_weather_by_coords, reading_from_owm

logger = logging.getLogger(__name__)

BOT_NAME = "SafeSignal Bot"
INTERVAL_SEC = 300
QUAKE_MIN_MAG = 4.5
USGS_FEED = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.atom"
WTTR_ONE_LINE = "https://wttr.in/{city}?format=%l|%C|%t|%f|%w|%h|%p"

_seen_quakes: set[str] = set()
_seeded = False
_started = False


def _broadcast(area: str, data: dict) -> None:
    layer = get_channel_layer()
    if not layer:
        return
    try:
        async_to_sync(layer.group_send)(
            area_group_name(area),
            {"type": "area.event", "data": data},
        )
    except Exception as exc:
        logger.warning("Bot broadcast failed: %s", exc)


def post_bot(
    area_name: str,
    message: str,
    *,
    as_alert: bool = False,
    title: str = "",
    alert_type: str = "other",
) -> None:
    area = normalize_area_name(area_name)
    chat = ChatMessage.objects.create(
        area_name=area,
        user=None,
        message=message,
        message_type="system" if as_alert else "bot",
    )

    if as_alert:
        Alert.objects.create(
            area_name=area,
            alert_type=alert_type if alert_type in {"heat", "cold", "rain", "other"} else "other",
            title=title or "Alert",
            message=message,
            source="system",
        )
        data = {
            "type": "alert",
            "id": chat.id,
            "area_name": area,
            "message": message,
            "title": title or "Alert",
            "alert_type": alert_type,
            "sender": BOT_NAME,
            "source": "system",
            "created_at": chat.created_at.isoformat(),
        }
    else:
        data = {
            "type": "chat",
            "id": chat.id,
            "area_name": area,
            "message": message,
            "sender": BOT_NAME,
            "user_id": None,
            "created_at": chat.created_at.isoformat(),
        }
    _broadcast(area, data)


def scrape_usgs_quakes() -> list[dict]:
    """Parse USGS Atom feed; first call only seeds IDs (no spam), later calls return new quakes."""
    global _seeded
    r = requests.get(USGS_FEED, timeout=20, headers={"User-Agent": "SafeSignalBot/1.0"})
    r.raise_for_status()
    soup = BeautifulSoup(r.content, "xml")
    found = []
    for entry in soup.find_all("entry"):
        eid_el = entry.find("id")
        title_el = entry.find("title")
        summary_el = entry.find("summary")
        eid = eid_el.get_text(strip=True) if eid_el else ""
        title = title_el.get_text(strip=True) if title_el else ""
        raw_summary = summary_el.get_text(" ", strip=True) if summary_el else title
        summary = BeautifulSoup(raw_summary, "html.parser").get_text(" ", strip=True)
        mag_m = re.search(r"M\s*([0-9.]+)", title)
        mag = float(mag_m.group(1)) if mag_m else 0.0
        if not eid or mag < QUAKE_MIN_MAG:
            continue
        found.append({"id": eid, "title": title, "summary": summary[:400], "mag": mag})

    if not _seeded:
        for q in found:
            _seen_quakes.add(q["id"])
        _seeded = True
        return []

    out = []
    for q in found:
        if q["id"] in _seen_quakes:
            continue
        _seen_quakes.add(q["id"])
        out.append(q)
    return out


def scrape_wttr_brief(city: str) -> str | None:
    """Clear one-line wttr format → readable multi-line weather blurb."""
    url = WTTR_ONE_LINE.format(city=requests.utils.quote(city))
    try:
        r = requests.get(url, timeout=15, headers={"User-Agent": "curl/8.0"})
        r.raise_for_status()
        raw = BeautifulSoup(r.text, "html.parser").get_text(" ", strip=True)
        parts = [p.strip() for p in raw.split("|")]
        if len(parts) < 3:
            return None
        place, condition, temp = parts[0], parts[1], parts[2]
        feels = parts[3] if len(parts) > 3 else ""
        wind = parts[4] if len(parts) > 4 else ""
        humidity = parts[5] if len(parts) > 5 else ""
        precip = parts[6] if len(parts) > 6 else ""
        lines = [
            f"📍 {place}",
            f"Condition: {condition}",
            f"Temp: {temp}" + (f" (feels {feels})" if feels else ""),
        ]
        if wind:
            lines.append(f"Wind: {wind}")
        if humidity:
            lines.append(f"Humidity: {humidity}")
        if precip:
            lines.append(f"Precip: {precip}")
        return "\n".join(lines)
    except Exception as exc:
        logger.info("wttr scrape failed for %s: %s", city, exc)
        return None


def owm_brief_for_area(area: str) -> str | None:
    """Prefer OpenWeatherMap when coords exist — same clear layout."""
    area_n = normalize_area_name(area)
    for lat, lon, hint in collect_locations():
        try:
            data = fetch_weather_by_coords(lat, lon)
            reading = reading_from_owm(data, fallback_area=hint)
            if reading.area_name != area_n and normalize_area_name(reading.raw_city) != area_n:
                continue
            cond = reading.condition or "—"
            lines = [
                f"📍 {reading.raw_city}",
                f"Condition: {cond}",
                f"Temp: {reading.temp_c:.0f}°C",
            ]
            if reading.rain_mm:
                lines.append(f"Rain (1h): {reading.rain_mm:.1f} mm")
            return "\n".join(lines)
        except Exception:
            continue
    return None


def weather_brief(area: str) -> str:
    brief = owm_brief_for_area(area) or scrape_wttr_brief(area.replace("_", " "))
    if brief:
        return f"Weather update\n{brief}"
    return f"Weather update\n📍 {area}\nNo live data right now — stay safe."


def _areas_from_db() -> list[str]:
    areas = {"kathmandu"}
    for lat, lon, hint in collect_locations():
        try:
            data = fetch_weather_by_coords(lat, lon)
            reading = reading_from_owm(data, fallback_area=hint)
            areas.add(reading.area_name)
        except Exception:
            if hint:
                areas.add(normalize_area_name(hint))
    for a in ChatMessage.objects.values_list("area_name", flat=True).distinct()[:20]:
        areas.add(normalize_area_name(a))
    return sorted(areas)


def run_bot_cycle() -> dict:
    quakes = []
    try:
        quakes = scrape_usgs_quakes()
    except Exception as exc:
        logger.warning("USGS scrape failed: %s", exc)

    areas = _areas_from_db()
    for q in quakes:
        msg = f"{q['title']}. {q['summary']}"
        for area in areas:
            post_bot(
                area,
                msg,
                as_alert=True,
                title=f"Earthquake M{q['mag']}",
                alert_type="other",
            )

    weather_posts = 0
    for area in areas:
        post_bot(area, weather_brief(area))
        weather_posts += 1

    return {"quakes": len(quakes), "weather_posts": weather_posts, "areas": areas}


def _loop() -> None:
    time.sleep(20)
    while True:
        try:
            summary = run_bot_cycle()
            logger.info(
                "SafeSignal Bot: quakes=%s weather=%s areas=%s",
                summary["quakes"],
                summary["weather_posts"],
                len(summary["areas"]),
            )
        except Exception:
            logger.exception("SafeSignal Bot cycle failed")
        time.sleep(INTERVAL_SEC)


def start_bot_thread() -> None:
    global _started
    if _started:
        return
    _started = True
    threading.Thread(target=_loop, name="safesignal-bot", daemon=True).start()
    logger.info("SafeSignal Bot started (every %ss)", INTERVAL_SEC)
