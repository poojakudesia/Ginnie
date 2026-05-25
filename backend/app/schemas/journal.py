from typing import Optional, Any
from datetime import datetime
from pydantic import BaseModel, field_validator

VALID_ENTRY_TYPES = {"affirm", "viz", "sign", "movie", "gratitude", "photo", "script", "369", "555"}


class CreateEntryRequest(BaseModel):
    entry_type: str
    content: Optional[dict[str, Any]] = None
    wish_id: Optional[str] = None

    @field_validator("entry_type")
    @classmethod
    def validate_entry_type(cls, v: str) -> str:
        if v not in VALID_ENTRY_TYPES:
            raise ValueError(
                f"entry_type must be one of: {', '.join(sorted(VALID_ENTRY_TYPES))}"
            )
        return v


class JournalEntryResponse(BaseModel):
    id: str
    user_id: str
    wish_id: Optional[str] = None
    entry_type: str
    content: Optional[Any] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class JournalStatsResponse(BaseModel):
    streak_count: int
    total_sessions: int
    xp: int
    xp_breakdown: dict[str, int]  # entry_type -> total XP from that type
    sessions_this_week: int
