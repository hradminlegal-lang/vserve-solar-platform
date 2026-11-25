# Prompt 03: Core database, tenancy and row-level security

Phase 1 · branch `feat/db-core`

Copy everything below the line into a new Claude Code session.

---

## Goal
Core database, tenancy and row-level security for VServe Solar Platform, as specified in the docs below.

## Read first
- `docs/data-model.md` (Platform and identity, Customers)
- `docs/trust.md`

## Build
- Migrations: profiles, companies, company_members, verifications, settings, settings_history, audit_log, customer_profiles, bills, roof_checks, profile_shares, lender_products (table only). PostGIS enabled.
- RLS everywhere. Helper SQL functions `is_member(company_id)`, `has_role(company_id, roles[])`, `is_admin()`.
- Seed settings with defaults from docs/calculators.md.
- Tenancy test suite (pgTAP): for every company-owned table, a member of company A can't select, insert, update or delete company B rows; customers can't read other customers; companies can read a customer profile only through an active profile_share; `is_admin` and `verification_level` only changeable by service role.
- Generate types into packages/db; add `supabase test db` to CI.

## Done when
- [ ] `supabase db reset` clean.
- [ ] All tenancy tests pass in CI.
- [ ] Template for adding a new company-owned table + its tenancy test documented in packages/db/README.

## Out of scope
CRM, design, quote tables (they come with their features).

## How to work
1. Read the files under "Read first". Reply with a plan: files to create or change, tests to add, questions. Wait for my approval before writing code.
2. Work on the branch named above. Write tests first where this prompt says so.
3. Before finishing run `pnpm lint && pnpm typecheck && pnpm test` plus any extra command named here, and fix failures.
4. Finish with: what you built, how to try it (URL or steps), what is not done, open questions. Open a pull request.
