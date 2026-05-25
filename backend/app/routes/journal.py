"""
Journal routes:
  GET    /journal         — paginated entries (filter by type, date)
  POST   /journal         — create a new entry
  DELETE /journal/{id}    — remove an entry
  GET    /journal/stats   — streak, session totals, XP breakdown
"""

from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.journal import JournalEntry
from app.models.user import User
from app.schemas.journal import (
    CreateEntryRequest,
    JournalEntryResponse,
    JournalStatsResponse,
)
from app.services.user_service import award_xp, update_streak

router = APIRouter(prefix="/journal", tags=["journal"])


def _to_response(entry: JournalEntry) -> JournalEntryResponse:
    return JournalEntryResponse(
        id=entry.id,
        user_id=entry.user_id,
        entry_type=entry.entry_type,
        content=entry.content or {},
        wish_id=entry.wish_id,
        created_at=entry.created_at,
    )


@router.get("", response_model=list[JournalEntryResponse])
def get_journal(
    entry_type: Optional[str] = Query(None, description="Filter by entry type"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the current user's journal entries, newest first."""
    q = (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == current_user.id)
    )
    if entry_type:
        q = q.filter(JournalEntry.entry_type == entry_type)

    entries = q.order_by(JournalEntry.created_at.desc()).offset(offset).limit(limit).all()
    return [_to_response(e) for e in entries]


@router.post("", response_model=JournalEntryResponse, status_code=status.HTTP_201_CREATED)
def create_entry(
    payload: CreateEntryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new journal entry and award XP."""
    entry = JournalEntry(
        id=str(uuid4()),
        user_id=current_user.id,
        wish_id=payload.wish_id,
        entry_type=payload.entry_type,
        content=payload.content,
        created_at=datetime.now(timezone.utc),
    )
    db.add(entry)

    # Award XP and update streak
    xp_map = {
        "affirm": 10,
        "viz": 15,
        "movie": 5,
        "gratitude": 8,
        "photo": 12,
        "sign": 12,
        "script": 10,
        "369": 20,
        "555": 25,
        "meditate": 15,
    }
    xp_earned = xp_map.get(payload.entry_type, 5)
    award_xp(db, current_user, xp_earned)
    update_streak(db, current_user)

    db.commit()
    db.refresh(entry)
    return _to_response(entry)


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_entry(
    entry_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a journal entry owned by the current user."""
    entry = (
        db.query(JournalEntry)
        .filter(JournalEntry.id == entry_id, JournalEntry.user_id == current_user.id)
        .first()
    )
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found.")
    db.delete(entry)
    db.commit()


@router.get("/stats", response_model=JournalStatsResponse)
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return streak, session totals, and XP summary."""
    from datetime import timedelta
    from sqlalchemy import func

    xp_map = {
        "affirm": 10, "viz": 15, "movie": 5, "gratitude": 8,
        "photo": 12, "sign": 12, "script": 10, "369": 20, "555": 25,
    }

    total_sessions = (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == current_user.id)
        .count()
    )

    # Count by type for XP breakdown
    type_counts_raw = (
        db.query(JournalEntry.entry_type, func.count(JournalEntry.id))
        .filter(JournalEntry.user_id == current_user.id)
        .group_by(JournalEntry.entry_type)
        .all()
    )
    xp_breakdown = {row[0]: row[1] * xp_map.get(row[0], 5) for row in type_counts_raw}

    # Sessions this week
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    sessions_this_week = (
        db.query(JournalEntry)
        .filter(
            JournalEntry.user_id == current_user.id,
            JournalEntry.created_at >= week_ago,
        )
        .count()
    )

    return JournalStatsResponse(
        streak_count=current_user.streak_count,
        total_sessions=total_sessions,
        xp=current_user.xp,
        xp_breakdown=xp_breakdown,
        sessions_this_week=sessions_this_week,
    )
