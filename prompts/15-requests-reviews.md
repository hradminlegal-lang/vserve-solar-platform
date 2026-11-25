# Prompt 15: Customer proposal requests, comparison and reviews

Phase 3 · branch `feat/requests`

Copy everything below the line into a new Claude Code session.

---

## Goal
Customer proposal requests, comparison and reviews for VServe Solar Platform, as specified in the docs below.

## Read first
- `docs/marketplace.md` (Proposal requests)
- `docs/trust.md`
- `mockups/png/c3-compare.png`

## Build
- Proposal request from a complete customer profile (bills, address, roof check, goals); matching function per marketplace.md storing reasons; lead cards with masked details; lead credits (transactional, never negative); 24 h expiry and one replacement.
- Accepted requests appear in the company CRM as leads with source `marketplace` and a profile_share.
- Companies answer with a proposal from their quote maker; customer comparison per mockup C3 with `quoteScore` flags and plain-language notes; accept one.
- Reviews per trust.md after project completion; moderation queue; public company pages show ratings.

## Done when
- [ ] All race-condition tests from marketplace.md.
- [ ] Masked data never visible before accept (e2e as company).

## Out of scope
Paid lead credits checkout (manual top-up by admin for now).

## How to work
1. Read the files under "Read first". Reply with a plan: files to create or change, tests to add, questions. Wait for my approval before writing code.
2. Work on the branch named above. Write tests first where this prompt says so.
3. Before finishing run `pnpm lint && pnpm typecheck && pnpm test` plus any extra command named here, and fix failures.
4. Finish with: what you built, how to try it (URL or steps), what is not done, open questions. Open a pull request.
