# Meta Lead Ads webhooks

Used for: Lead capture from Facebook and Instagram ads.

Phase: 2. Only the interface and a fake exist now; nothing calls the real service.

## Check before building the real client

- [ ] App review for leads_retrieval permission
- [ ] Per-company page connection
- [ ] Signature verification

The real client runs server-side only (Edge Function or server action), reads its key from env, logs request ids and latency but never personal data, and has a usage alert.
