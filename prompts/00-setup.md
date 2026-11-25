# Prompt 00: Repo, tooling, CI and integration scaffolding

Phase 0 · branch `chore/setup`

Copy everything below the line into a new Claude Code session.

---

## Goal
Repo, tooling, CI and integration scaffolding for VServe Solar Platform, as specified in the docs below.

## Read first
- `CLAUDE.md`
- `docs/product.md`
- `docs/integrations.md`

## Build
- Turborepo + pnpm: `apps/web` (Next.js App Router, TypeScript strict, Tailwind, PWA), `packages/calc`, `packages/ui`, `packages/db`, `packages/integrations`, `supabase/`.
- In `packages/integrations`, one folder per service in docs/integrations.md with an interface, a fake implementation and a `README` stating what must be checked before the real one is built. No real calls yet.
- Vitest, Playwright (smoke test), ESLint, Prettier. GitHub Actions on every PR: install, lint, typecheck, unit, build, e2e smoke.
- `.env.example` with every variable from docs/integrations.md, commented; Sentry and PostHog wired but off when env is empty.
- Fill the Commands section of CLAUDE.md.

## Done when
- [ ] All commands pass locally and in CI.
- [ ] `supabase start` and `supabase db reset` work.
- [ ] No secrets committed.

## Out of scope
Features, database tables, real third-party calls.

## How to work
1. Read the files under "Read first". Reply with a plan: files to create or change, tests to add, questions. Wait for my approval before writing code.
2. Work on the branch named above. Write tests first where this prompt says so.
3. Before finishing run `pnpm lint && pnpm typecheck && pnpm test` plus any extra command named here, and fix failures.
4. Finish with: what you built, how to try it (URL or steps), what is not done, open questions. Open a pull request.
