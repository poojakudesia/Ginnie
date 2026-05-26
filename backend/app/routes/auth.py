"""
Authentication routes:
  POST /auth/signup            — email/password registration
  POST /auth/login             — email/password login → JWT
  POST /auth/oauth/google      — Google id_token exchange
  POST /auth/oauth/facebook    — Facebook access_token exchange
  POST /auth/oauth/apple       — Apple id_token exchange
  GET  /auth/me                — current user profile
  PUT  /auth/me                — update profile
"""

import httpx
import jwt as pyjwt
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
    active_techniques = [t.technique_id for t in user.techniques if t.is_active]
    return UserProfile(
        id=user.id,
        email=user.email,
        name=user.name,
        avatar_url=user.avatar_url,
        phone=user.phone,
        familiarity=user.familiarity,
        xp=user.xp,
        streak_count=user.streak_count,
        techniques=active_techniques,
    )


def _upsert_oauth_user(
    db: Session,
    *,
    email: str,
    provider: str,
    sub: str,
    name: str = "",
    picture: str = "",
) -> User:
    """Find or create a user from an OAuth provider. Returns the User."""
    user = (
        db.query(User)
        .filter((User.oauth_sub == sub) | (User.email == email))
        .first()
    )
    if user is None:
        user = User(
            email=email,
            name=name or None,
            avatar_url=picture or None,
            oauth_provider=provider,
            oauth_sub=sub,
        )
        db.add(user)
    else:
        if not user.oauth_sub:
            user.oauth_sub = sub
            user.oauth_provider = provider
        if not user.name and name:
            user.name = name
        if not user.avatar_url and picture:
            user.avatar_url = picture

    db.commit()
    db.refresh(user)
    return user


# ── Email / Password ─────────────────────────────────────────────────────────

@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    user = User(
        email=payload.email,
        name=payload.name,
        phone=payload.phone,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(subject=user.id)
    return TokenResponse(access_token=token, user=_build_user_profile(user))


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not user.hashed_password:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    update_streak(db, user)
    token = create_access_token(subject=user.id)
    return TokenResponse(access_token=token, user=_build_user_profile(user))


# ── Google OAuth ──────────────────────────────────────────────────────────────

@router.post("/oauth/google", response_model=TokenResponse)
async def google_oauth(payload: OAuthRequest, db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": payload.id_token},
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Google token.")

    data = resp.json()
    email = data.get("email", "")
    sub = data.get("sub", "")
    if not email or not sub:
        raise HTTPException(status_code=400, detail="Google token missing required fields.")

    user = _upsert_oauth_user(
        db,
        email=email,
        provider="google",
        sub=sub,
        name=data.get("name", "") or payload.name or "",
        picture=data.get("picture", "") or payload.avatar_url or "",
    )
    update_streak(db, user)
    token = create_access_token(subject=user.id)
    return TokenResponse(access_token=token, user=_build_user_profile(user))


# ── Facebook OAuth ────────────────────────────────────────────────────────────

@router.post("/oauth/facebook", response_model=TokenResponse)
async def facebook_oauth(payload: OAuthRequest, db: Session = Depends(get_db)):
    """
    Validate a Facebook user access token by calling the Graph API.
    The frontend sends payload.id_token = facebook user access_token.
    """
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://graph.facebook.com/me",
            params={
                "fields": "id,name,email,picture.width(200)",
                "access_token": payload.id_token,
            },
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Facebook token.")

    data = resp.json()
    if "error" in data:
        raise HTTPException(status_code=401, detail=data["error"].get("message", "Invalid Facebook token."))

    fb_id = data.get("id", "")
    email = data.get("email", "") or payload.email or ""
    name = data.get("name", "") or payload.name or ""
    picture = data.get("picture", {}).get("data", {}).get("url", "") or payload.avatar_url or ""

    if not fb_id:
        raise HTTPException(status_code=400, detail="Facebook token missing user ID.")

    # Facebook may not return email if user didn't grant permission
    if not email:
        # Use a synthetic email derived from Facebook ID
        email = f"fb_{fb_id}@facebook.oauth"

    user = _upsert_oauth_user(
        db,
        email=email,
        provider="facebook",
        sub=fb_id,
        name=name,
        picture=picture,
    )
    update_streak(db, user)
    token = create_access_token(subject=user.id)
    return TokenResponse(access_token=token, user=_build_user_profile(user))


# ── Apple OAuth ───────────────────────────────────────────────────────────────

@router.post("/oauth/apple", response_model=TokenResponse)
async def apple_oauth(payload: OAuthRequest, db: Session = Depends(get_db)):
    """
    Validate an Apple ID token (JWT) by verifying against Apple's public keys.
    The frontend sends payload.id_token = Apple identity_token.
    """
    # Fetch Apple's public keys
    async with httpx.AsyncClient() as client:
        resp = await client.get("https://appleid.apple.com/auth/keys")
    if resp.status_code != 200:
        raise HTTPException(status_code=503, detail="Could not fetch Apple public keys.")

    apple_keys = resp.json().get("keys", [])

    # Decode the token header to find the right key
    try:
        header = pyjwt.get_unverified_header(payload.id_token)
        kid = header.get("kid")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Apple token format.")

    # Find matching key
    matching_key = next((k for k in apple_keys if k.get("kid") == kid), None)
    if not matching_key:
        raise HTTPException(status_code=401, detail="Apple signing key not found.")

    try:
        from jwt.algorithms import RSAAlgorithm
        public_key = RSAAlgorithm.from_jwk(matching_key)
        claims = pyjwt.decode(
            payload.id_token,
            public_key,
            algorithms=["RS256"],
            audience="com.dreamlife.app",  # must match your Apple Service ID
            issuer="https://appleid.apple.com",
        )
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Apple token has expired.")
    except Exception:
        raise HTTPException(status_code=401, detail="Apple token verification failed.")

    sub = claims.get("sub", "")
    email = claims.get("email", "") or payload.email or ""

    if not sub:
        raise HTTPException(status_code=400, detail="Apple token missing subject.")

    if not email:
        email = f"apple_{sub}@apple.oauth"

    user = _upsert_oauth_user(
        db,
        email=email,
        provider="apple",
        sub=sub,
        name=payload.name or "",
        picture=payload.avatar_url or "",
    )
    update_streak(db, user)
    token = create_access_token(subject=user.id)
    return TokenResponse(access_token=token, user=_build_user_profile(user))


# ── Profile ───────────────────────────────────────────────────────────────────

@router.get("/me", response_model=UserProfile)
def get_me(current_user: User = Depends(get_current_user)):
    return _build_user_profile(current_user)


@router.put("/me", response_model=UserProfile)
def update_me(
    payload: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.name is not None:
        current_user.name = payload.name
    if payload.familiarity is not None:
        current_user.familiarity = payload.familiarity
    if payload.avatar_url is not None:
        current_user.avatar_url = payload.avatar_url
    if payload.phone is not None:
        current_user.phone = payload.phone

    if payload.techniques is not None:
        db.query(UserTechnique).filter(UserTechnique.user_id == current_user.id).delete()
        for technique_id in payload.techniques:
            db.add(UserTechnique(user_id=current_user.id, technique_id=technique_id, is_active=True))

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return _build_user_profile(current_user)
