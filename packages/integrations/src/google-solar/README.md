# Google Solar API (buildingInsights, dataLayers)

Used for: Roof segments, panel potential, flux and shade rasters.

Phase: 1. Only the interface and a fake exist now; nothing calls the real service.

## Check before building the real client

- [ ] Philippine coverage is partial, mostly BASE quality: handle 'not found'
- [ ] Maps Platform terms on caching and display of Solar API data
- [ ] Request quality order: MEDIUM, then BASE

The real client runs server-side only (Edge Function or server action), reads its key from env, logs request ids and latency but never personal data, and has a usage alert.
