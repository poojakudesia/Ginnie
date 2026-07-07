from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/dreamlife"

    # Security
    SECRET_KEY: str = "change-me-in-production-this-must-be-at-least-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Anthropic / Aura AI
    ANTHROPIC_API_KEY: str = ""

    # Google OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None

    # Apple OAuth
    APPLE_CLIENT_ID: Optional[str] = None
    APPLE_TEAM_ID: Optional[str] = None
    APPLE_KEY_ID: Optional[str] = None
    APPLE_PRIVATE_KEY: Optional[str] = None

    # Frontend
    FRONTEND_URL: str = "http://localhost:5173"
    # Optional regex to allow additional production origins (e.g. your web host)
    CORS_ORIGIN_REGEX: Optional[str] = None

    # XP / Gamification constants
    XP_PER_JOURNAL_ENTRY: int = 10
    XP_PER_TECHNIQUE_SESSION: int = 15
    XP_PER_STREAK_DAY: int = 5
    XP_PER_WISH_MANIFEST: int = 50


settings = Settings()
