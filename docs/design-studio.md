# Design studio

The engineer's tool for drafting a residential or small commercial rooftop system on a satellite map, in the spirit of HelioScope and similar tools. Desktop-first (≥ 1280 px); read-only view on mobile.

## Data sources and what each is used for
| Need | Primary | Fallback | Notes |
| --- | --- | --- | --- |
| Geocoding, satellite imagery, map | Google Maps JavaScript API (satellite) | — | Follow Google Maps Platform terms on display and caching |
| Roof segments (pitch, azimuth, area), panel suggestions, sunshine | Google Solar API `buildingInsights:findClosest` | Manual roof drawing | Philippines coverage is partial: residential areas mostly at BASE quality (since March 2026), some MEDIUM. Request with the lowest acceptable quality and show the returned `imageryQuality` and imagery date to the engineer |
| Surface model, annual flux, monthly shade (raster layers) | Google Solar API `dataLayers` | Manual obstructions + horizon profile | Use for shading heat map and per-panel irradiance where available |
| Building footprint when Solar API has none | Google Open Buildings (pre-loaded for the service area) | Draw by hand | Footprint only; pitch and azimuth entered by engineer |
| Energy simulation (hourly/monthly) | NREL PVWatts v8 API per roof plane | PVGIS API (`PVcalc` / `seriescalc`) | Before building, check which weather dataset each returns for 5 PH test coordinates and record it; pick primary by comparison with 2–3 real systems' production |
| Panel, inverter, battery specs | Platform equipment catalogue | Company private items | Datasheet values; see data model |

All external calls happen in server functions with caching per location and quota alerts. Store the source, quality and date with each design so reports are honest about inputs.

## Workflow
1. **Open project** from a CRM lead: address and pin prefilled, bills and survey photos available in a side panel.
2. **Roof model**
   - Auto: fetch Solar API building insights; show detected roof segments as editable polygons with pitch and azimuth.
   - Manual: draw roof planes on satellite imagery; set pitch (degrees or rise/run), azimuth from the drawn edge or entered; mark ridges and eaves.
   - Obstructions: draw vents, water tanks, parapets, trees with height; draw keep-out zones.
   - Setbacks per plane (default 0.4 m edges, 0.6 m ridge; company default editable).
3. **Layout**: choose panel model; auto-fill each plane (portrait/landscape, row gap, setback; same rules as `panelFit` for rectangles, polygon clipping for others); drag to add/remove panels; panel count and kWp live.
4. **Shading**: from Solar API flux/shade layers where available; otherwise from obstruction heights and a simple horizon profile. Per-plane annual shading loss %; per-panel heat map.
5. **Energy**: simulate each plane (tilt, azimuth, kWp, losses) with the energy API; combine with `systemProduction`; show monthly kWh vs the customer's monthly usage from bills; self-consumption estimate from daytime share (hourly profile when available).
6. **Electrical**: choose inverter(s) (and battery for hybrid); `inverterRatio` check; string configuration per MPPT with `stringSizing` (min/max panels per string, current), `stringFuse`, `voltageDrop` for DC and AC runs; protection devices list. Warnings block the "Ready for quote" status until resolved or overridden with a written reason.
7. **BOM**: generated from layout and electrical choices: panels, inverter, battery, mounting rails/clamps/hooks per roof type, DC/AC cables by length, MC4 connectors, isolators, breakers, SPDs, earthing, conduit, labour items. Prices from the company's price list or the marketplace.
8. **Drawings and report**
   - Layout plan (top view with dimensions and panel numbering) as PDF/PNG.
   - Single-line diagram generated from the electrical model (SVG → PDF).
   - Design report: site, roof planes, layout, shading, monthly production, strings, BOM, assumptions and data sources.
   - Engineer review: a licensed engineer on the company account signs off (name, PRC number, date). Sign-off locks the design version.
9. **Send to quote maker**, and optionally **request parts prices** from distributors with the BOM (`docs/supplier-rfq.md`); awarded supplier prices can replace list costs in the quote.

## Versioning
Every save creates a design version; quotes reference a specific version. Editing a signed-off version creates a new draft.

## Accuracy and liability
Every output says "Design estimate. Final design must be verified on site and signed by a licensed engineer." Structural adequacy (roof load, wind) is not calculated; the survey checklist asks the engineer to confirm it.
