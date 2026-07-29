# Learning Log — Dinero Sabio

Review these before interviews. Newest first.

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
