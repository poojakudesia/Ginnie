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
from app.schemas.aura import (
    AuraMessageRequest,
    RecommendMethodsRequest,
    RecommendMethodsResponse,
    RefineAffirmationRequest,
    RefineAffirmationResponse,
)
from app.services.aura_service import (
    stream_aura_response,
    get_method_recommendations,
    refine_affirmation,
)

router = APIRouter(prefix="/aura", tags=["aura"])


@router.post("/recommend-methods", response_model=RecommendMethodsResponse)
def recommend_methods(
    payload: RecommendMethodsRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Ginnie picks the 3 best-fit practices from the client's pre-scored top-5.
    Returns an empty list (not an error) when the AI is unavailable or its
    output can't be parsed — the client then falls back to the top-3 scored.
    """
    top5 = [c.model_dump() for c in payload.top5]
    recs = get_method_recommendations(
        modality=payload.modality,
        habit_style=payload.habitStyle,
        blocker=payload.blocker,
        mind_open=payload.mindOpen,
        mental_state=payload.mentalState,
        top5=top5,
    )
    return RecommendMethodsResponse(recommendations=recs)


@router.post("/refine-affirmation", response_model=RefineAffirmationResponse)
def refine_affirmation_route(
    payload: RefineAffirmationRequest,
    current_user: User = Depends(get_current_user),
):
    result = refine_affirmation(payload.text, payload.method)
    return RefineAffirmationResponse(**result)


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
