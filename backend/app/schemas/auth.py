import re
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None
    phone: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class OAuthRequest(BaseModel):
    """Used for Google / Apple / Facebook sign-in callbacks."""
    provider: str        # "google" | "apple" | "facebook"
    id_token: str        # Google id_token / Apple id_token / Facebook access_token
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    email: Optional[str] = None   # Apple sometimes sends email in the JWT payload


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserProfile"


class UserProfile(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    familiarity: Optional[str] = None
    xp: int
    streak_count: int
    techniques: list[str] = []

    model_config = {"from_attributes": True}


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    familiarity: Optional[str] = None
    techniques: Optional[list[str]] = None
    avatar_url: Optional[str] = None
    phone: Optional[str] = None

    @field_validator("familiarity")
    @classmethod
    def validate_familiarity(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ("explorer", "catalyst", "master"):
            raise ValueError("familiarity must be explorer, catalyst, or master")
        return v


# Resolve forward reference
TokenResponse.model_rebuild()
