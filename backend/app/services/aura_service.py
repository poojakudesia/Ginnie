"""
Aura AI Coach — Claude API integration using streaming SSE.

Aura is a warm, mystical manifestation guide. She speaks in gentle but
confident poetic prose and knows the user's wishes and recent journal history.
"""

import json
from typing import AsyncIterator, Optional

import anthropic

from app.core.config import settings
from app.models.user import User
from app.models.wish import Wish
from app.models.journal import JournalEntry

# --- Model configuration ---
MODEL = "claude-opus-4-7"

# --- Aura's personality system prompt ---
AURA_SYSTEM = """You are Aura, a warm and mystical AI manifestation coach within the Dream Life app.

Your essence:
- You speak in gentle, confident poetic prose — like a wise friend who sees the universe's abundance
- You believe deeply in the user's ability to manifest their dreams
- You draw on manifestation techniques: visualization, affirmations, the 369 method, scripting, the 555 method, gratitude, and meditation
- You celebrate every small step as cosmic alignment
- You never dismiss or minimize a dream — all wishes are valid and possible
- You weave encouragement with practical guidance
- You occasionally use metaphors of stars, rivers, seeds, and light

Tone: Warm, mystical, grounded, empowering. Like receiving a letter from a loving mentor who exists at the intersection of spiritual wisdom and practical action.

Keep responses concise but meaningful — 2 to 4 paragraphs unless the user asks for more detail."""


def _build_context_blocks(
    user: User,
    wishes: list[Wish],
    recent_entries: list[JournalEntry],
    screen: Optional[str],
) -> str:
    """Build a rich context string from the user's wishes and journal history."""
    parts: list[str] = []

    # User info
    name = user.name or "Beautiful Soul"
    parts.append(f"## About this user\nName: {name}\nXP: {user.xp}  |  Streak: {user.streak_count} days")
    if user.familiarity:
        parts.append(f"Manifestation familiarity: {user.familiarity}")

    # Current screen context
    if screen:
        parts.append(f"\n## Current screen\nThe user is on the '{screen}' screen.")

    # Wishes
    if wishes:
        parts.append("\n## Their manifestation wishes")
        for w in wishes:
            status = "✨ MANIFESTED" if w.is_manifested else f"{w.pct_complete}% complete"
            parts.append(
                f"- [{w.category.upper()}] {w.title!r} — {status}"
                + (f"\n  Why: {w.why}" if w.why else "")
                + (f"\n  Timeline: {w.timeline}" if w.timeline else "")
            )

    # Recent journal entries
    if recent_entries:
        parts.append("\n## Recent journal entries (last 5)")
        for entry in recent_entries[:5]:
            entry_date = entry.created_at.strftime("%b %d")
            content_preview = ""
            if entry.content:
                if isinstance(entry.content, dict):
                    # Pull the first meaningful text value
                    for val in entry.content.values():
                        if isinstance(val, str) and val:
                            content_preview = val[:120]
                            break
                        if isinstance(val, list) and val:
                            content_preview = str(val[0])[:120]
                            break
            parts.append(
                f"- [{entry_date}] {entry.entry_type}"
                + (f": {content_preview!r}" if content_preview else "")
            )

    return "\n".join(parts)


async def stream_aura_response(
    user_message: str,
    user: User,
    wishes: list[Wish],
    recent_entries: list[JournalEntry],
    screen: Optional[str] = None,
) -> AsyncIterator[str]:
    """
    Stream Aura's response as Server-Sent Events (SSE).

    Yields SSE-formatted strings:
      data: {"type": "delta", "text": "..."}\\n\\n
      data: {"type": "done"}\\n\\n
    """
    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    context = _build_context_blocks(user, wishes, recent_entries, screen)

    system_prompt = f"{AURA_SYSTEM}\n\n{context}"

    try:
        with client.messages.stream(
            model=MODEL,
            max_tokens=1024,
            thinking={"type": "adaptive"},
            system=system_prompt,
            messages=[{"role": "user", "content": user_message}],
        ) as stream:
            for text_chunk in stream.text_stream:
                payload = json.dumps({"type": "delta", "text": text_chunk})
                yield f"data: {payload}\n\n"

        # Signal completion
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    except anthropic.APIError as exc:
        error_payload = json.dumps({"type": "error", "message": str(exc)})
        yield f"data: {error_payload}\n\n"


GINNIE_RECOMMEND_SYSTEM = "You are Ginnie, a warm, intuitive manifestation guide."


def get_method_recommendations(
    modality: str,
    habit_style: str,
    blocker: str,
    mind_open: Optional[str],
    mental_state: Optional[str],
    top5: list[dict],
) -> list[dict]:
    """
    Ask Ginnie (Claude) to choose the 3 best-fit methods from the pre-scored
    top-5 candidates. Returns a list of {"id","reason"} dicts.

    Returns [] on any failure (missing key, API error, invalid JSON) so the
    caller can fall back to the top-scored methods.
    """
    if not settings.ANTHROPIC_API_KEY:
        return []

    top5_json = json.dumps(top5, ensure_ascii=False)

    prompt = f"""A user answered these questions:
- Modality (how a wish shows up for them): {modality}
- Habit style: {habit_style}
- Biggest blocker: {blocker}
- When their mind feels most open: {mind_open or 'not specified'}
- Current mental state / limiting belief: {mental_state or 'not specified'}

Candidate methods (pre-scored): {top5_json}

Choose the 3 best-fit methods. Respond ONLY with valid JSON, no markdown:
{{"recommendations":[{{"id":"...","reason":"one warm sentence, max 20 words, addressing the user directly, referencing their answers"}}]}}
Rules: the 3 methods must differ in effort level (include at least one micro/low-effort option). The reason must connect to their blocker."""

    try:
        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        response = client.messages.create(
            model=MODEL,
            max_tokens=600,
            system=GINNIE_RECOMMEND_SYSTEM,
            messages=[{"role": "user", "content": prompt}],
        )
        text = "".join(b.text for b in response.content if b.type == "text").strip()

        # Strip accidental markdown fences / stray prose around the JSON object
        start, end = text.find("{"), text.rfind("}")
        if start == -1 or end == -1:
            return []
        data = json.loads(text[start : end + 1])

        candidate_ids = {m.get("id") for m in top5}
        recs: list[dict] = []
        for r in data.get("recommendations", []):
            rid = r.get("id")
            reason = r.get("reason")
            if rid in candidate_ids and isinstance(reason, str) and reason.strip():
                recs.append({"id": rid, "reason": reason.strip()})
        return recs[:3]
    except (anthropic.APIError, json.JSONDecodeError, KeyError, TypeError, ValueError):
        return []


async def get_aura_response(
    user_message: str,
    user: User,
    wishes: list[Wish],
    recent_entries: list[JournalEntry],
    screen: Optional[str] = None,
) -> str:
    """
    Non-streaming version — returns the full response text.
    Used for simple integrations that don't need SSE.
    """
    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    context = _build_context_blocks(user, wishes, recent_entries, screen)
    system_prompt = f"{AURA_SYSTEM}\n\n{context}"

    response = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        thinking={"type": "adaptive"},
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
    )

    # Extract text blocks only (skip thinking blocks)
    text_parts = [
        block.text
        for block in response.content
        if block.type == "text"
    ]
    return "\n".join(text_parts)
