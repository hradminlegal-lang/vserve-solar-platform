# Prompt 02: Calculator and engineering engine with golden tests

Phase 1 · branch `feat/calc-engine`

Copy everything below the line into a new Claude Code session.

---

## Goal
Calculator and engineering engine with golden tests for VServe Solar Platform, as specified in the docs below.

## Read first
- `docs/calculators.md`
- `docs/calc-reference.js`
- `tests/golden/*.json`

## Build
Implement `packages/calc` in TypeScript reproducing docs/calc-reference.js exactly: every exported function, typed inputs/outputs, `CalcConfig` + `DEFAULT_CONFIG`, a zod schema per function (exported separately; functions never throw), `notes: string[]` keys, `ENGINE_VERSION`.
Write the golden test runner first (load every tests/golden/*.json; compare only keys in `expected`; tolerance 0.01; exact for integers, strings, booleans, nulls; spread array inputs as arguments). Show it failing, then implement until all 119 vectors pass.

## Done when
- [ ] All golden vectors pass.
- [ ] 100% line coverage.
- [ ] Only dependency: zod.
- [ ] Importable from apps/web and Edge Functions.

## Out of scope
UI. Never edit golden files; if a vector looks wrong, stop and tell me.

## How to work
1. Read the files under "Read first". Reply with a plan: files to create or change, tests to add, questions. Wait for my approval before writing code.
2. Work on the branch named above. Write tests first where this prompt says so.
3. Before finishing run `pnpm lint && pnpm typecheck && pnpm test` plus any extra command named here, and fix failures.
4. Finish with: what you built, how to try it (URL or steps), what is not done, open questions. Open a pull request.
