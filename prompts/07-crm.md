# Prompt 07: CRM pipeline, lead detail and client onboarding

Phase 2 · branch `feat/crm`

Copy everything below the line into a new Claude Code session.

---

## Goal
CRM pipeline, lead detail and client onboarding for VServe Solar Platform, as specified in the docs below.

## Read first
- `docs/sales-pipeline.md`
- `docs/data-model.md` (CRM)
- `mockups/png/w1-pipeline.png`

## Build
- Tables: leads, lead_events, tasks, messages, files (company-owned + tenancy tests).
- Pipeline board (mockup W1): stages from sales-pipeline.md, drag to move (server function validates stage changes and requires a lost reason), filters (assignee, source, score), overdue flags from stage SLAs.
- Lead detail: contact, property with map pin, energy (bill uploads read by an Edge Function `read-bill` that calls the Claude API with vision and a strict JSON schema: utility, billing period, kWh, amount, rate if printed, account last 4 digits, confidence per field; the user confirms any field under 0.8 confidence; images never logged; max 3 reads per lead per day), goals, qualification score (computed server-side), timeline of events, tasks, message templates (SMS/email via integrations; Viber/Messenger as copy-to-clipboard for now), files.
- Customer onboarding link: company sends a link where the customer fills their own details and uploads bills; creates a profile_share.
- Dashboard tiles: leads by source, stage conversion, average days per stage, pipeline value.

## Done when
- [ ] Tenancy tests for all new tables.
- [ ] Lost requires reason (test).
- [ ] Board handles 500 leads smoothly (virtualised columns).

## Out of scope
Ads integrations (next prompt), design.

## How to work
1. Read the files under "Read first". Reply with a plan: files to create or change, tests to add, questions. Wait for my approval before writing code.
2. Work on the branch named above. Write tests first where this prompt says so.
3. Before finishing run `pnpm lint && pnpm typecheck && pnpm test` plus any extra command named here, and fix failures.
4. Finish with: what you built, how to try it (URL or steps), what is not done, open questions. Open a pull request.
