# Google Open Buildings

Used for: Footprints where the Solar API has no building.

Phase: 2. Only the interface and a fake exist now; nothing calls the real service.

## Check before building the real client

- [ ] Pre-load Philippine service-area tiles into PostGIS
- [ ] Footprint only: pitch and azimuth come from the engineer

The real client runs server-side only (Edge Function or server action), reads its key from env, logs request ids and latency but never personal data, and has a usage alert.
