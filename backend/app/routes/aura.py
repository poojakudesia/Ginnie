"""
Aura AI chat route:
  POST /aura/chat  — streaming SSE response from Aura (Claude)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.journal import JournalEntry
from app.models.user import User
from app.models.wish import Wish
from app.schemas.aura import AuraMessageRequest
from app.services.aura_service import stream_aura_response

router = APIRouter(prefix="/aura", tags=["aura"])


@router.post("/chat")
async def aura_chat(
    payload: AuraMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Stream Aura's response to the user's message.

    Returns a Server-Sent Events stream with JSON payloads:
      data: {"type": "delta", "text": "..."}
      data: {"type": "done"}
      data: {"type": "error", "message": "..."}
    """
    if not settings.ANTHROPIC_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service not configured. Set ANTHROPIC_API_KEY in your environment.",
        )

    # Fetch user's wishes
    wishes = (
        db.query(Wish)
        .filter(Wish.user_id == current_user.id)
        .order_by(Wish.created_at.desc())
        .limit(5)
        .all()
    )

    # Fetch recent journal entries for context
    recent_entries = (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == current_user.id)
        .order_by(JournalEntry.created_at.desc())
        .limit(10)
        .all()
    )

    return StreamingResponse(
        stream_aura_response(
            user_message=payload.message,
            user=current_user,
            wishes=wishes,
            recent_entries=recent_entries,
            screen=payload.screen,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
