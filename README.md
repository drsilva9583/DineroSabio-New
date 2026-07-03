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

```bash
# 1. Clone
git clone <repo-url> && cd DineroSabio-New

# 2. Start infrastructure (Postgres + Redis + AI service)
cp backend/.env.example backend/.env   # add your ANTHROPIC_API_KEY
docker compose up -d

# 3. Set up the Next.js frontend
cd my-saas
npm install
# Create .env with DATABASE_URL, CLERK keys, and NEXT_PUBLIC_AI_SERVICE_URL
npx prisma db push
npx prisma db seed
npm run dev   # → http://localhost:8080

# 4. (Optional) Run FastAPI outside Docker for hot-reload
cd ../backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# → http://localhost:8000/docs
```

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
├── frontend/               ← Next.js app (rename to frontend/)
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