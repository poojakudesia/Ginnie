# Dream Life — Full Stack App

Manifestation meets modern tech. A wellness app with AI guide "Aura" (powered by Claude).

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Inline styles (design-system tokens) + CSS variables |
| State | Zustand + React Query |
| Backend | Python 3.12 + FastAPI |
| Database | PostgreSQL 16 + SQLAlchemy 2.0 |
| Auth | JWT + OAuth (Google / Facebook) |
| AI | Anthropic Claude (claude-opus-4-7) with adaptive thinking |
| Infra | Docker Compose |
| Mobile | Capacitor (iOS + Android) — see [MOBILE.md](./MOBILE.md) |

## 📱 App Store / Google Play

The web app is packaged for the stores with Capacitor. Full build & submission
steps are in **[MOBILE.md](./MOBILE.md)**; store listing copy is in
[`store-assets/listing.md`](./store-assets/listing.md).

## Quick Start

### 1. Prerequisites
- Docker & Docker Compose
- An Anthropic API key

### 2. Environment setup
```bash
cp backend/.env.example backend/.env
# Edit backend/.env and set:
# ANTHROPIC_API_KEY=sk-ant-...
# SECRET_KEY=<generate with: python -c "import secrets; print(secrets.token_hex(32))">
```

### 3. Run with Docker
```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

### 4. Run locally (without Docker)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env      # set ANTHROPIC_API_KEY
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dreamlife
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Features

### 15 Screens
1. **Welcome** — Meet Aura with animated halo
2. **Sign In** — Email/password + Apple/Google/Spotify OAuth
3. **Profile Setup** — Law of Attraction familiarity (Explorer/Catalyst/Master)
4. **Wish Builder** — Build up to 3 manifestation goals
5. **Wishes Summary** — Review and manage your wishes
6. **Questions** — 4 visual question cards to personalize practice
7. **Technique Picker** — Choose from 8 manifestation techniques
8. **Tutorial** — Learn how to practice each technique
9. **Today (Home)** — Sky hero + streak + daily rituals + wishes carousel
10. **Affirmations** — Lined paper with 3 dated affirmation lines
11. **Visualization** — Guided session (intro → playing → reflect)
12. **Vision Movie** — 60-second manifestation reel library
13. **Receipts/Feed** — Journal entries + camera capture
14. **The Path** — 12-week ladder progress view
15. **Trophy Room** — XP, heatmap, anime-themed achievements

### AI Aura
- Powered by `claude-opus-4-7` with adaptive thinking
- Streaming SSE responses
- Personalized to user's wishes and journal history
- Available as a chat overlay from any screen

### Data Model
- **Users** — profile, familiarity level, XP, streak
- **Wishes** — title, category, why, timeline, progress
- **Journal Entries** — flexible JSON content per entry type
- **Streaks** — daily check-in tracking

## API Reference

See http://localhost:8000/docs (Swagger UI) when running.

Key endpoints:
- `POST /auth/signup` — register
- `POST /auth/login` — get JWT
- `GET /wishes` — your manifestation goals  
- `POST /journal` — log an entry
- `POST /aura/chat` — stream a message from Aura

## Design System

Fonts: **Instrument Serif** (display) + **Geist** (body) + **JetBrains Mono** (labels)

Palettes: **petal** (default, pink-rose) · sage (forest green) · sand (warm clay) · dusk (plum/violet)

The app renders inside a 372×808px iOS device frame on desktop, full-screen on mobile.
