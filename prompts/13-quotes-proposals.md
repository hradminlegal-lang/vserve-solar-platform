# Prompt 13: Quote maker, online proposals and acceptance

Phase 2 · branch `feat/quotes`

Copy everything below the line into a new Claude Code session.

---

## Goal
Quote maker, online proposals and acceptance for VServe Solar Platform, as specified in the docs below.

## Read first
- `docs/quotes-proposals.md`
- `docs/quote-format.md`
- `mockups/png/w3-quote-maker.png`
- `mockups/png/c5-proposal.png`

## Build
- Tables: price_lists, price_list_items, quotes, quote_options, proposals, acceptances, contracts (+ tenancy tests).
- Quote maker per mockup W3: lines from design BOM, company costs, margin (`quoteMargin`), VAT, price per kWp check, up to 3 options, milestones, validity, standard fields completeness (12 items), versioning. Margin never sent to the client.
- Proposal page `/p/[token]` per mockup C5 + PDF: roof image with layout, energy vs usage, savings (`financialModel` with assumption sliders that don't change stored figures), equipment with datasheets, packages, financing preview (`loanCompare`, using lender_products), company trust section, accept flow (name, terms, timestamp, IP, user agent, version hash).
- View tracking events; CRM moves to proposal_sent / won automatically; notifications to the salesperson.

## Done when
- [ ] Token links unguessable; optional PIN; expired proposals can't be accepted (tests).
- [ ] Proposal shows no cost or margin anywhere (test scans HTML).
- [ ] PDF renders on phone.

## Out of scope
Legally binding e-signature provider (decision pending).

## How to work
1. Read the files under "Read first". Reply with a plan: files to create or change, tests to add, questions. Wait for my approval before writing code.
2. Work on the branch named above. Write tests first where this prompt says so.
3. Before finishing run `pnpm lint && pnpm typecheck && pnpm test` plus any extra command named here, and fix failures.
4. Finish with: what you built, how to try it (URL or steps), what is not done, open questions. Open a pull request.
