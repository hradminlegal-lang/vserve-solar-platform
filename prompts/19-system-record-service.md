# Prompt 19: Homeowner system record and service requests

Phase 5 · branch `feat/system-record`

Copy everything below the line into a new Claude Code session.

---

## Goal
Homeowner system record and service requests for VServe Solar Platform, as specified in the docs below.

## Read first
- `docs/system-record.md`
- `docs/data-model.md` (Delivery and after-sales)
- `docs/product.md`

## Build
Implement docs/system-record.md.
- Record created at project handover from project data (design version, serials from purchase orders, documents, installer details); owner confirms it. Owners can also add an outside system by uploading documents and entering serials.
- `/me/system` (C6): equipment with serials and warranty expiry, documents, production log vs expected, service history, sharing controls (grant/revoke, expiry), export as PDF + ZIP.
- Service requests: category, photos, error codes; responsible-party note (information only); route to the original installer with a 48 h response window, then to verified technicians (integrate with the maintenance app's booking flow from the vserve-solar-starter kit if it is built, otherwise a request list for verified technician companies).
- Warranty claim packet PDF.
- Serial checks: format, duplicates across systems flagged for admin review.

## Done when
- [ ] Owner can revoke a company's access and it takes effect at once (test).
- [ ] Duplicate serial flagged (test).
- [ ] Export contains every document and asset.

## Out of scope
Inverter cloud integrations; any promise of warranty coverage.

## How to work
1. Read the files under "Read first". Reply with a plan: files to create or change, tests to add, questions. Wait for my approval before writing code.
2. Work on the branch named above. Write tests first where this prompt says so.
3. Before finishing run `pnpm lint && pnpm typecheck && pnpm test` plus any extra command named here, and fix failures.
4. Finish with: what you built, how to try it (URL or steps), what is not done, open questions. Open a pull request.
