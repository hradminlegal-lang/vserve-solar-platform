# Prompt 16: Financing: lender offers, affordability and applications

Phase 3 · branch `feat/financing`

Copy everything below the line into a new Claude Code session.

---

## Goal
Financing: lender offers, affordability and applications for VServe Solar Platform, as specified in the docs below.

## Read first
- `docs/financing.md`
- `docs/calculators.md`
- `mockups/png/c4-loans.png`

## Build
- Admin CRUD for lender_products with source URL and checked_on; products older than 60 days hidden.
- `/financing` per mockup C4 for a given price and savings: `loanCompare` over active products, sorted by monthly cash flow, ineligible offers greyed with reason; `affordability` estimate with "The lender decides" copy.
- Pre-qualification form and documents checklist per product; consent screen; loan_applications with status updates by admin (lender portal later).
- Disclosure of referral fees on the page. Encrypt income and debt fields; access limited to the customer, admins and the chosen lender export.

## Done when
- [ ] Rates always shown with checked-on date (test).
- [ ] Stale products hidden (test with time travel).
- [ ] Encryption at rest verified.

## Out of scope
Lender APIs.

## How to work
1. Read the files under "Read first". Reply with a plan: files to create or change, tests to add, questions. Wait for my approval before writing code.
2. Work on the branch named above. Write tests first where this prompt says so.
3. Before finishing run `pnpm lint && pnpm typecheck && pnpm test` plus any extra command named here, and fix failures.
4. Finish with: what you built, how to try it (URL or steps), what is not done, open questions. Open a pull request.
