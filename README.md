# VServe Solar Platform — starter kit for Claude Code

A multi-company solar marketplace. Customers understand, compare, finance and buy solar. Solar companies run their sales and engineering in one workspace: CRM and client onboarding, ads and lead capture, site surveys, a design studio on satellite maps (roof model, panel layout, shading, energy simulation, strings, BOM, single-line diagram, report), a quote maker and online proposals, and a storefront.

This kit holds the instructions, specs, mockups and test answers Claude Code builds from. There's no app code yet; the prompts create it. It is separate from the maintenance-marketplace kit (`vserve-solar-starter`).

## What's inside

| Path                                                                                                      | What it is                                                                                                                                 |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `CLAUDE.md`                                                                                               | Rules Claude Code follows in every session: stack, tenancy, money, security, how to work                                                   |
| `docs/product.md`                                                                                         | The three sides, 13 modules, phases and gates                                                                                              |
| `docs/sales-pipeline.md`                                                                                  | Lead sources, ads, pipeline stages, client onboarding, site survey                                                                         |
| `docs/design-studio.md`                                                                                   | Roof modelling on satellite maps, Google Solar API + manual fallback, shading, energy (PVWatts/PVGIS), electrical, BOM, drawings, sign-off |
| `docs/quotes-proposals.md`, `docs/quote-format.md`                                                        | Quote maker, online proposal, acceptance                                                                                                   |
| `docs/financing.md`                                                                                       | Lender products, loan comparison, affordability, applications                                                                              |
| `docs/marketplace.md`                                                                                     | Proposal requests between companies, equipment catalogue, payments                                                                         |
| `docs/supplier-rfq.md`                                                                                    | Parts price requests: an installer sends a design's BOM to several distributors, compares stock, price and delivery, and awards orders     |
| `docs/system-record.md`                                                                                   | The homeowner's own system record (serials, warranties, documents, service history) and service requests                                   |
| `docs/calculators.md`, `docs/calc-reference.js`, `tests/golden/`                                          | Every formula, and 119 expected input/output pairs the code must match                                                                     |
| `docs/data-model.md`, `docs/trust.md`, `docs/integrations.md`, `docs/design-system.md`, `docs/screens.md` | Tables and tenancy, verification and reviews, third-party services, look, screens                                                          |
| `mockups/`                                                                                                | `screens.html` and PNGs: 5 customer phone screens, 3 company desktop screens                                                               |
| `prompts/`                                                                                                | 20 prompts in build order, a review prompt and a bug-fix template                                                                          |

## How to start

1. Create an empty private GitHub repo (e.g. `vserve-solar-platform`), copy this folder in, push.
2. Open Claude Code on that repo. Paste `prompts/00-setup.md` (below the line). Approve the plan, review the PR, merge.
3. New session for each next prompt, in order. After each PR, run `prompts/R-review.md` in another fresh session.

## Build order

| Phase      | Prompts        | You get                                                                                                                                   |
| ---------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 0          | 00–01          | Repo, CI, design system, customer and workspace shells                                                                                    |
| 1          | 02–06          | Formula engine, multi-company database, company sign-up and verification, customer calculators, roof check from address                   |
| Field test | none (by hand) | A hand-run check with installers and suppliers before phase 2. Kept outside this repository.                                              |
| 2          | 07–14          | CRM, landing pages and ad lead sync, site survey, design studio (3 prompts), quote maker and proposals, parts price requests to suppliers |
| 3          | 15–16          | Customers request proposals from several companies; reviews; financing                                                                    |
| 4          | 17             | Equipment marketplace and payments, including paying for awarded parts orders                                                             |
| 5          | 18–19          | Project delivery, permits, handover, referrals; the homeowner's system record and service requests                                        |

The maintenance marketplace (`vserve-solar-starter` kit) is a separate build. Its verified technicians are where phase 5 service requests go when the original installer doesn't respond.

## Accounts needed

GitHub, Vercel, Supabase (Singapore) from the start; Google Cloud project with Maps JavaScript, Places, Geocoding and Solar APIs (prompt 06; set budget alerts); NREL developer key (prompt 11; PVGIS needs none); Anthropic API key (prompt 07); SMS and email providers; Meta developer app (prompt 08, needs app review for lead access); PayMongo (prompt 16); Odoo API user (prompt 16).

## Things to know before you rely on it

- Google's Solar API now covers residential areas in the Philippines, mostly at its lowest ("base") quality. The studio uses it where it works and lets engineers draw roofs by hand elsewhere. Prompt 06 measures real coverage on 20 addresses.
- Prompt 11 compares PVWatts and PVGIS on Philippine locations before picking the energy source.
- Fuse, voltage-drop and other engineering rules must be reviewed by a licensed electrical engineer against the Philippine Electrical Code before launch. Structural checks are out of scope.
- Lender rates are never hard-coded; admins load them from each lender's published terms with a date.
- Legal review needed for terms, privacy, e-signature, held payments and lender referral fees.

## Changing a formula

Edit `docs/calc-reference.js` and `docs/calculators.md`, run `node docs/make-golden.js`, commit the new golden files with the reason, then ask Claude Code to update `packages/calc`.
