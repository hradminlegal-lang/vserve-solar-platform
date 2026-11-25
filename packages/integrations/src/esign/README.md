# E-signature provider

Used for: Contracts.

Phase: 3. Only the interface and a fake exist now; nothing calls the real service.

## Check before building the real client

- [ ] Valid electronic signatures under the PH E-Commerce Act
- [ ] Legal review
- [ ] Provider not chosen yet

The real client runs server-side only (Edge Function or server action), reads its key from env, logs request ids and latency but never personal data, and has a usage alert.
