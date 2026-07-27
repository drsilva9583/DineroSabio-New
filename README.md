# Dinero Sabio

A gamified, bilingual financial education simulator for first-generation Latino investors.

Dinero Sabio bridges the gap between *learning* and *practicing* investing for Spanish-speaking users who have never opened a brokerage account. Users complete bite-sized lessons in English or Spanish, earn mock currency by passing quizzes, and practice trading real-world assets — all explained through culturally relevant analogies.

---

## Features

| Feature | Status |
|---|---|
| Bilingual EdTech engine — lessons, quizzes, tips | ✅ Live |
| Gamified mock currency rewards for quiz completion | ✅ Schema ready |
| ACID-compliant mock trading (buy/sell 10 major assets) | 🔨 In Progress |
| Streaming AI Mentor chatbot (FastAPI + Anthropic) | 🔨 In Progress |
| Portfolio page with Recharts visualization | 📋 Planned |
| EN ↔ ES language toggle wired to next-intl | 📋 Planned |

---

## Architecture

```
┌─────────────────────────────────┐   ┌──────────────────────────────┐
│  Next.js 16 (frontend/)          │   │  FastAPI (backend/)           │
│                                 │   │                              │
│  • Clerk auth + protected routes│   │  POST /api/chat              │
│  • Course / Lesson / Quiz UI    │──▶│  • Anthropic streaming SDK   │
│  • Trading buy/sell forms       │   │  • EN + ES system prompts    │
│  • Portfolio dashboard          │   │  • Pydantic validation        │
│  • Prisma ORM → PostgreSQL      │   └──────────────────────────────┘
│  • Redis asset price caching    │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  PostgreSQL                     │
│                                 │
│  Course → Lesson → Quiz         │
│  User.mockBalance               │
│  Asset, Holding, Trade (ACID)   │
└─────────────────────────────────┘
```

The trading engine executes every buy/sell as a single PostgreSQL transaction — atomically debiting the user's mock wallet and updating their holdings so partial states are impossible even under concurrent requests.

The AI Mentor runs as a separate FastAPI microservice so the Anthropic API key never touches the browser and the Python AI ecosystem stays available for future ML features.

---

## Tech Stack

**Frontend / Full-stack** (`frontend/`)
- Next.js 16 — App Router, React Server Components, React 19 + React Compiler
- Clerk — authentication, session management, protected routes
- Prisma 7 + PostgreSQL — type-safe ORM with `@prisma/adapter-pg` connection pooling
- Tailwind CSS v4 + shadcn/ui — design tokens + accessible component primitives
- Zod — runtime schema validation at all data boundaries
- next-intl — bilingual EN/ES routing

**AI Service** (`backend/`)
- FastAPI — async Python web framework with auto-generated OpenAPI docs
- Anthropic Python SDK — streaming `claude-haiku-4-5-20251001` responses
- Pydantic Settings — typed configuration from environment variables

**Infrastructure**
- Redis — asset price caching with TTL
- Docker Compose — one command to start Postgres + Redis + AI service locally

---

## Local Setup

The app runs as **two processes** (Next.js frontend + FastAPI AI service) in two terminals. The database is hosted on **Neon (cloud Postgres)**, so no local Postgres or Docker is required to develop. Redis is only needed once price caching lands (not yet).

### 1. Clone

```bash
git clone <repo-url> && cd DineroSabio-New
```

### 2. Frontend — Next.js (`frontend/`)

```bash
cd frontend
npm install

# Create frontend/.env with:
#   DATABASE_URL           → Neon connection string
#   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY / CLERK_SECRET_KEY
#   NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000

npx prisma generate   # generate the type-safe Prisma client
npx prisma db push    # sync schema to Neon (first run / after schema changes)
npx prisma db seed    # load the 10 assets + courses/lessons
npm run dev           # → http://localhost:8080
```

### 3. Backend — FastAPI AI service (`backend/`)

In a second terminal:

```bash
cd backend

# Copy the env template and add your real ANTHROPIC_API_KEY
cp .env.example .env            # Windows PowerShell: Copy-Item .env.example .env

# Create + activate a virtualenv
python -m venv .venv
source .venv/bin/activate       # Windows PowerShell: .venv\Scripts\Activate.ps1

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# Swagger docs → http://localhost:8000/docs
# Health check → http://localhost:8000/health
```

Get an API key at [console.anthropic.com](https://console.anthropic.com) → **API Keys** (add billing credits first — Haiku is very cheap). The key lives only in `backend/.env` and never reaches the browser.

### 4. (Optional) Docker infrastructure

`docker compose up postgres redis` is available if you'd rather run Postgres/Redis locally instead of Neon — but the default setup above needs neither.

---

## Database Schema

```
User ──── UserLessonProgress ──── Lesson ──── Course
  │                                  ├── Quiz  (currencyReward → User.mockBalance)
  │                                  ├── Tip
  │                                  ├── Example
  │                                  └── Calculator
  │
  ├── Holding ──── Asset  (VOO, AAPL, MSFT, AMZN, GOOGL, BRK.B, SPY, QQQ, VTI, BND)
  └── Trade ───── Asset   (append-only audit log)
```

---

## Project Structure

```
DineroSabio-New/
├── docker-compose.yml
├── frontend/               ← Next.js app (runs on :8080)
│   ├── prisma/schema.prisma
│   └── src/
│       ├── app/           ← App Router pages + layouts
│       ├── components/    ← React UI components
│       └── lib/           ← Prisma singleton, helpers
└── backend/               ← FastAPI AI service
    └── app/
        ├── main.py        ← FastAPI entry point + CORS
        ├── api/chat.py    ← Streaming /api/chat endpoint
        └── core/config.py ← Pydantic settings
```

---

Built by [Diego Silva](https://github.com/diegos9583)