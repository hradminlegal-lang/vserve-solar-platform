# Prompt 14: Parts price requests to suppliers

Phase 2 · branch `feat/parts-requests`

Copy everything below the line into a new Claude Code session.

---

## Goal
Parts price requests to suppliers for VServe Solar Platform, as specified in the docs below.

## Read first
- `docs/supplier-rfq.md`
- `docs/data-model.md` (Parts price requests)
- `docs/screens.md` (W8, W9)

## Build
Implement docs/supplier-rfq.md end to end, payment offline for now.
- Tables and RLS from data-model.md, with tests proving no supplier sees another supplier's quote or a buyer's other quotes.
- Supplier side: distributor companies set regions, authorised brands and contact for quotes; supplier inbox (W9) to answer a request line by line (price, available qty, lead time, alternative, authorised channel, warranty terms, delivery fee and date, validity) or decline with reason.
- Buyer side (W8): create from a design version's BOM or by hand; suggested suppliers by region and brands; send with deadline; comparison table of lines × suppliers with landed totals, coverage, earliest full delivery, alternative and channel flags; split award; stock hold requests (72 h, auto-lapse); purchase order PDFs; delivery confirmation with proof and serial capture.
- Alternative that changes electrical specs on a signed design → prompts a new design version and engineer approval.
- Supplier metrics: response time, quote-to-award, on-time delivery; shown to buyers.
- Notifications by email/SMS for new requests, quotes, holds, awards, deadlines.

## Done when
- [ ] Two-supplier, split-award scenario passes end to end (Playwright).
- [ ] Stock holds lapse automatically (time-travel test).
- [ ] Serials captured at delivery are linked to the project.
- [ ] Quote privacy tests pass.

## Out of scope
Online payment for orders (prompt 17).

## How to work
1. Read the files under "Read first". Reply with a plan: files to create or change, tests to add, questions. Wait for my approval before writing code.
2. Work on the branch named above. Write tests first where this prompt says so.
3. Before finishing run `pnpm lint && pnpm typecheck && pnpm test` plus any extra command named here, and fix failures.
4. Finish with: what you built, how to try it (URL or steps), what is not done, open questions. Open a pull request.
