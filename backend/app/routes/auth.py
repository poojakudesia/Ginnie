"""
Authentication routes:
  POST /auth/signup       — email/password registration
  POST /auth/login        — email/password login → JWT
  POST /auth/oauth/google — Google OAuth id_token exchange
  GET  /auth/me           — current user profile
  PUT  /auth/me           — update profile
"""

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)
from app.models.user import User
from app.models.technique import UserTechnique
from app.schemas.auth import (
    SignupRequest,
    LoginRequest,
    OAuthRequest,
    TokenResponse,
    UserProfile,
    UpdateProfileRequest,
)
from app.services.user_service import update_streak

router = APIRouter(prefix="/auth", tags=["auth"])


def _build_user_profile(user: User) -> UserProfile:
    """Serialize a User ORM object to UserProfile schema."""
    active_techniques = [
        t.technique_id for t in user.techniques if t.is_active
    ]
    return UserProfile(
        id=user.id,
        email=user.email,
        name=user.name,
        avatar_url=user.avatar_url,
        familiarity=user.familiarity,
        xp=user.xp,
        streak_count=user.streak_count,
        techniques=active_techniques,
    )


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    """Register a new user with email and password."""
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(
        email=payload.email,
        name=payload.name,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(subject=user.id)
    return TokenResponse(access_token=token, user=_build_user_profile(user))


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate with email and password; returns a JWT."""
    user = db.query(User).filter(User.email == payload.email).first()

    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    update_streak(db, user)
    token = create_access_token(subject=user.id)
    return TokenResponse(access_token=token, user=_build_user_profile(user))


@router.post("/oauth/google", response_model=TokenResponse)
async def google_oauth(payload: OAuthRequest, db: Session = Depends(get_db)):
    """
    Exchange a Google ID token for a Dream Life JWT.
    Verifies the Google id_token, then upserts the user.
    """
    # Verify the Google ID token via Google's tokeninfo endpoint
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": payload.id_token},
        )

    if resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token.",
        )

    google_data = resp.json()
    email: str = google_data.get("email", "")
    sub: str = google_data.get("sub", "")
    google_name: str = google_data.get("name", "") or payload.name or ""
    picture: str = google_data.get("picture", "") or payload.avatar_url or ""

    if not email or not sub:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google token missing required fields.",
        )

    # Upsert user
    user = (
        db.query(User)
        .filter((User.oauth_sub == sub) | (User.email == email))
        .first()
    )

    if user is None:
        user = User(
            email=email,
            name=google_name or None,
            avatar_url=picture or None,
            oauth_provider="google",
            oauth_sub=sub,
        )
        db.add(user)
    else:
        # Patch fields if needed
        if not user.oauth_sub:
            user.oauth_sub = sub
            user.oauth_provider = "google"
        if not user.name and google_name:
            user.name = google_name
        if not user.avatar_url and picture:
            user.avatar_url = picture

    db.commit()
    db.refresh(user)
    update_streak(db, user)

    token = create_access_token(subject=user.id)
    return TokenResponse(access_token=token, user=_build_user_profile(user))


@router.get("/me", response_model=UserProfile)
def get_me(current_user: User = Depends(get_current_user)):
    """Return the authenticated user's profile."""
    return _build_user_profile(current_user)


@router.put("/me", response_model=UserProfile)
def update_me(
    payload: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update the authenticated user's profile fields."""
    if payload.name is not None:
        current_user.name = payload.name
    if payload.familiarity is not None:
        current_user.familiarity = payload.familiarity
    if payload.avatar_url is not None:
        current_user.avatar_url = payload.avatar_url

    # Update technique preferences
    if payload.techniques is not None:
        # Remove all existing techniques and rebuild
        db.query(UserTechnique).filter(
            UserTechnique.user_id == current_user.id
        ).delete()
        for technique_id in payload.techniques:
            ut = UserTechnique(
                user_id=current_user.id,
                technique_id=technique_id,
                is_active=True,
            )
            db.add(ut)

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return _build_user_profile(current_user)
