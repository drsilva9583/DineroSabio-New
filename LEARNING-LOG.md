# Learning Log — Dinero Sabio

Review these before interviews. Newest first.

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
