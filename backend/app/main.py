"""Dream Life — FastAPI Application Entry Point"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_tables
from app.routes import auth, wishes, journal, aura

app = FastAPI(
    title="Dream Life API",
    description="Manifestation meets modern tech. Powered by Aura (Claude).",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        # Capacitor native app origins (iOS / Android WebView)
        "capacitor://localhost",
        "ionic://localhost",
        "http://localhost",
        "https://localhost",
    ],
    # Allow any extra origins configured for production (comma-separated)
    allow_origin_regex=settings.CORS_ORIGIN_REGEX or None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(wishes.router)
app.include_router(journal.router)
app.include_router(aura.router)


# ── Startup ───────────────────────────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    """Create database tables on first launch."""
    create_tables()


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok", "service": "dream-life-api"}


@app.get("/", tags=["meta"])
def root():
    return {
        "app": "Dream Life API",
        "docs": "/docs",
        "health": "/health",
    }
