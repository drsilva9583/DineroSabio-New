# /commit — Smart Commit Message Assistant

Review staged changes for secrets and draft a conventional commit message. **Does NOT run the commit** — it only hands you the message to use yourself.

## Steps

### 1. Check there is something staged

Run `git diff --cached --stat`. If the output is empty, tell the user nothing is staged and stop.

### 2. Scan for accidental secrets

Run `git diff --cached` and scan the output for patterns that look like secrets:

- Lines matching `sk-ant-`, `sk-`, `pk_`, `AKIA` (AWS), `ghp_`, `glpat-`, `xoxb-` (Slack)
- Lines matching `-----BEGIN (RSA|EC|OPENSSH) PRIVATE KEY-----`
- Lines matching `password\s*=\s*\S+`, `secret\s*=\s*\S+`, `api_key\s*=\s*\S+` (case-insensitive), where the value is not a placeholder like `your_key_here`, `...`, or `<...>`
- Any `.env` file being staged (warn but do not block — the user may be committing `.env.example`)

If a pattern matches, show the matching line(s), explain why it looks like a secret, and ask the user to confirm before continuing. Do NOT silently skip secrets.

### 3. Draft the commit message

Analyze `git diff --cached` and write a commit message following Conventional Commits:

**Format:**
```
<type>(<optional scope>): <short imperative summary under 72 chars>

- bullet for each logical change group (omit if only one change)
```

**Types:** `feat` · `fix` · `chore` · `refactor` · `docs` · `style` · `test` · `ci`

**Rules:**
- Summary line is imperative mood ("add", not "adds" or "added")
- Scope is optional but useful (e.g. `feat(trading):`, `fix(auth):`)
- Bullets cover the *why* or *what changed*, not line-by-line narration
- Never mention file names in the summary line; save them for bullets if needed
- If the diff is a rename/restructure with no logic change, use `chore:`

### 4. Hand off the message

Present the drafted message in a code block so it's easy to copy. **Do not run `git commit`** — the user commits it themselves. You may show the ready-to-run command (e.g. ``git commit -m "..."``) for convenience, but do not execute it.

---

> **Why Conventional Commits?**  
> The `type:` prefix makes git history machine-readable — tools like `semantic-release` can auto-generate changelogs and bump version numbers from it. It also makes `git log` scannable at a glance during interviews or code reviews.
