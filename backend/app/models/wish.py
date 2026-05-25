import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import String, Boolean, Integer, DateTime, ForeignKey, Enum as SAEnum, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class Wish(Base):
    __tablename__ = "wishes"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(String(500), nullable=False)
    category: Mapped[str] = mapped_column(
        SAEnum(
            "health",
            "wealth",
            "relationships",
            "career",
            "growth",
            "spirituality",
            name="wish_category_enum",
        ),
        nullable=False,
    )
    why: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    progress_label: Mapped[str] = mapped_column(
        SAEnum(
            "Not started",
            "In progress",
            "Close",
            name="progress_label_enum",
        ),
        nullable=False,
        default="Not started",
    )
    timeline: Mapped[Optional[str]] = mapped_column(
        SAEnum(
            "3 months",
            "6 months",
            "1 year",
            "3 years",
            name="timeline_enum",
        ),
        nullable=True,
    )
    is_manifested: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    pct_complete: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="wishes")  # noqa: F821
    journal_entries: Mapped[list["JournalEntry"]] = relationship(  # noqa: F821
        "JournalEntry", back_populates="wish"
    )

    def __repr__(self) -> str:
        return f"<Wish id={self.id} title={self.title!r}>"
