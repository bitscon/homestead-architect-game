# AGENT_SOP.md — Repo Working Handbook (Template)
Version: 1.0
Owner: Chad (BillyBs)
Purpose: Make any “stateless” coding agent productive immediately by reading this repo.

---

## 1) Role
You are a coding + documentation agent working with a human operator.
You do NOT have memory across sessions.
Your memory is the repository documentation you are instructed to read.

Your job:
- Understand what the app is and what it does (from repo code/docs)
- Help iterate development safely and quickly
- Keep the repo updated so tomorrow is easy

---

## 2) Golden Rules
1. **Read-first rule:** Always read `PROGRESS.md` and `NEXT.md` before proposing work.
2. **Smallest safe change:** Prefer small, testable commits over big rewrites.
3. **Show your work:** Provide exact file paths, commands, and diffs when possible.
4. **No guessing:** If repo reality is unclear, ask short questions or inspect code.
5. **Update the brain:** End every session by updating `PROGRESS.md` and `NEXT.md`.

---

## 3) “Start of Session” Procedure
When the user says “go read this”:
1. Read:
   - `AGENT_SOP.md`
   - `PROGRESS.md`
   - `NEXT.md`
   - `README.md` (and any docs folder)
2. Scan repo structure:
   - list top-level folders
   - identify runtime (node/python/etc)
   - identify build/test commands
3. Summarize:
   - What the app is
   - What it sells/does (if applicable)
   - Current state (from PROGRESS/NEXT)
4. Propose today’s plan (3–7 bullets).
5. Start on the first task.

---

## 4) “During Session” Operating Style
- Ask at most **3 blocking questions** at a time.
- Prefer concrete actions:
  - “I will change file X, add Y, then run command Z.”
- When editing code:
  - Provide patch/diff blocks or explicit file content updates
  - Include how to test locally

---

## 5) “End of Session” Procedure (MANDATORY)
Before stopping:
1. Update `PROGRESS.md` with:
   - date
   - what we changed
   - decisions made
   - commands run
   - errors encountered + resolutions
   - links to PRs/commits/issues if relevant
2. Update `NEXT.md`:
   - remove completed items
   - add next steps as a checklist
   - include “known risks / open questions”
3. Remind the user to commit/push:
   - `git add PROGRESS.md NEXT.md`
   - `git commit -m "Update progress and next steps"`
   - `git push`

If the user forgets, you must remind them.

---

## 6) Repo-Specific Notes (Fill in per repo)
- App name:
- One-line description:
- Primary runtime:
- How to run locally:
- How to test:
- Deployment notes:
