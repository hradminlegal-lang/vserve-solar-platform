# Prompt 09: Site survey on a phone, offline

Phase 2 · branch `feat/site-survey`

Copy everything below the line into a new Claude Code session.

---

## Goal
Site survey on a phone, offline for VServe Solar Platform, as specified in the docs below.

## Read first
- `docs/sales-pipeline.md` (Site survey)
- `docs/design-system.md`

## Build
- `/w/[company]/survey/[leadId]` mobile-first checklist from sales-pipeline.md with required photos, measurements (roof dimensions, cable route lengths, main breaker rating), notes and obstruction heights.
- Works offline: IndexedDB draft, photo queue with compression and retry, sync when online; conflict rule: last write wins per field, photos never lost.
- On completion, data appears in the lead and is available to the design studio.

## Done when
- [ ] Airplane-mode test: complete survey offline, sync later, nothing lost.
- [ ] Required items enforced before 'Complete'.

## Out of scope
Native app.

## How to work
1. Read the files under "Read first". Reply with a plan: files to create or change, tests to add, questions. Wait for my approval before writing code.
2. Work on the branch named above. Write tests first where this prompt says so.
3. Before finishing run `pnpm lint && pnpm typecheck && pnpm test` plus any extra command named here, and fix failures.
4. Finish with: what you built, how to try it (URL or steps), what is not done, open questions. Open a pull request.
