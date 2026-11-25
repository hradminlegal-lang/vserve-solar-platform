# Google Ads lead form webhooks

Used for: Lead capture from Google Ads lead forms.

Phase: 2. Only the interface and a fake exist now; nothing calls the real service.

## Check before building the real client

- [ ] Per-company webhook key

The real client runs server-side only (Edge Function or server action), reads its key from env, logs request ids and latency but never personal data, and has a usage alert.
