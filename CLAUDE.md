# CLAUDE.md — Dinero Sabio

This file tells Claude Code everything it needs to know about this project so every session starts with full context. Update it as the project evolves.

## Teaching Convention

Diego is building this project to learn while shipping. **Always explain the WHY behind every code decision**, not just the what. When introducing a pattern, include a brief rationale — especially for things that touch security, data integrity, performance, or are non-obvious to a junior dev. This makes every line of code interview-explainable. Skip the obvious; focus on the surprising.

### Teaching Style (important)

**Do not write code for Diego. Guide him to write it himself using a quiz/Socratic approach:**

- Ask guiding questions and give hints rather than providing the answer
- Explain concepts first, then ask Diego to apply them
- Give multiple tasks at once when they're independent
- Confirm correctness when he pastes his attempt, then explain any fixes before moving on
- Be concise — no filler words, no restating what was just said
- Save the WHY for non-obvious things; skip explaining `useState` basics etc. once he's demonstrated he knows them

---

## Project Overview

**Dinero Sabio** is a full-stack gamified financial education platform targeting first-generation Latino/Spanish-speaking investors with low digital literacy. The core user loop:

1. **EdTech Engine** — bilingual bite-sized lessons with scenario-based quizzes; passing a quiz awards mock currency (e.g. +$500)
2. **Trading Engine** — users spend earned mock cash to buy/sell from 10 curated assets (VOO, AAPL, MSFT, etc.) via ACID-compliant DB transactions
3. **AI Mentor** — a persistent streaming chatbot side drawer explaining financial concepts with culturally relevant analogies

---

## Architecture: Hybrid Monorepo

Two services, one repo. Next.js handles all user-facing CRUD and auth. FastAPI handles only the AI Mentor streaming endpoint (Python is a better fit for the Anthropic SDK + future ML work).

```
DineroSabio-New/
├── CLAUDE.md
├── README.md
├── docker-compose.yml        ← spins up Postgres + Redis + ai-service locally
├── frontend/                 ← Next.js app (runs on :8080)
│   ├── prisma/schema.prisma  ← DB schema (source of truth)
│   ├── prisma.config.ts
│   ├── src/
│   │   ├── app/              ← Next.js App Router pages
│   │   ├── components/       ← React components
│   │   └── lib/              ← db.ts singleton, helpers
│   └── package.json
└── backend/                  ← FastAPI AI service (Python, runs on :8000)
    ├── app/
    │   ├── main.py           ← FastAPI app + CORS
    │   ├── api/chat.py       ← POST /api/chat streaming endpoint
    │   └── core/config.py    ← Pydantic settings (reads .env)
    ├── requirements.txt
    ├── Dockerfile
    └── .env.example
```

---

## Tech Stack & Key Decisions

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend framework | Next.js 16 (App Router) | Server Components for zero-bundle data fetching; layout system for shared auth guard + header |
| Auth | Clerk | Managed auth — sign-in/sign-up UI, session tokens, webhooks, zero config |
| ORM | Prisma 7 + `@prisma/adapter-pg` | Type-safe queries; pg adapter required for connection pooling on serverless |
| Database | PostgreSQL (Neon) | ACID transactions for the trading engine; relational model fits course→lesson hierarchy |
| AI service | FastAPI (Python) | Anthropic Python SDK + streaming; Python is the right language for AI/ML services |
| AI model | Claude Haiku (`claude-haiku-4-5-20251001`) | Fast and cheap for a chatbot; upgrade to Sonnet for more nuanced responses |
| Styling | Tailwind CSS v4 + shadcn/ui | Utility-first with project-specific design tokens in `globals.css` |
| Validation | Zod (TS) + Pydantic (Python) | Runtime validation at all data boundaries in both services |
| i18n | next-intl | Bilingual EN/ES routing; all DB models have `_es` suffix fields |
| Caching | Redis (via Docker Compose) | Cache asset prices with TTL; prevents hammering the market data API on every page load |
| Local dev | Docker Compose | `docker compose up` starts Postgres + Redis + ai-service |
| React | React 19 + React Compiler | `babel-plugin-react-compiler` enabled for automatic memoization |

---

## Dev Workflow

### Next.js frontend (`frontend/`)
```bash
npm run dev                                    # Dev server on :8080
npm run build                                  # TypeScript check + production build
npm run lint                                   # ESLint

npx prisma studio                              # GUI database browser
npx prisma db push                             # Push schema changes (no migration file)
npx prisma migrate dev --name <description>    # Create named migration + push
npx prisma db seed                             # Re-run seed.ts
npx prisma generate                            # Regenerate client after schema changes
```

### FastAPI backend (`backend/`)
```bash
# First time setup
python -m venv .venv
.venv/Scripts/activate          # Windows
source .venv/bin/activate       # Mac/Linux
pip install -r requirements.txt

# Run dev server
uvicorn app.main:app --reload --port 8000

# API docs auto-generated at:
# http://localhost:8000/docs      (Swagger UI)
# http://localhost:8000/redoc     (ReDoc)
```

