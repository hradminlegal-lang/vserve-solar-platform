# Prompt 04: Sign-in, company onboarding, verification and admin queue

Phase 1 · branch `feat/companies`

Copy everything below the line into a new Claude Code session.

---

## Goal
Sign-in, company onboarding, verification and admin queue for VServe Solar Platform, as specified in the docs below.

## Read first
- `docs/trust.md`
- `docs/data-model.md`
- `docs/sales-pipeline.md`

## Build
- Phone OTP sign-in (+639 format); privacy consent screen; profile.
- Company sign-up wizard: type, legal details, DTI/SEC, permit upload, service area (cities or map polygon), licensed engineers/master electricians with PRC numbers and expiry, logo, default margin and setbacks, VAT registration.
- Team: invite by phone/email, roles owner/admin/sales/engineer/installer/viewer; role checks server-side.
- Verification levels per trust.md, changed only from `/admin/verifications` (documents beside entered data, approve/reject with reason, audit_log). Daily job: expiry reminders and level drop.
- Public company page `/companies/[slug]` (badge, area, engineers' licence types, portfolio placeholder).

## Done when
- [ ] A company can't raise its own level (test).
- [ ] Role permissions tested for each role.
- [ ] Invites expire after 7 days.

## Out of scope
CRM, billing for subscriptions (manual for now).

## How to work
1. Read the files under "Read first". Reply with a plan: files to create or change, tests to add, questions. Wait for my approval before writing code.
2. Work on the branch named above. Write tests first where this prompt says so.
3. Before finishing run `pnpm lint && pnpm typecheck && pnpm test` plus any extra command named here, and fix failures.
4. Finish with: what you built, how to try it (URL or steps), what is not done, open questions. Open a pull request.
