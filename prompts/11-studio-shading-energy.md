# Prompt 11: Design studio part 2: shading and energy simulation

Phase 2 · branch `feat/studio-energy`

Copy everything below the line into a new Claude Code session.

---

## Goal
Design studio part 2: shading and energy simulation for VServe Solar Platform, as specified in the docs below.

## Read first
- `docs/design-studio.md` (Data sources, steps 4–5)
- `docs/integrations.md`

## Build
- First, run a comparison script for 5 PH coordinates (Manila, Cavite, Cebu, Davao, Baguio): PVWatts v8 and PVGIS annual specific yield for a 1 kWp, 15° south-facing array; record datasets returned and results in docs/energy-sources.md. Recommend the primary source; wait for my OK.
- Shading: use Solar API dataLayers (annual flux, monthly shade masks) where available to compute per-panel relative irradiance; otherwise compute from obstruction heights with sun positions (hourly, typical year) for a per-plane loss %. Show a heat map on panels.
- Energy: server function calls the chosen API per roof plane (tilt, azimuth, kWp, system losses), caches by rounded inputs, applies shading loss and combines with `systemProduction`; monthly chart vs customer usage; self-use estimate from daytime share.
- Store sources, datasets and dates in design_versions.data_sources and show them in the panel.

## Done when
- [ ] Energy source comparison committed.
- [ ] Cached calls: re-opening a design makes no new API calls.
- [ ] Shading math unit-tested with a known obstruction geometry.

## Out of scope
Electrical design.

## How to work
1. Read the files under "Read first". Reply with a plan: files to create or change, tests to add, questions. Wait for my approval before writing code.
2. Work on the branch named above. Write tests first where this prompt says so.
3. Before finishing run `pnpm lint && pnpm typecheck && pnpm test` plus any extra command named here, and fix failures.
4. Finish with: what you built, how to try it (URL or steps), what is not done, open questions. Open a pull request.
