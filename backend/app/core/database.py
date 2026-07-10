from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from typing import Generator

from app.core.config import settings


# Some hosts (Render, Heroku) hand out DATABASE_URLs beginning with the legacy
# "postgres://" scheme, which SQLAlchemy 2.0 no longer recognizes. Normalize it.
_db_url = settings.DATABASE_URL
if _db_url.startswith("postgres://"):
    _db_url = _db_url.replace("postgres://", "postgresql://", 1)

engine = create_engine(
    _db_url,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator:
    """FastAPI dependency that provides a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables() -> None:
    """Create all database tables. Called on app startup."""
    # Import all models so they are registered with Base.metadata
    from app.models import user, wish, journal, technique  # noqa: F401
    Base.metadata.create_all(bind=engine)
    _ensure_columns()


def _ensure_columns() -> None:
    """Lightweight dev auto-migration: add columns that were introduced after
    a table was first created. PostgreSQL supports ADD COLUMN IF NOT EXISTS."""
    statements = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(30)",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_screen VARCHAR(50)",
    ]
    with engine.begin() as conn:
        for stmt in statements:
            try:
                conn.execute(text(stmt))
            except Exception:
                # Non-fatal: log-and-continue so startup never breaks on this
                pass
