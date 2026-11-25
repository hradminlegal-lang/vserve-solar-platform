# PayMongo

Used for: Checkout, milestone payments, refunds.

Phase: 4. Only the interface and a fake exist now; nothing calls the real service.

## Check before building the real client

- [ ] Webhook signature verification
- [ ] Idempotency and stored event ids
- [ ] Test mode in dev and staging
- [ ] How to hold and release funds (legal review)

The real client runs server-side only (Edge Function or server action), reads its key from env, logs request ids and latency but never personal data, and has a usage alert.
