# NREL PVWatts v8 API

Used for: Per-roof-plane energy simulation.

Phase: 2. Only the interface and a fake exist now; nothing calls the real service.

## Check before building the real client

- [ ] Record which weather dataset is returned for Philippine coordinates
- [ ] API key and rate limits
- [ ] Cache by rounded inputs

The real client runs server-side only (Edge Function or server action), reads its key from env, logs request ids and latency but never personal data, and has a usage alert.
