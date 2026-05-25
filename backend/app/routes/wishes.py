"""
Wishes routes:
  GET    /wishes          — list user's wishes
  POST   /wishes          — create a wish
  PUT    /wishes/{id}     — update a wish
  DELETE /wishes/{id}     — delete a wish
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.wish import Wish
from app.schemas.wish import CreateWishRequest, UpdateWishRequest, WishResponse
from app.services.user_service import award_xp
from app.core.config import settings

router = APIRouter(prefix="/wishes", tags=["wishes"])


def _get_wish_or_404(wish_id: str, user_id: str, db: Session) -> Wish:
    wish = (
        db.query(Wish)
        .filter(Wish.id == wish_id, Wish.user_id == user_id)
        .first()
    )
    if not wish:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wish not found.")
    return wish


@router.get("", response_model=list[WishResponse])
def list_wishes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all wishes belonging to the authenticated user."""
    wishes = (
        db.query(Wish)
        .filter(Wish.user_id == current_user.id)
        .order_by(Wish.created_at.desc())
        .all()
    )
    return wishes


@router.post("", response_model=WishResponse, status_code=status.HTTP_201_CREATED)
def create_wish(
    payload: CreateWishRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new manifestation wish for the authenticated user."""
    wish = Wish(
        user_id=current_user.id,
        title=payload.title,
        category=payload.category,
        why=payload.why,
        timeline=payload.timeline,
        progress_label=payload.progress_label,
    )
    db.add(wish)
    db.commit()
    db.refresh(wish)
    return wish


@router.put("/{wish_id}", response_model=WishResponse)
def update_wish(
    wish_id: str,
    payload: UpdateWishRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an existing wish. Awarding XP if the wish is marked as manifested."""
    wish = _get_wish_or_404(wish_id, current_user.id, db)

    # If wish is being marked as manifested for the first time → award XP
    manifesting_now = (
        payload.is_manifested is True and not wish.is_manifested
    )

    if payload.title is not None:
        wish.title = payload.title
    if payload.category is not None:
        wish.category = payload.category
    if payload.why is not None:
        wish.why = payload.why
    if payload.timeline is not None:
        wish.timeline = payload.timeline
    if payload.progress_label is not None:
        wish.progress_label = payload.progress_label
    if payload.is_manifested is not None:
        wish.is_manifested = payload.is_manifested
        if payload.is_manifested:
            wish.pct_complete = 100
            wish.progress_label = "Close"
    if payload.pct_complete is not None:
        wish.pct_complete = payload.pct_complete

    db.add(wish)
    db.commit()
    db.refresh(wish)

    if manifesting_now:
        award_xp(db, current_user, settings.XP_PER_WISH_MANIFEST)

    return wish


@router.delete("/{wish_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_wish(
    wish_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a wish belonging to the authenticated user."""
    wish = _get_wish_or_404(wish_id, current_user.id, db)
    db.delete(wish)
    db.commit()
