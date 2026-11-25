# Claude API

Used for: Bill reading, lead message drafts, plain-language summaries, moderation hints.

Phase: 1. Only the interface and a fake exist now; nothing calls the real service.

## Check before building the real client

- [ ] Server-side only
- [ ] Structured JSON outputs
- [ ] Per-tenant usage caps
- [ ] Never log images or full bill text

The real client runs server-side only (Edge Function or server action), reads its key from env, logs request ids and latency but never personal data, and has a usage alert.
