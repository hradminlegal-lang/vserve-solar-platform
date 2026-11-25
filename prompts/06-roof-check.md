# Prompt 06: Roof check from address (Google Maps + Solar API)

Phase 1 · branch `feat/roof-check`

Copy everything below the line into a new Claude Code session.

---

## Goal
Roof check from address (Google Maps + Solar API) for VServe Solar Platform, as specified in the docs below.

## Read first
- `docs/design-studio.md` (Data sources)
- `docs/integrations.md`
- `mockups/png/c1-roof-check.png`

## Build
- First, write a short note in the PR: Google Maps Platform terms on caching and displaying Solar API data and on use with Google maps; what we will store and for how long. Wait for my OK before storing anything beyond what the terms allow.
- Address entry with Places Autocomplete; satellite map with draggable pin to the exact roof.
- Server function `roof-check`: call Solar API `buildingInsights:findClosest` (try required quality MEDIUM, then BASE); map roof segments (pitch, azimuth, area), max panels and yearly energy into our shape; store source, imagery quality and date.
- If no building found: let the customer trace the roof outline on the map (polygon) and choose roof slope (flat / gentle / steep); estimate with `panelFit`-style area rules and the default yield; label "Manual estimate".
- Result screen per mockup C1: panels, kWp, best roof side, yearly kWh vs usage from bills, data source line, CTA "Get proposals" (disabled until phase 3: "Coming soon").
- Test with 20 real addresses across Metro Manila, Cavite, Laguna, Cebu, Davao: record hit rate and quality in docs/roof-check-coverage.md.
- Usage guard: max 5 roof checks per user per day; cache by building id.

## Done when
- [ ] Works on phone with pin adjustment.
- [ ] No-data path tested.
- [ ] Coverage report committed.
- [ ] API key restricted; no key in client except a referrer-restricted Maps JS key.

## Out of scope
Detailed layout and shading (design studio).

## How to work
1. Read the files under "Read first". Reply with a plan: files to create or change, tests to add, questions. Wait for my approval before writing code.
2. Work on the branch named above. Write tests first where this prompt says so.
3. Before finishing run `pnpm lint && pnpm typecheck && pnpm test` plus any extra command named here, and fix failures.
4. Finish with: what you built, how to try it (URL or steps), what is not done, open questions. Open a pull request.
