# Prompt 17: Equipment marketplace, PayMongo and Odoo

Phase 4 · branch `feat/marketplace`

Copy everything below the line into a new Claude Code session.

---

## Goal
Equipment marketplace, PayMongo and Odoo for VServe Solar Platform, as specified in the docs below.

## Read first
- `docs/marketplace.md`
- `docs/trust.md` (VServe as seller)
- `docs/integrations.md`

## Build
- Catalogue with category spec schemas (zod) shared with the design studio; listings per company with B2B tiers; search, filters, compare (₱/W, ₱/kWh, warranty, lead time).
- Cart and checkout, plus paying for awarded parts orders from prompt 14 (purchase orders get payment status online); PayMongo sessions server-side; orders paid only from verified webhooks (signature, stored event id, duplicate-safe) + 15-minute reconciliation; milestone payments for projects on the same rails.
- Before building held payments, write a note on how PayMongo supports holding and releasing funds and what needs legal review; wait for my OK.
- Shipments with serials; disputes and refunds; seller payouts minus commission.
- VServe listings synced with Odoo (stock, orders) via a retry queue; "Sold by VServe" label; ranking test proves seller identity unused.

## Done when
- [ ] Webhook tests: bad signature, duplicate, missed.
- [ ] Spec schema rejects incomplete products for design use.

## Out of scope
Third-party logistics integrations.

## How to work
1. Read the files under "Read first". Reply with a plan: files to create or change, tests to add, questions. Wait for my approval before writing code.
2. Work on the branch named above. Write tests first where this prompt says so.
3. Before finishing run `pnpm lint && pnpm typecheck && pnpm test` plus any extra command named here, and fix failures.
4. Finish with: what you built, how to try it (URL or steps), what is not done, open questions. Open a pull request.
