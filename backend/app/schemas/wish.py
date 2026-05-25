from typing import Optional
from datetime import datetime
from pydantic import BaseModel, field_validator

VALID_CATEGORIES = {"health", "wealth", "relationships", "career", "growth", "spirituality"}
VALID_PROGRESS_LABELS = {"Not started", "In progress", "Close"}
VALID_TIMELINES = {"3 months", "6 months", "1 year", "3 years"}


class CreateWishRequest(BaseModel):
    title: str
    category: str
    why: Optional[str] = None
    timeline: Optional[str] = None
    progress_label: str = "Not started"

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        if v not in VALID_CATEGORIES:
            raise ValueError(f"category must be one of: {', '.join(sorted(VALID_CATEGORIES))}")
        return v

    @field_validator("progress_label")
    @classmethod
    def validate_progress(cls, v: str) -> str:
        if v not in VALID_PROGRESS_LABELS:
            raise ValueError(f"progress_label must be one of: {', '.join(VALID_PROGRESS_LABELS)}")
        return v

    @field_validator("timeline")
    @classmethod
    def validate_timeline(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_TIMELINES:
            raise ValueError(f"timeline must be one of: {', '.join(sorted(VALID_TIMELINES))}")
        return v


class UpdateWishRequest(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    why: Optional[str] = None
    timeline: Optional[str] = None
    progress_label: Optional[str] = None
    is_manifested: Optional[bool] = None
    pct_complete: Optional[int] = None

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_CATEGORIES:
            raise ValueError(f"category must be one of: {', '.join(sorted(VALID_CATEGORIES))}")
        return v

    @field_validator("progress_label")
    @classmethod
    def validate_progress(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_PROGRESS_LABELS:
            raise ValueError(f"progress_label must be one of: {', '.join(VALID_PROGRESS_LABELS)}")
        return v

    @field_validator("timeline")
    @classmethod
    def validate_timeline(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_TIMELINES:
            raise ValueError(f"timeline must be one of: {', '.join(sorted(VALID_TIMELINES))}")
        return v

    @field_validator("pct_complete")
    @classmethod
    def validate_pct(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and not (0 <= v <= 100):
            raise ValueError("pct_complete must be between 0 and 100")
        return v


class WishResponse(BaseModel):
    id: str
    user_id: str
    title: str
    category: str
    why: Optional[str] = None
    progress_label: str
    timeline: Optional[str] = None
    is_manifested: bool
    pct_complete: int
    created_at: datetime

    model_config = {"from_attributes": True}
