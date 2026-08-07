"""SafeSignal AI — Groq-powered weather / disaster Q&A (EN / NE / HI)."""

from __future__ import annotations

import logging
import time
from typing import Any

import requests
from django.conf import settings
from django.utils import timezone

from .bot import weather_brief
from .consumers import normalize_area_name
from .models import Alert, Disaster

logger = logging.getLogger(__name__)

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MAX_QUESTION_LEN = 800
REQUEST_TIMEOUT = 20
RATE_LIMIT_SEC = 4.0

_last_ask_at: dict[str, float] = {}

SYSTEM_PROMPT = """You are SafeSignal AI, a helpful disaster-preparedness and weather assistant for the SafeSignal app.

Rules:
- Answer weather and natural-disaster questions using ONLY the live context provided below when it is available.
- If context is missing or incomplete, say so clearly — do not invent live alerts, quake magnitudes, temperatures, or rain amounts.
- Give practical, calm safety guidance (shelter, hydration, evacuation awareness) when relevant.
- Keep answers concise (usually under 180 words). Use short paragraphs or bullets when helpful.
- Detect the user's language and reply in the SAME language. Supported focus: English, Nepali (नेपाली), and Hindi (हिन्दी). If they mix languages, prefer the language of their question.
- You may greet briefly; stay on weather, disasters, and safety — politely decline unrelated topics.
"""


def _api_key() -> str:
    return (getattr(settings, "GROQ_API_KEY", None) or "").strip()


def _model() -> str:
    return (getattr(settings, "GROQ_MODEL", None) or "llama-3.3-70b-versatile").strip()


def _rate_limit_ok(user_key: str) -> bool:
    now = time.monotonic()
    last = _last_ask_at.get(user_key, 0.0)
    if now - last < RATE_LIMIT_SEC:
        return False
    _last_ask_at[user_key] = now
    return True


def build_area_context(area_name: str) -> str:
    area = normalize_area_name(area_name)
    parts: list[str] = [f"Current area: {area}", f"Server time (UTC): {timezone.now().isoformat()}"]

    try:
        parts.append("Weather:\n" + weather_brief(area))
    except Exception as exc:
        logger.info("AI weather context failed for %s: %s", area, exc)
        parts.append("Weather: unavailable")

    try:
        alerts = Alert.objects.filter(area_name=area).order_by("-created_at")[:5]
        if alerts:
            lines = []
            for a in alerts:
                lines.append(
                    f"- [{a.alert_type}] {a.title}: {a.message[:200]} "
                    f"(at {a.created_at.isoformat()})"
                )
            parts.append("Recent area alerts:\n" + "\n".join(lines))
        else:
            parts.append("Recent area alerts: none")
    except Exception as exc:
        logger.info("AI alert context failed: %s", exc)
        parts.append("Recent area alerts: unavailable")

    try:
        disasters = Disaster.objects.order_by("-date", "-time")[:8]
        if disasters:
            lines = []
            for d in disasters:
                desc = (d.description or "")[:160]
                lines.append(
                    f"- {d.disasterType} on {d.date} {d.time} "
                    f"@ ({d.latitude:.3f},{d.longitude:.3f}) "
                    f"country={d.country or '?'} — {desc}"
                )
            parts.append("Recent reported disasters (app DB):\n" + "\n".join(lines))
        else:
            parts.append("Recent reported disasters: none in database")
    except Exception as exc:
        logger.info("AI disaster context failed: %s", exc)
        parts.append("Recent reported disasters: unavailable")

    return "\n\n".join(parts)


def call_groq(question: str, context: str) -> str:
    key = _api_key()
    if not key:
        return (
            "SafeSignal AI is not configured. Add GROQ_API_KEY to dbackend/.env "
            "(free key from https://console.groq.com)."
        )

    payload: dict[str, Any] = {
        "model": _model(),
        "temperature": 0.4,
        "max_tokens": 500,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "system",
                "content": "Live SafeSignal context for this request:\n\n" + context,
            },
            {"role": "user", "content": question},
        ],
    }
    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }
    try:
        r = requests.post(GROQ_URL, json=payload, headers=headers, timeout=REQUEST_TIMEOUT)
        if r.status_code == 401:
            return "SafeSignal AI: invalid Groq API key. Check GROQ_API_KEY in .env."
        if r.status_code == 429:
            return "SafeSignal AI is busy (rate limit). Please try again in a minute."
        r.raise_for_status()
        data = r.json()
        text = (
            data.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
            .strip()
        )
        if not text:
            return "SafeSignal AI returned an empty answer. Please try again."
        return text
    except requests.Timeout:
        return "SafeSignal AI timed out. Please try again."
    except Exception as exc:
        logger.warning("Groq call failed: %s", exc)
        return "SafeSignal AI could not answer right now. Please try again shortly."


def answer_question(
    area_name: str,
    question: str,
    *,
    user_key: str = "anon",
) -> str:
    """Build context and return an AI reply (or a friendly error string)."""
    q = (question or "").strip()
    if not q:
        return "Ask me something after /ask — e.g. /ask Will it rain today?"
    if len(q) > MAX_QUESTION_LEN:
        q = q[:MAX_QUESTION_LEN]

    if not _rate_limit_ok(user_key):
        return "Please wait a few seconds before asking again."

    context = build_area_context(area_name)
    return call_groq(q, context)
