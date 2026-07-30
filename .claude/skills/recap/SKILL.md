---
name: recap
description: Use when the user wants to capture, review, or remember what happened in the current chat session — the key facts, decisions, learning topics, and the Socratic questions asked with their correct answers — so they can study them later and not forget what they did. Triggers on "recap", "summarize what we did", "what did I learn", "save this session for review", "add to my learning log". Distills the live conversation into a few bullets and appends a dated entry to LEARNING-LOG.md. Not for summarizing external files or codebases — only the current conversation.
version: 1.1.0
user-invocable: true
argument-hint: "[optional focus, e.g. 'trading engine' or 'just the concepts']"
allowed-tools:
  - Read
  - Edit
  - Write
---

Distills the **current conversation** into a short, review-ready study note and appends it to `LEARNING-LOG.md`. Built for Diego's "learn while shipping" goal — capture what was built and which concepts to revisit for interview-explainability.

## Why this skill is cheap

The conversation is already in your context window. Do NOT re-read session transcript files from disk, glob past sessions, or run tool calls to reconstruct history — that burns tokens for no gain. Just distill what is already loaded.

## Steps

1. **Scan the current conversation** already in context. If the user passed a focus argument, weight the recap toward that topic; otherwise cover the whole session.

2. **Extract three things:**
   - **What we built / did** — concrete changes, decisions, files touched. Facts, not narration.
   - **Concepts to review** — the non-obvious *why*s worth remembering for interviews (patterns, trade-offs, security invariants, gotchas). Match the CLAUDE.md teaching convention: skip the trivial, keep the surprising.
   - **Questions I was asked** — the Socratic/quiz questions posed to Diego this session, each paired with the correct answer distilled to one line. This is where Diego learns most, so capture the *right answer* on record — including corrections where his first attempt was wrong (note what the misconception was). Skip trivial prompts; keep questions that tested a real concept.

3. **Enforce brevity — this is the whole point of the skill:**
   - 4–8 bullets total across the Built + Review sections combined; the Q&A section is separate and may add up to ~6 more.
   - Each bullet ≤ 18 words (Q&A pairs may run to ~25 to fit question + answer). No sub-bullets, no paragraphs.
   - If a session was small, fewer bullets is correct. Never pad. If no real questions were asked, omit the Q&A section entirely.
   - Reference files as clickable links where relevant.

4. **Append, never overwrite.** Read `LEARNING-LOG.md` at repo root if it exists; create it with the header below if it doesn't. Add a new dated entry at the **top** of the entries (newest first), below the title. Use today's date from context.

5. **Confirm** to the user in one line: what was captured and where.

## File format

```markdown
# Learning Log — Dinero Sabio

Review these before interviews. Newest first.

---

## 2026-07-28 — <3–5 word session title>

**Built:**
- <bullet>

**Review:**
- <concept + the why, ≤18 words>

**Q&A — questions I was asked:**
- **Q:** <the question> → **A:** <correct answer in one line; if I got it wrong first, note the misconception>
```

When appending a new entry, insert it directly under the `---` separator so the newest session is always first. Keep each entry self-contained — the user should be able to read one entry cold and remember that session.