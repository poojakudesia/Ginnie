import uuid
from datetime import datetime, timezone
from typing import Optional, Any

from sqlalchemy import DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.core.database import Base


class JournalEntry(Base):
    __tablename__ = "journal_entries"

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
    wish_id: Mapped[Optional[str]] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("wishes.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    entry_type: Mapped[str] = mapped_column(
        SAEnum(
            "affirm",
            "viz",
            "sign",
            "movie",
            "gratitude",
            "photo",
            "script",
            "369",
            "555",
            name="entry_type_enum",
        ),
        nullable=False,
    )

    # Flexible JSON content — structure varies by entry_type:
    # affirm: {"affirmations": ["I am...", ...]}
    # viz: {"description": "...", "feelings": "..."}
    # sign: {"observation": "...", "meaning": "..."}
    # movie: {"title": "...", "scenes": [...]}
    # gratitude: {"items": ["...", ...]}
    # photo: {"photo_url": "...", "caption": "..."}
    # script: {"text": "..."}
    # 369: {"morning": "...", "afternoon": "...", "night": "..."}
    # 555: {"affirmation": "...", "count": 55}
    content: Mapped[Optional[Any]] = mapped_column(JSONB, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="journal_entries")  # noqa: F821
    wish: Mapped[Optional["Wish"]] = relationship(  # noqa: F821
        "Wish", back_populates="journal_entries"
    )

    def __repr__(self) -> str:
        return f"<JournalEntry id={self.id} type={self.entry_type}>"
