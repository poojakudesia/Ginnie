from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base

# Valid technique IDs
TECHNIQUE_IDS = ["viz", "affirm", "movie", "script", "gratitude", "369", "555", "meditate"]


class UserTechnique(Base):
    """Tracks which manifestation techniques a user has enabled."""

    __tablename__ = "user_techniques"

    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    technique_id: Mapped[str] = mapped_column(
        String(50),
        primary_key=True,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="techniques")  # noqa: F821

    def __repr__(self) -> str:
        return f"<UserTechnique user={self.user_id} technique={self.technique_id} active={self.is_active}>"
