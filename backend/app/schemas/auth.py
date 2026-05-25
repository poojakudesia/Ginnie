from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class OAuthRequest(BaseModel):
    """Used for Google / Apple sign-in callbacks."""
    provider: str  # "google" | "apple"
    id_token: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserProfile"


class UserProfile(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    familiarity: Optional[str] = None
    xp: int
    streak_count: int
    techniques: list[str] = []

    model_config = {"from_attributes": True}


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    familiarity: Optional[str] = None
    techniques: Optional[list[str]] = None  # list of technique_ids to mark active
    avatar_url: Optional[str] = None

    @field_validator("familiarity")
    @classmethod
    def validate_familiarity(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ("explorer", "catalyst", "master"):
            raise ValueError("familiarity must be explorer, catalyst, or master")
        return v


# Resolve forward reference
TokenResponse.model_rebuild()
