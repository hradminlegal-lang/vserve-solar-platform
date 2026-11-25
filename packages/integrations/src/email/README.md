# Email (Resend or similar)

Used for: Proposals and notifications.

Phase: 1. Only the interface and a fake exist now; nothing calls the real service.

## Check before building the real client

- [ ] SPF and DKIM per sending domain

The real client runs server-side only (Edge Function or server action), reads its key from env, logs request ids and latency but never personal data, and has a usage alert.
