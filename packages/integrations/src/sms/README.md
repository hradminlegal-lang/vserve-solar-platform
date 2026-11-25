# SMS provider (Philippine sender ID)

Used for: OTP and reminders.

Phase: 1. Only the interface and a fake exist now; nothing calls the real service.

## Check before building the real client

- [ ] Sender name registration
- [ ] Which providers Supabase Auth supports for PH numbers

The real client runs server-side only (Edge Function or server action), reads its key from env, logs request ids and latency but never personal data, and has a usage alert.
