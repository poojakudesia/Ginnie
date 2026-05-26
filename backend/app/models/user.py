import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import String, Integer, DateTime, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    hashed_password: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)

    # OAuth fields
    oauth_provider: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True
    )  # "google" | "apple" | None
    oauth_sub: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)

    # Onboarding / profile
    familiarity: Mapped[Optional[str]] = mapped_column(
        SAEnum("explorer", "catalyst", "master", name="familiarity_enum"),
        nullable=True,
    )

    # Gamification
    xp: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    streak_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    last_active: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Relationships
    wishes: Mapped[list["Wish"]] = relationship(  # noqa: F821
        "Wish", back_populates="user", cascade="all, delete-orphan"
    )
    journal_entries: Mapped[list["JournalEntry"]] = relationship(  # noqa: F821
        "JournalEntry", back_populates="user", cascade="all, delete-orphan"
    )
    techniques: Mapped[list["UserTechnique"]] = relationship(  # noqa: F821
        "UserTechnique", back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email}>"
