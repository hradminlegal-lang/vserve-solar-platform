# Odoo

Used for: VServe's own listings, stock and orders.

Phase: 4. Only the interface and a fake exist now; nothing calls the real service.

## Check before building the real client

- [ ] API user with limited rights
- [ ] Retry queue for failed syncs

The real client runs server-side only (Edge Function or server action), reads its key from env, logs request ids and latency but never personal data, and has a usage alert.
