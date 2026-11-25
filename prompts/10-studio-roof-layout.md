# Prompt 10: Design studio part 1: roof model and panel layout

Phase 2 · branch `feat/studio-layout`

Copy everything below the line into a new Claude Code session.

---

## Goal
Design studio part 1: roof model and panel layout for VServe Solar Platform, as specified in the docs below.

## Read first
- `docs/design-studio.md` (Workflow steps 1–3, Versioning)
- `docs/data-model.md` (Design)
- `mockups/png/w2-design-studio.png`

## Build
- Tables: designs, design_versions, design_assets (+ tenancy tests).
- Studio page per mockup W2 (desktop): satellite map canvas, tools panel, system panel.
- Roof: import Solar API segments as editable polygons (pitch, azimuth) or draw planes by hand; edit vertices; set pitch and azimuth (azimuth can be taken from a drawn eave edge); obstructions with height; keep-out zones; setbacks per plane (company defaults).
- Layout: choose panel from catalogue (needs complete specs); auto-fill planes in portrait/landscape with gap and setbacks using Turf.js polygon clipping, consistent with `panelFit` on rectangles (test: rectangle planes give the same counts as panelFit golden vectors); add/remove panels by click; live count and kWp.
- Undo/redo, autosave, version on save, read-only view on phones.
- Geometry in local metres (project lat/lng to a local tangent plane) with unit tests for area and distance accuracy (< 1% on 10–30 m roofs).

## Done when
- [ ] Rectangle auto-fill equals panelFit vectors.
- [ ] Undo/redo and autosave tested.
- [ ] 60 fps panning with 200 panels on a mid-range laptop.

## Out of scope
Shading, energy, electrical (next prompts).

## How to work
1. Read the files under "Read first". Reply with a plan: files to create or change, tests to add, questions. Wait for my approval before writing code.
2. Work on the branch named above. Write tests first where this prompt says so.
3. Before finishing run `pnpm lint && pnpm typecheck && pnpm test` plus any extra command named here, and fix failures.
4. Finish with: what you built, how to try it (URL or steps), what is not done, open questions. Open a pull request.
