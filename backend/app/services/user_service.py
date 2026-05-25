from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.journal import JournalEntry
from app.core.config import settings


def _level_from_xp(xp: int) -> int:
    """Simple level formula: level = floor(sqrt(xp / 100)) + 1"""
    import math
    return max(1, int(math.sqrt(xp / 100)) + 1)


def award_xp(db: Session, user: User, xp_amount: int) -> User:
    """Award XP to a user and persist."""
    user.xp = (user.xp or 0) + xp_amount
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_streak(db: Session, user: User) -> User:
    """
    Update the user's daily streak.
    - If last_active was yesterday: increment streak.
    - If last_active was today: no-op.
    - If last_active was 2+ days ago (or never): reset streak to 1.
    Also bumps last_active to now.
    """
    now = datetime.now(timezone.utc)
    today = now.date()

    if user.last_active is not None:
        last = user.last_active
        if last.tzinfo is None:
            last = last.replace(tzinfo=timezone.utc)
        last_date = last.date()

        if last_date == today:
            # Already active today – update timestamp but don't change streak
            user.last_active = now
            db.add(user)
            db.commit()
            db.refresh(user)
            return user
        elif last_date == today - timedelta(days=1):
            # Consecutive day
            user.streak_count = (user.streak_count or 0) + 1
            # Bonus XP for keeping the streak
            user.xp = (user.xp or 0) + settings.XP_PER_STREAK_DAY
        else:
            # Streak broken
            user.streak_count = 1
    else:
        # First ever activity
        user.streak_count = 1

    user.last_active = now
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_level(user: User) -> int:
    """Return the user's current level based on XP."""
    return _level_from_xp(user.xp or 0)


def get_xp_breakdown(db: Session, user: User) -> dict[str, int]:
    """
    Return a breakdown of XP earned per journal entry type.
    Uses a fixed XP_PER_JOURNAL_ENTRY multiplied by count.
    """
    entries = db.query(JournalEntry).filter(JournalEntry.user_id == user.id).all()
    breakdown: dict[str, int] = {}
    for entry in entries:
        etype = entry.entry_type
        breakdown[etype] = breakdown.get(etype, 0) + settings.XP_PER_JOURNAL_ENTRY
    return breakdown
