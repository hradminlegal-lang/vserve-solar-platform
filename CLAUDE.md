# VServe Solar — instructions for Claude Code

VServe Solar Platform is a multi-company Philippine solar marketplace. Customers understand, compare, finance and buy solar. Solar companies (tenants) run their sales and engineering in a workspace: CRM, ads and lead capture, satellite roof design, energy simulation, quote maker, proposals, storefront. Read `docs/product.md` first in every new session.

## Stack (do not change without asking)

- Monorepo: Turborepo + pnpm.
- `apps/web`: Next.js (App Router), TypeScript strict, Tailwind, installable PWA. Mobile-first: design at 360–400 px wide first.
- `packages/calc`: pure TypeScript calculator engine; its only dependency is zod. Source of truth for every number shown to users.
- `packages/ui`: shared components built from `docs/design-system.md` tokens.
- `packages/db`: Supabase migrations, generated types, seed data.
- `supabase/functions`: Edge Functions (Deno) for anything that touches money, status, matching or third-party APIs.
- Supabase: Postgres + PostGIS, Auth (phone OTP), Storage, Row Level Security. Region: Singapore.
- Payments: PayMongo (server-side only). AI: Claude API (server-side only). ERP: Odoo (server-side sync).
- `packages/integrations`: one folder per third-party service, each behind an interface with a fake for tests (see `docs/integrations.md`).
- Design studio map: Google Maps JavaScript API; geometry with Turf.js; drawings as SVG. Ask before adding any other mapping or 3D library.

## Where things are specified

| Topic                                | File                                                                   |
| ------------------------------------ | ---------------------------------------------------------------------- |
| Scope, sides, modules, phases        | `docs/product.md`                                                      |
| Formulas and defaults                | `docs/calculators.md`, `docs/calc-reference.js`, `tests/golden/*.json` |
| Tables, tenancy                      | `docs/data-model.md`                                                   |
| CRM, onboarding, ads                 | `docs/sales-pipeline.md`                                               |
| Roof design, energy, electrical, BOM | `docs/design-studio.md`                                                |
| Quote maker, proposals               | `docs/quotes-proposals.md`, `docs/quote-format.md`                     |
| Parts price requests to suppliers    | `docs/supplier-rfq.md`                                                 |
| Homeowner system record, service     | `docs/system-record.md`                                                |
| Financing                            | `docs/financing.md`                                                    |
| Marketplace, payments                | `docs/marketplace.md`                                                  |
| Verification, reviews, ranking       | `docs/trust.md`                                                        |
| Third-party services                 | `docs/integrations.md`                                                 |
| Look and components                  | `docs/design-system.md`                                                |
| Screens and copy                     | `docs/screens.md`, `mockups/`                                          |

If the code and a doc disagree, the doc wins. If a doc is silent or ambiguous, stop and ask; do not invent business rules (prices, fees, commissions, eligibility).

## Non-negotiable rules

1. Money is stored as integer centavos (`bigint`). Display as `₱12,345`. Never use floats for stored money.
2. Times are stored in UTC (`timestamptz`) and shown in `Asia/Manila`.
3. No business logic in client components. Prices, payment status, order/job status, commissions, verification levels and rankings are computed or changed only in server code (Edge Functions, server actions, database functions).
4. Every table has RLS enabled with explicit policies, and every policy has a test. Company-owned rows carry `company_id`; a cross-tenant test must prove no company can read or write another company's leads, designs, quotes, prices or margins.
5. Payments are confirmed only by a verified PayMongo webhook (signature checked, event id stored, duplicates ignored). Never by a redirect.
6. Secrets live in environment variables / Supabase secrets. Never in client code, never committed.
7. Calculator defaults (rate, yield, panel watts, price range, export credit) come from a config object loaded from the `settings` table, never hard-coded in UI.
8. Tests before code for: calculators, pricing, commissions, matching, permissions.
9. Every screen ships with loading, empty and error states (see `docs/screens.md`).
10. Accessibility: tap targets ≥ 48 px, labels on every input, colour is never the only signal, contrast ≥ 4.5:1.
11. Performance: Lighthouse mobile ≥ 90 on calculator and content pages; images resized and lazy-loaded; no heavy client libraries without asking.
12. VServe-owned listings are labelled "Sold by VServe" and ranked by the same rules as everyone else. Ranking code must not read seller identity.
13. Engineering outputs always show their data sources and the line "Design estimate. Final design verified on site and signed by a licensed engineer." Lender rates come only from `lender_products`, shown with their checked-on date.
14. Copy: plain English, short sentences, Taglish only where `docs/screens.md` gives it. No hype.

## How to work

- Start each task by reading the docs it names, then post a short plan (files to create/change, tests to add) and wait for approval.
- One feature per branch and pull request. Keep PRs under ~600 changed lines where possible.
- Run before every commit: `pnpm lint && pnpm typecheck && pnpm test`. For database work also `supabase db test`. For UI work also `pnpm e2e`.
- When you finish, list: what was built, how to try it, what was not done, and any open question.
- Do not add dependencies without saying why and what they cost in bundle size.
- Never edit generated files (`packages/db/types.ts`) by hand; regenerate them.

## Commands

- `pnpm install` — install everything (pnpm 10, Node 22; see `.nvmrc`)
- `pnpm dev` — run the web app at http://localhost:3000
- `pnpm lint` / `pnpm typecheck` / `pnpm test` — all packages, through Turborepo
- `pnpm build` — production build
- `pnpm e2e` — Playwright (builds and starts the app on port 3100; mobile and desktop projects)
- `pnpm format` / `pnpm format:check` — Prettier
- `npx supabase@2.48.3 start` / `npx supabase@2.48.3 db reset` / `npx supabase@2.48.3 test db` — local database (needs Docker); CI runs these in the `database` job
- `pnpm db:test:local` — same migrations and pgTAP tests on a plain Postgres 16 + PostGIS + pgTAP (set PGHOST/PGPORT/PGUSER); see `packages/db/README.md`
