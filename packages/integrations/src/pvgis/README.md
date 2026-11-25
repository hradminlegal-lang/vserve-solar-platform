# PVGIS API (EU JRC)

Used for: Fallback or cross-check simulation, horizon profile.

Phase: 2. Only the interface and a fake exist now; nothing calls the real service.

## Check before building the real client

- [ ] Which radiation database it uses for the Philippines
- [ ] No key; keep call volume low

The real client runs server-side only (Edge Function or server action), reads its key from env, logs request ids and latency but never personal data, and has a usage alert.
