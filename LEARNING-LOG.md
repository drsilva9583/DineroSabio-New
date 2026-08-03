# Learning Log — Dinero Sabio

Review these before interviews. Newest first.

---

## 2026-08-03 — Trading Engine Server Actions

**Built:**
- `Asset.currentPrice` (Decimal 12,2) + migration; seeded prices for all 10 assets.
- [trading.ts](frontend/src/app/actions/trading.ts): `buyAsset(assetId, amountInDollars)` and `sellAsset(assetId, shares)`.
- Overdraft guard moved into the WHERE: `updateMany` + `gte` + `count === 0` check.
- CHECK constraints via hand-written migration: `mockBalance >= 0`, `Holding.shares >= 0`.

**Review:**
- Atomic `decrement` prevents lost updates, NOT overdraft — the stale app-level check is the TOCTOU gap.
- `$transaction([])` can't branch; interactive form needed, and rollback = `throw` (use `tx`, never `db`).
- Buy stores `totalValue` = exact dollars debited; recomputed `shares × price` would stop the ledger reconciling.
- Sell derives proceeds, so round explicitly `ROUND_DOWN` — Postgres rounds half-up and leaks money every sale.
- `Decimal` is a class instance: won't survive Server Action serialization — return money as strings.

**Q&A — questions I was asked:**
- **Q:** Const price map or a `currentPrice` column? → **A:** Column — a live API later would put network I/O inside the transaction.
- **Q:** Buy by shares or dollars? → **A:** Dollars; users know their balance, not share counts. Sell by shares/percent.
- **Q:** Does atomic `decrement` prevent the -$600 overdraft? → **A:** No (my misconception) — the *check* was still a stale read outside the write.
- **Q:** Which method takes a non-unique `where`? → **A:** `updateMany`; it returns `{ count }` instead of throwing P2025.
- **Q:** `upsert` on the sell path? → **A:** No — `create` would invent a position the user never bought. Use `updateMany`.
- **Q:** Why a migration file instead of running the ALTER in the Neon console? → **A:** `migrate reset` replays only on-disk migrations; out-of-band DDL silently vanishes.

---

## 2026-07-31 — Review Screen + Options Shuffle

**Built:**
- [Quiz.tsx](frontend/src/components/dashboard/Quiz.tsx): review list on a 5/5 run — pure render off `questions`, no new state.
- DRY'd the review list to one copy after the message ternary (was duplicated in two passed-branches).
- Added Fisher–Yates `shuffle`; moved it from `useMemo` to `useState` + `useEffect` to kill a hydration mismatch.

**Review:**
- On a perfect run, selected answer == `correctAnswer` for all — so review needs no tracked-picks state.
- `useMemo` runs on BOTH server and client; its cache doesn't cross the boundary — can't stabilize `Math.random()`.
- Effects never run during SSR: render raw order on both sides, then shuffle client-only after mount.
- `arr.sort(() => Math.random()-0.5)` is a biased shuffle; Fisher–Yates is uniform.
- Duplicated JSX is a maintenance hazard — future tweaks must be made twice or they drift.

**Q&A — questions I was asked:**
- **Q:** Does the review screen need new state for the user's picks? → **A:** No — on a 5/5 the picks equal `correctAnswer`; render off `questions`.
- **Q:** Where should the shuffle live — seed or component? → **A:** Component, for per-session variety; seed shuffle freezes one order forever.
- **Q:** Why did `useMemo` still cause a hydration error? → **A:** It runs on server and client separately; `Math.random()` differs, memo doesn't transfer.
- **Q:** How do you make client-only randomness safe for SSR? → **A:** Shuffle in `useEffect` (never runs on server), seed state with the raw order.

---

## 2026-07-31 — Seed Content + Navbar Balance

**Built:**
- [seed.ts](frontend/prisma/seed.ts): data-driven rewrite — 3 courses × 3 lessons × 5 questions, 4 options each, 10 trading assets.
- Added a `validate()` guard that throws pre-insert if any quiz breaks the winnable invariant (5 Qs, 4 unique options, `correctAnswer` ∈ options, both langs).
- [Header.tsx](frontend/src/components/dashboard/Header.tsx): server-side reads `mockBalance` via `clerkId`, formats with `Intl.NumberFormat`.
- [quiz.ts](frontend/src/app/actions/quiz.ts): `revalidatePath("/dashboard")` after the transaction so the balance refreshes with no reload.

**Review:**
- Prisma `Decimal` returns a Decimal.js *object*, not a JS number — `Number()` it, then `Intl.NumberFormat` for `$1,000.00`.
- `revalidatePath` inside a Server Action re-renders the *current* route tree (incl. shared layouts) client-side — no full reload.
- A Server Component can query Prisma directly; a Client Component can't — read where you render only if it's server-side.
- Seed invariants worth failing loud: a typo making `correctAnswer` ∉ options yields a silently unwinnable quiz.

**Q&A — questions I was asked:**
- **Q:** Read balance in Header or layout? → **A:** Header works *because* it's an async Server Component; else you'd pass it as a prop.
- **Q:** After the reward mutates the DB, why doesn't the header update? → **A:** Next caches rendered RSC; `revalidatePath` marks it stale to re-render.
- **Q:** `.toFixed()` to format the balance? → **A:** Works but no `$`/commas, and it's a Decimal object — use `Intl.NumberFormat(Number(x))`.
- **Q:** For the review screen on a 5/5 run, do you need new state for the user's picks? → **A:** No — on a perfect run selected == `correctAnswer`; render off `questions`.
- **Q:** "User not found" on quiz completion — cause? → **A:** No DB row with that `clerkId`; only the Clerk webhook creates users, not signing in.

