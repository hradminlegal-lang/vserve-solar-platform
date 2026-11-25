# Prompt 12: Design studio part 3: electrical design, BOM, drawings, sign-off

Phase 2 · branch `feat/studio-electrical`

Copy everything below the line into a new Claude Code session.

---

## Goal
Design studio part 3: electrical design, BOM, drawings, sign-off for VServe Solar Platform, as specified in the docs below.

## Read first
- `docs/design-studio.md` (steps 6–9, Accuracy and liability)
- `docs/calculators.md` (Engineering functions)

## Build
- Electrical tab: choose inverter(s) and optional battery; `inverterRatio`; string builder per MPPT with `stringSizing` limits and current check; `stringFuse`; `voltageDrop` for DC and AC runs with lengths from survey; protection device list. Warnings list; "Ready for quote" blocked until each warning is fixed or overridden with a written reason (stored).
- BOM generator from layout + electrical + roof type rules (rails/clamps/hooks per panel count and orientation, cables by length + 10%, connectors, isolators, breakers, SPDs, earthing, conduit, labour lines); editable before quote.
- Drawings: layout plan PNG/PDF with dimensions and panel numbers; single-line diagram generated as SVG from the electrical model (panels → strings → DC isolator → inverter → AC breaker → meter, battery if hybrid) and exported to PDF.
- Design report PDF (site, roof, layout, shading, monthly energy, strings, BOM, assumptions, data sources, disclaimer).
- Sign-off by a company engineer with PRC number on file; locks the version.

## Done when
- [ ] SLD snapshot tests for grid-tied and hybrid.
- [ ] BOM rules unit-tested.
- [ ] Signed versions immutable (database test).

## Out of scope
Structural calculations (out of scope; checklist item only).

## How to work
1. Read the files under "Read first". Reply with a plan: files to create or change, tests to add, questions. Wait for my approval before writing code.
2. Work on the branch named above. Write tests first where this prompt says so.
3. Before finishing run `pnpm lint && pnpm typecheck && pnpm test` plus any extra command named here, and fix failures.
4. Finish with: what you built, how to try it (URL or steps), what is not done, open questions. Open a pull request.
