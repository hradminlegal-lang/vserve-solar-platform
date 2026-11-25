# Prompt 18: Project delivery, permits, handover and referrals

Phase 5 · branch `feat/delivery`

Copy everything below the line into a new Claude Code session.

---

## Goal
Project delivery, permits, handover and referrals for VServe Solar Platform, as specified in the docs below.

## Read first
- `docs/product.md`
- `docs/data-model.md` (Delivery)

## Build
- Project created from an accepted quote: milestones linked to payments, install checklist with photos, commissioning test record, serial numbers.
- Permit and net-metering tracker (LGU electrical permit, CFEI, utility application, meter installation, first net-metered bill) with owner per step, documents, reminders; customer view.
- Handover pack PDF: as-built layout, SLD, serials, warranties, monitoring login instructions, maintenance schedule.
- Referrals: codes, attribution, commission after completion and payment, reversal on refund, payout records.

## Done when
- [ ] Customer sees their project and permits on phone.
- [ ] Referral rules tested.

## Out of scope
Maintenance marketplace (separate kit). Homeowner system record (prompt 19).

## How to work
1. Read the files under "Read first". Reply with a plan: files to create or change, tests to add, questions. Wait for my approval before writing code.
2. Work on the branch named above. Write tests first where this prompt says so.
3. Before finishing run `pnpm lint && pnpm typecheck && pnpm test` plus any extra command named here, and fix failures.
4. Finish with: what you built, how to try it (URL or steps), what is not done, open questions. Open a pull request.