---

## 2026-07-30 — Quiz UI Client Component + Lesson Page

**Built:**
- [Quiz.tsx](frontend/src/components/dashboard/Quiz.tsx): two-step quiz flow, 5/5 gate, `useEffect`-driven reward call reading `{ awarded, amount }`.
- [lesson page.tsx](frontend/src/app/dashboard/courses/[courseId]/lessons/[lessonId]/page.tsx): single `findUnique` + `include: quizzes`, empty-quiz guard, mounts `<Quiz>`.
- Made course-page lessons `<Link>`s into the new lesson route.

**Review:**
- Handlers set state; effects react to it — never decide from a state value just set in the same function (stale snapshot).
- Effect re-runs only when a dep *changes* — `true→true` is skipped; watch the value that always changes (`score`), not `isCorrect`.
- Three Prisma artifacts must agree: schema, DB, generated client — "column does not exist" + clean `migrate status` = stale client → `prisma generate`.
- Reward security: client scores, but server's `@@unique` + P2002 catch is the real invariant (no double-pay); empty quiz would auto-award without a guard.

**Q&A — questions I was asked:**
- **Q:** What stops a user calling `awardLessonReward` without taking the quiz? → **A:** Nothing (client scores), but `@@unique([userId,lessonId])` caps it to one payment — acceptable for fake-money MVP.
- **Q:** Is `correctAnswer` React state? → **A:** No — it's in the Quiz row props; derive it, don't store it.
- **Q:** Why not put `isCorrect` in the effect deps? → **A:** It can stay `true` across questions; the unchanged value skips the effect. Watch `score`.
- **Q:** Why `(async()=>{})()` inside the effect instead of an async effect callback? → **A:** An effect must return void/cleanup; an async fn always returns a Promise.
- **Q:** Column-missing error but migrations up to date — cause? → **A:** Stale generated client (first guessed the seed — wrong; seed only inserts rows).

---

## 2026-07-29 — Quiz Reward Server Action + Migration Fixes

**Built:**
- [quiz.ts](frontend/src/app/actions/quiz.ts): `awardLessonReward(lessonId)` — session-derived identity, Zod validation, atomic `$transaction`, P2002 replay guard.
- Moved `currencyReward` from `Quiz` → `Lesson`; reward is per-lesson. New migration `sync_schema_and_lesson_reward`.
- [prisma.config.ts](frontend/prisma.config.ts): pointed CLI `url` at `DIRECT_URL` (non-pooled) for migrations.
- Added Migration Gotchas section to [CLAUDE.md](CLAUDE.md).

**Review:**
- Identity must come from verified session, never client — client says *what*, not *who* (IDOR / authorization).
- DB unique constraint > app-level `if` check under concurrency (TOCTOU); catch P2002 = "already rewarded".
- `$transaction` makes credit + progress-row atomic — no half-state that double-pays or loses reward.
- Store atomic facts at natural grain (per lesson); derive aggregates (course %) by counting, don't duplicate truth.
- `db push` and `migrate dev` don't mix — push writes no history, so reset drops push-only columns.

**Q&A — questions I was asked:**
- **Q:** Why derive userId from Clerk session, not the client? → **A:** Client input is attacker-controlled; session token is cryptographically signed and unforgeable without login.
- **Q:** Authentication vs authorization? → **A:** Authn = who you are (Clerk); authz = allowed to act on *this* object. IDOR is an authz failure.
- **Q:** Why is a session token trustworthy? → **A:** It's a signed JWT; tampering breaks the signature. (Not "long/hashed" — first attempt's misconception.)
- **Q:** Why DB constraint over a TS `if (alreadyPassed)`? → **A:** Two concurrent requests both read null and both pass the check; only the DB serializes writes.
- **Q:** Why wrap the two writes in `$transaction`? → **A:** A crash between them could pay the reward with no passed-record → replayable double-payout.
- **Q:** Where should the reward amount come from? → **A:** Server-side read of the Lesson row — never a client-sent amount.

---

## 2026-07-28 — Clerk Webhook + Svix Verification

**Built:**
- [route.ts](frontend/src/app/api/webhooks/clerk/route.ts): Svix-verified handler for `user.created`/`updated`/`deleted`.
- Merged created/updated into one `upsert` case; `deleted` uses `deleteMany`.
- Made `/api/webhooks(.*)` public in [proxy.ts](frontend/src/proxy.ts); verified live via ngrok → 200.

**Review:**
- Verify signature over the **raw** body (`req.text()` before parse) — re-serializing breaks the HMAC.
- Webhooks are at-least-once → handlers must be idempotent (`upsert`, `deleteMany`).
- Status codes are a retry contract: `2xx` = done/skip, `4xx`/`5xx` = retry.
- Prisma `where: { x: undefined }` omits the filter → `deleteMany` wipes the table; guard the key.
- `onDelete: Cascade` lives on the child (holds the FK); real financial audit data → soft-delete instead.