### Infrastructure (from repo root)
```bash
docker compose up postgres redis    # Just DB + Redis (run Next.js and FastAPI manually)
docker compose up                   # Everything including ai-service container
docker compose down                 # Stop all
```

### Migration Gotchas (learned the hard way)

- **Always use `migrate dev` for schema changes — never `db push`.** `db push` mutates the DB without writing a migration file, so the migration history silently falls behind. The next `migrate dev`/`reset` replays only on-disk migrations and *drops every `db push`-only column* (this is how we lost `mockBalance`, `clerkId`, and the Trading models on a reset).
- **Prisma 7: connection URLs live only in `prisma.config.ts`, not `schema.prisma`.** `url` is banned in the schema datasource block; the app connects via the pg `adapter` passed to `PrismaClient`.
- **Migrations must use a DIRECT (non-pooled) Neon connection.** The pooler (`...-pooler...` host) breaks Prisma's session-scoped `pg_advisory_lock` → `P1002` timeout. Fix: `prisma.config.ts` `datasource.url = env("DIRECT_URL")` (host with `-pooler` removed); the app keeps using pooled `DATABASE_URL` through the adapter. `DIRECT_URL` lives in `frontend/.env`.
- **Seed imports the runtime `pg` package (`import pg from 'pg'`), never `@types/pg`** — the `@types/*` package is type-only and has zero runtime code.

---

## Architecture Patterns

### Server Components by Default (Next.js)
All pages and layouts are async Server Components. Only add `"use client"` when a component needs browser APIs, event handlers, or React state. The AI Mentor drawer and quiz interaction components are Client Components.

### Data Access (Next.js)
- Queries live in Server Components or `"use server"` Server Actions — never in Client Components
- Use `db.model.findUnique()` for single-record lookups, not `findMany()[0]`
- Wrap multi-step mutations in `db.$transaction([...])` for atomicity — critical for the trading engine (debit wallet + update holding in one transaction)

### Auth Pattern (Next.js)
- `dashboard/layout.tsx` is the sole auth gate — calls Clerk's `auth()` server-side and redirects unauthenticated users
- In Server Components, get the current user with `currentUser()`, then look up the local DB `User` by `clerkId`
- **Never trust client-supplied user IDs for mutations** — always derive `userId` from the Clerk session

### Streaming Pattern (FastAPI ↔ Next.js)
- The AI Mentor Client Component POSTs to `NEXT_PUBLIC_AI_SERVICE_URL/api/chat`
- FastAPI returns a `StreamingResponse` with `media_type="text/plain"`
- The client reads the response with `ReadableStream` + `TextDecoder`, appending chunks to the last message in state
- Streaming cursor: show a blinking `<span>` while `streaming === true` and the last message role is `"assistant"`

### CORS
FastAPI only allows requests from `ALLOWED_ORIGIN` (dev: `http://localhost:8080`). In production, set this to the deployed Next.js domain.

### Bilingual Pattern
- Every DB model has parallel `_es` suffix fields (e.g., `courseTitle`, `courseTitle_es`)
- `next-intl` handles locale detection and routing
- The FastAPI AI service accepts a `language` field in the request body and switches between English and Spanish system prompts

### Design Tokens
Custom brand colors in `globals.css` under `@theme inline`:
- `bg-theme-green` / `bg-theme-green-dark` — primary CTA green
- `bg-dashboard-bg` / `bg-dashboard-bg-dark` — header background
- `bg-easygreen` / `bg-mediumyellow` / `bg-hardred` — difficulty badge colors

---

## Current State (as of 2026-08-04)

### Done ✅
- Clerk auth: sign-up, sign-in, sign-out, protected dashboard routes
- **Clerk webhook** (`/api/webhooks/clerk`): Svix-verified handler syncing `user.created`/`user.updated` (idempotent `upsert` on `clerkId`) and `user.deleted` (`deleteMany`); public in `proxy.ts` route matcher; verified live via ngrok → 200 + DB row
- PostgreSQL + Prisma schema: full EdTech models + full Trading Engine models (Asset, Holding, Trade, TradeType enum)
- `User.mockBalance` — the mock wallet quiz rewards credit into
- `Lesson.currencyReward` — per-lesson configurable reward (default $1000; reward is granted on lesson completion, not per quiz)
- `User.clerkId` — links local DB user to the Clerk auth user (needed for webhook)
- Dashboard course grid with color-coded difficulty/time/lesson-count badges
- Course detail page: renders title + lesson list
- **Quiz flow**: 5-question scenario quiz → `awardLessonReward` Server Action (session-derived identity, DB-level replay protection, atomic payout) → review screen
- **Trading engine (server)** — `src/app/actions/trading.ts`:
  - `Asset.currentPrice` (`Decimal(12,2)`), seeded for all 10 assets. It is a **cache** — a live price API + Redis refresh job comes later, so no network I/O ever happens inside a transaction.
  - `buyAsset(assetId, amountInDollars)` — buy in dollars
  - `sellAsset(assetId, shares)` — sell an explicit share count
  - `sellAssetPercent(assetId, 50 | 100)` — resolves the share count from the `Holding` row *inside* the transaction
  - `executeSell(tx, userId, assetId, shares, price)` — private shared body of every sell
  - CHECK constraints in the migration: `User.mockBalance >= 0`, `Holding.shares >= 0`
  - Smoke-tested end to end; the `Trade` ledger reconciles against `mockBalance` to the cent
- **Portfolio page** (`/dashboard/portfolio`) — the buy *and* sell surface. Server Component fetches assets + the session user's holdings; `AssetCard` Client Component owns per-card input state, `useTransition` pending state, and auto-clearing result messages.
- FastAPI AI service scaffold: POST `/api/chat` streaming endpoint with EN/ES system prompts
- Docker Compose: Postgres + Redis + ai-service

### In Progress 🔨
- **AiMentor Client Component** (`components/dashboard/AiMentor.tsx`) — drawer, streaming fetch, and message rendering all work. Remaining before this moves to Done:
  - 🔴 **`decoder.decode(value, { stream: true })`** — currently missing the `stream` flag. Chunks are split on arbitrary *byte* boundaries, and `á é í ó ú ñ ¿ ¡` are 2-byte UTF-8, so a boundary landing mid-character emits `` instead. `{ stream: true }` buffers the trailing incomplete bytes for the next chunk. Rare in English, constant in Spanish — this breaks half the product.
  - 🟠 **Surface errors in the UI** — the `catch` only calls `console.error`, so when the FastAPI service isn't running (most of the time in dev, it's a separate process) the input just clears and nothing happens. Needs an error state in the drawer, worded for a non-technical user, not "Network response was not ok".
  - 🟡 **Blinking cursor** — spec'd under Streaming Pattern below but never built. Between Send and the first token the drawer is static, which reads as a hang. Render a blinking `<span>` while `isStreaming === true` and the last message's role is `"assistant"`.
  - **Empty state** — first open shows a blank gray box. A greeting + 2–3 tappable example questions matters a lot for the low-digital-literacy audience.
  - **`sendMessage` guards `input.trim()` but takes a `message` param** — same value today, so the bug is dormant rather than absent. Guard the parameter.
  - **`AbortController`** — closing the drawer mid-stream leaves the fetch running and still calling `setMessages`; burns Anthropic tokens for a response nobody reads.
  - **Accessibility** — the close button is an icon with no accessible name (`aria-label`); the message list should be `role="log"` + `aria-live="polite"`.
  - **Known gap, blocked:** the `language` prop is never passed — `dashboard/layout.tsx` renders `<AiMentor />` bare, so it always defaults to `"en"` and the FastAPI Spanish system prompt is unreachable. Unblocks with the `next-intl` locale work below.

### Planned 📋
- **Gain/loss on the portfolio page**: `Holding` stores only `shares`, so cost basis has to be derived from the `Trade` ledger — query design not started
- **Live prices**: fetch real quotes into `Asset.currentPrice` from a separate refresh job, cached in Redis with a TTL
- **AiMentor component**: floating chat drawer, streaming fetch, blinking cursor
- **EN ↔ ES language switching**: wire Header toggle to `next-intl` locale; render `_es` DB fields for Spanish users
- **Recharts**: portfolio performance chart on the Portfolio page
- **GitHub Actions CI**: lint + type-check on every PR

---

## Environment Variables

### `frontend/.env`
```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000
```

### `backend/.env` (copy from `backend/.env.example`)
```
ANTHROPIC_API_KEY=sk-ant-...
ALLOWED_ORIGIN=http://localhost:8080
```

---

## Conventions

- **Route folders**: camelCase inside brackets (`[courseId]`, not `[course-id]`)
- **Component files**: PascalCase (`AiMentor.tsx`, `DashboardHeader.tsx`)
- **Exports**: default export for pages/layouts/components; named exports for utilities
- **Props**: inline `interface Props` at the top of each page/component
- **Types**: use Prisma generated types for DB objects (`Prisma.CourseGetPayload`); avoid `any`
- **Server Actions**: collect in `src/app/actions/` named by domain (`trading.ts`, `quiz.ts`, `user.ts`)
- **No comments explaining WHAT** — only add one for a non-obvious WHY (hidden constraint, workaround, security invariant)

---

## Security Notes

- All mutations derive `userId` from the Clerk server-side session — never from the request body
- Trading Server Actions use `db.$transaction` to prevent race conditions
- All external inputs (form data, route params) are validated with Zod before reaching Prisma
- FastAPI only streams to the configured `ALLOWED_ORIGIN` (CORS guard)
- `ANTHROPIC_API_KEY` lives only in the FastAPI backend — never exposed to the browser