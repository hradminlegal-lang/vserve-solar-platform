# Writes prompts/*.md with one shared structure. Edit here, then run: python3 prompts/build-prompts.py
import os
D = os.path.dirname(os.path.abspath(__file__))
FOOT = """
## How to work
1. Read the files under "Read first". Reply with a plan: files to create or change, tests to add, questions. Wait for my approval before writing code.
2. Work on the branch named above. Write tests first where this prompt says so.
3. Before finishing run `pnpm lint && pnpm typecheck && pnpm test` plus any extra command named here, and fix failures.
4. Finish with: what you built, how to try it (URL or steps), what is not done, open questions. Open a pull request.
"""
P = [
("00-setup", "Repo, tooling, CI and integration scaffolding", "0", "chore/setup",
 ["CLAUDE.md", "docs/product.md", "docs/integrations.md"],
"""- Turborepo + pnpm: `apps/web` (Next.js App Router, TypeScript strict, Tailwind, PWA), `packages/calc`, `packages/ui`, `packages/db`, `packages/integrations`, `supabase/`.
- In `packages/integrations`, one folder per service in docs/integrations.md with an interface, a fake implementation and a `README` stating what must be checked before the real one is built. No real calls yet.
- Vitest, Playwright (smoke test), ESLint, Prettier. GitHub Actions on every PR: install, lint, typecheck, unit, build, e2e smoke.
- `.env.example` with every variable from docs/integrations.md, commented; Sentry and PostHog wired but off when env is empty.
- Fill the Commands section of CLAUDE.md.""",
["All commands pass locally and in CI.", "`supabase start` and `supabase db reset` work.", "No secrets committed."],
"Features, database tables, real third-party calls."),

("01-design-system-shells", "Design system, customer app shell and company workspace shell", "0", "feat/design-system",
 ["docs/design-system.md", "docs/screens.md", "mockups/screens.html", "mockups/png/*.png"],
"""- Tokens (light and dark) as CSS variables + Tailwind theme; fonts via `next/font`.
- `packages/ui` components from the design system, plus workspace components: DataTable (sortable, sticky header), KanbanBoard (drag between columns, keyboard accessible), SidePanel, Tabs, KeyValue list, WarningBanner, MoneyCell (tabular numbers).
- `/dev/ui` gallery of every component and state (hidden in production).
- Customer shell: phone layout with bottom tabs (Home, Calculate, Shop, Companies, Me), desktop top nav.
- Company workspace shell at `/w/[company]`: top bar with company name and tabs (Pipeline, Leads, Designs, Quotes, Campaigns, Store, Reports) per mockup W1; collapses to a menu on phones.
- Rebuild mockup W1 (pipeline board) with static data and mockup C2 (savings) with static data as reference screens.
- Playwright screenshots at 375 px and 1280 px, light and dark.""",
["W1 and C2 match their mockups in layout and hierarchy.", "Kanban usable by keyboard; axe passes on /dev/ui.", "Lighthouse mobile ≥ 90 on the customer home."],
"Real data, sign-in."),

("02-calc-engine", "Calculator and engineering engine with golden tests", "1", "feat/calc-engine",
 ["docs/calculators.md", "docs/calc-reference.js", "tests/golden/*.json"],
"""Implement `packages/calc` in TypeScript reproducing docs/calc-reference.js exactly: every exported function, typed inputs/outputs, `CalcConfig` + `DEFAULT_CONFIG`, a zod schema per function (exported separately; functions never throw), `notes: string[]` keys, `ENGINE_VERSION`.
Write the golden test runner first (load every tests/golden/*.json; compare only keys in `expected`; tolerance 0.01; exact for integers, strings, booleans, nulls; spread array inputs as arguments). Show it failing, then implement until all 119 vectors pass.""",
["All golden vectors pass.", "100% line coverage.", "Only dependency: zod.", "Importable from apps/web and Edge Functions."],
"UI. Never edit golden files; if a vector looks wrong, stop and tell me."),

("03-db-tenancy", "Core database, tenancy and row-level security", "1", "feat/db-core",
 ["docs/data-model.md (Platform and identity, Customers)", "docs/trust.md"],
"""- Migrations: profiles, companies, company_members, verifications, settings, settings_history, audit_log, customer_profiles, bills, roof_checks, profile_shares, lender_products (table only). PostGIS enabled.
- RLS everywhere. Helper SQL functions `is_member(company_id)`, `has_role(company_id, roles[])`, `is_admin()`.
- Seed settings with defaults from docs/calculators.md.
- Tenancy test suite (pgTAP): for every company-owned table, a member of company A can't select, insert, update or delete company B rows; customers can't read other customers; companies can read a customer profile only through an active profile_share; `is_admin` and `verification_level` only changeable by service role.
- Generate types into packages/db; add `supabase test db` to CI.""",
["`supabase db reset` clean.", "All tenancy tests pass in CI.", "Template for adding a new company-owned table + its tenancy test documented in packages/db/README."],
"CRM, design, quote tables (they come with their features)."),

("04-auth-companies", "Sign-in, company onboarding, verification and admin queue", "1", "feat/companies",
 ["docs/trust.md", "docs/data-model.md", "docs/sales-pipeline.md"],
"""- Phone OTP sign-in (+639 format); privacy consent screen; profile.
- Company sign-up wizard: type, legal details, DTI/SEC, permit upload, service area (cities or map polygon), licensed engineers/master electricians with PRC numbers and expiry, logo, default margin and setbacks, VAT registration.
- Team: invite by phone/email, roles owner/admin/sales/engineer/installer/viewer; role checks server-side.
- Verification levels per trust.md, changed only from `/admin/verifications` (documents beside entered data, approve/reject with reason, audit_log). Daily job: expiry reminders and level drop.
- Public company page `/companies/[slug]` (badge, area, engineers' licence types, portfolio placeholder).""",
["A company can't raise its own level (test).", "Role permissions tested for each role.", "Invites expire after 7 days."],
"CRM, billing for subscriptions (manual for now)."),

("05-customer-calculators", "Customer calculators and education pages (SEO/AEO)", "1", "feat/customer-calculators",
 ["docs/calculators.md (Customer calculators)", "docs/screens.md", "mockups/png/c2-savings.png"],
"""Pages under `/calculators`: bill-to-system, appliances/what-can-it-run, battery backup, savings (25-year `financialModel` with assumption sliders: escalation, self-use, degradation), quote checker, and loan vs savings. Each:
- server-renders a worked example with defaults; 40–60 word answer first; FAQ; JSON-LD (WebApplication, FAQPage, BreadcrumbList);
- results as big number → plain meaning → next step, with inputs and dated defaults shown;
- "Save to my profile" recomputes on the server and stores in customer_profiles/roof_checks as relevant;
- Playwright: 3 golden vectors per calculator through the UI.
Savings page matches mockup C2 including the cumulative chart (inline SVG, accessible label, no chart library unless approved).""",
["Lighthouse mobile ≥ 90 / accessibility 100 / SEO ≥ 95.", "Structured data validates.", "Server-saved results equal client results."],
"Roof check (next prompt), financing offers."),

("06-roof-check", "Roof check from address (Google Maps + Solar API)", "1", "feat/roof-check",
 ["docs/design-studio.md (Data sources)", "docs/integrations.md", "mockups/png/c1-roof-check.png"],
"""- First, write a short note in the PR: Google Maps Platform terms on caching and displaying Solar API data and on use with Google maps; what we will store and for how long. Wait for my OK before storing anything beyond what the terms allow.
- Address entry with Places Autocomplete; satellite map with draggable pin to the exact roof.
- Server function `roof-check`: call Solar API `buildingInsights:findClosest` (try required quality MEDIUM, then BASE); map roof segments (pitch, azimuth, area), max panels and yearly energy into our shape; store source, imagery quality and date.
- If no building found: let the customer trace the roof outline on the map (polygon) and choose roof slope (flat / gentle / steep); estimate with `panelFit`-style area rules and the default yield; label "Manual estimate".
- Result screen per mockup C1: panels, kWp, best roof side, yearly kWh vs usage from bills, data source line, CTA "Get proposals" (disabled until phase 3: "Coming soon").
- Test with 20 real addresses across Metro Manila, Cavite, Laguna, Cebu, Davao: record hit rate and quality in docs/roof-check-coverage.md.
- Usage guard: max 5 roof checks per user per day; cache by building id.""",
["Works on phone with pin adjustment.", "No-data path tested.", "Coverage report committed.", "API key restricted; no key in client except a referrer-restricted Maps JS key."],
"Detailed layout and shading (design studio)."),

("07-crm", "CRM pipeline, lead detail and client onboarding", "2", "feat/crm",
 ["docs/sales-pipeline.md", "docs/data-model.md (CRM)", "mockups/png/w1-pipeline.png"],
"""- Tables: leads, lead_events, tasks, messages, files (company-owned + tenancy tests).
- Pipeline board (mockup W1): stages from sales-pipeline.md, drag to move (server function validates stage changes and requires a lost reason), filters (assignee, source, score), overdue flags from stage SLAs.
- Lead detail: contact, property with map pin, energy (bill uploads read by an Edge Function `read-bill` that calls the Claude API with vision and a strict JSON schema: utility, billing period, kWh, amount, rate if printed, account last 4 digits, confidence per field; the user confirms any field under 0.8 confidence; images never logged; max 3 reads per lead per day), goals, qualification score (computed server-side), timeline of events, tasks, message templates (SMS/email via integrations; Viber/Messenger as copy-to-clipboard for now), files.
- Customer onboarding link: company sends a link where the customer fills their own details and uploads bills; creates a profile_share.
- Dashboard tiles: leads by source, stage conversion, average days per stage, pipeline value.""",
["Tenancy tests for all new tables.", "Lost requires reason (test).", "Board handles 500 leads smoothly (virtualised columns)."],
"Ads integrations (next prompt), design."),

("08-lead-capture-ads", "Landing pages, website widget, ad lead sync and attribution", "2", "feat/lead-capture",
 ["docs/sales-pipeline.md (Lead sources, Dashboards)", "docs/integrations.md"],
"""- Campaigns table with monthly spend entry; UTM capture on every lead.
- Landing page builder: 3 templates (bill calculator hero, roof check hero, testimonial hero), edit text/images/colours within the design system, publish at `/{company}/get-solar` with SEO meta; form creates a lead with UTMs.
- Embeddable calculator widget (script + iframe) for company websites, posting leads with source `widget`; domain allow-list per company.
- Meta Lead Ads and Google Ads lead form webhooks: per-company connection, signature/key verification, idempotent lead creation, field mapping UI. Build against fakes first; write the steps needed for Meta app review.
- Reports: cost per lead, per site survey, per won project by campaign and source.""",
["Duplicate webhook deliveries create one lead (test).", "Widget can't post from non-allowed domains.", "Attribution numbers match a seeded scenario test."],
"Running ads for companies; ad creative tools."),

("09-site-survey", "Site survey on a phone, offline", "2", "feat/site-survey",
 ["docs/sales-pipeline.md (Site survey)", "docs/design-system.md"],
"""- `/w/[company]/survey/[leadId]` mobile-first checklist from sales-pipeline.md with required photos, measurements (roof dimensions, cable route lengths, main breaker rating), notes and obstruction heights.
- Works offline: IndexedDB draft, photo queue with compression and retry, sync when online; conflict rule: last write wins per field, photos never lost.
- On completion, data appears in the lead and is available to the design studio.""",
["Airplane-mode test: complete survey offline, sync later, nothing lost.", "Required items enforced before 'Complete'."],
"Native app."),

("10-studio-roof-layout", "Design studio part 1: roof model and panel layout", "2", "feat/studio-layout",
 ["docs/design-studio.md (Workflow steps 1–3, Versioning)", "docs/data-model.md (Design)", "mockups/png/w2-design-studio.png"],
"""- Tables: designs, design_versions, design_assets (+ tenancy tests).
- Studio page per mockup W2 (desktop): satellite map canvas, tools panel, system panel.
- Roof: import Solar API segments as editable polygons (pitch, azimuth) or draw planes by hand; edit vertices; set pitch and azimuth (azimuth can be taken from a drawn eave edge); obstructions with height; keep-out zones; setbacks per plane (company defaults).
- Layout: choose panel from catalogue (needs complete specs); auto-fill planes in portrait/landscape with gap and setbacks using Turf.js polygon clipping, consistent with `panelFit` on rectangles (test: rectangle planes give the same counts as panelFit golden vectors); add/remove panels by click; live count and kWp.
- Undo/redo, autosave, version on save, read-only view on phones.
- Geometry in local metres (project lat/lng to a local tangent plane) with unit tests for area and distance accuracy (< 1% on 10–30 m roofs).""",
["Rectangle auto-fill equals panelFit vectors.", "Undo/redo and autosave tested.", "60 fps panning with 200 panels on a mid-range laptop."],
"Shading, energy, electrical (next prompts)."),

("11-studio-shading-energy", "Design studio part 2: shading and energy simulation", "2", "feat/studio-energy",
 ["docs/design-studio.md (Data sources, steps 4–5)", "docs/integrations.md"],
"""- First, run a comparison script for 5 PH coordinates (Manila, Cavite, Cebu, Davao, Baguio): PVWatts v8 and PVGIS annual specific yield for a 1 kWp, 15° south-facing array; record datasets returned and results in docs/energy-sources.md. Recommend the primary source; wait for my OK.
- Shading: use Solar API dataLayers (annual flux, monthly shade masks) where available to compute per-panel relative irradiance; otherwise compute from obstruction heights with sun positions (hourly, typical year) for a per-plane loss %. Show a heat map on panels.
- Energy: server function calls the chosen API per roof plane (tilt, azimuth, kWp, system losses), caches by rounded inputs, applies shading loss and combines with `systemProduction`; monthly chart vs customer usage; self-use estimate from daytime share.
- Store sources, datasets and dates in design_versions.data_sources and show them in the panel.""",
["Energy source comparison committed.", "Cached calls: re-opening a design makes no new API calls.", "Shading math unit-tested with a known obstruction geometry."],
"Electrical design."),

("12-studio-electrical-bom", "Design studio part 3: electrical design, BOM, drawings, sign-off", "2", "feat/studio-electrical",
 ["docs/design-studio.md (steps 6–9, Accuracy and liability)", "docs/calculators.md (Engineering functions)"],
"""- Electrical tab: choose inverter(s) and optional battery; `inverterRatio`; string builder per MPPT with `stringSizing` limits and current check; `stringFuse`; `voltageDrop` for DC and AC runs with lengths from survey; protection device list. Warnings list; "Ready for quote" blocked until each warning is fixed or overridden with a written reason (stored).
- BOM generator from layout + electrical + roof type rules (rails/clamps/hooks per panel count and orientation, cables by length + 10%, connectors, isolators, breakers, SPDs, earthing, conduit, labour lines); editable before quote.
- Drawings: layout plan PNG/PDF with dimensions and panel numbers; single-line diagram generated as SVG from the electrical model (panels → strings → DC isolator → inverter → AC breaker → meter, battery if hybrid) and exported to PDF.
- Design report PDF (site, roof, layout, shading, monthly energy, strings, BOM, assumptions, data sources, disclaimer).
- Sign-off by a company engineer with PRC number on file; locks the version.""",
["SLD snapshot tests for grid-tied and hybrid.", "BOM rules unit-tested.", "Signed versions immutable (database test)."],
"Structural calculations (out of scope; checklist item only)."),

("13-quotes-proposals", "Quote maker, online proposals and acceptance", "2", "feat/quotes",
 ["docs/quotes-proposals.md", "docs/quote-format.md", "mockups/png/w3-quote-maker.png", "mockups/png/c5-proposal.png"],
"""- Tables: price_lists, price_list_items, quotes, quote_options, proposals, acceptances, contracts (+ tenancy tests).
- Quote maker per mockup W3: lines from design BOM, company costs, margin (`quoteMargin`), VAT, price per kWp check, up to 3 options, milestones, validity, standard fields completeness (12 items), versioning. Margin never sent to the client.
- Proposal page `/p/[token]` per mockup C5 + PDF: roof image with layout, energy vs usage, savings (`financialModel` with assumption sliders that don't change stored figures), equipment with datasheets, packages, financing preview (`loanCompare`, using lender_products), company trust section, accept flow (name, terms, timestamp, IP, user agent, version hash).
- View tracking events; CRM moves to proposal_sent / won automatically; notifications to the salesperson.""",
["Token links unguessable; optional PIN; expired proposals can't be accepted (tests).", "Proposal shows no cost or margin anywhere (test scans HTML).", "PDF renders on phone."],
"Legally binding e-signature provider (decision pending)."),

("14-parts-requests", "Parts price requests to suppliers", "2", "feat/parts-requests",
 ["docs/supplier-rfq.md", "docs/data-model.md (Parts price requests)", "docs/screens.md (W8, W9)"],
"""Implement docs/supplier-rfq.md end to end, payment offline for now.
- Tables and RLS from data-model.md, with tests proving no supplier sees another supplier's quote or a buyer's other quotes.
- Supplier side: distributor companies set regions, authorised brands and contact for quotes; supplier inbox (W9) to answer a request line by line (price, available qty, lead time, alternative, authorised channel, warranty terms, delivery fee and date, validity) or decline with reason.
- Buyer side (W8): create from a design version's BOM or by hand; suggested suppliers by region and brands; send with deadline; comparison table of lines × suppliers with landed totals, coverage, earliest full delivery, alternative and channel flags; split award; stock hold requests (72 h, auto-lapse); purchase order PDFs; delivery confirmation with proof and serial capture.
- Alternative that changes electrical specs on a signed design → prompts a new design version and engineer approval.
- Supplier metrics: response time, quote-to-award, on-time delivery; shown to buyers.
- Notifications by email/SMS for new requests, quotes, holds, awards, deadlines.""",
["Two-supplier, split-award scenario passes end to end (Playwright).", "Stock holds lapse automatically (time-travel test).", "Serials captured at delivery are linked to the project.", "Quote privacy tests pass."],
"Online payment for orders (prompt 17)."),

("15-requests-reviews", "Customer proposal requests, comparison and reviews", "3", "feat/requests",
 ["docs/marketplace.md (Proposal requests)", "docs/trust.md", "mockups/png/c3-compare.png"],
"""- Proposal request from a complete customer profile (bills, address, roof check, goals); matching function per marketplace.md storing reasons; lead cards with masked details; lead credits (transactional, never negative); 24 h expiry and one replacement.
- Accepted requests appear in the company CRM as leads with source `marketplace` and a profile_share.
- Companies answer with a proposal from their quote maker; customer comparison per mockup C3 with `quoteScore` flags and plain-language notes; accept one.
- Reviews per trust.md after project completion; moderation queue; public company pages show ratings.""",
["All race-condition tests from marketplace.md.", "Masked data never visible before accept (e2e as company)."],
"Paid lead credits checkout (manual top-up by admin for now)."),

("16-financing", "Financing: lender offers, affordability and applications", "3", "feat/financing",
 ["docs/financing.md", "docs/calculators.md", "mockups/png/c4-loans.png"],
"""- Admin CRUD for lender_products with source URL and checked_on; products older than 60 days hidden.
- `/financing` per mockup C4 for a given price and savings: `loanCompare` over active products, sorted by monthly cash flow, ineligible offers greyed with reason; `affordability` estimate with "The lender decides" copy.
- Pre-qualification form and documents checklist per product; consent screen; loan_applications with status updates by admin (lender portal later).
- Disclosure of referral fees on the page. Encrypt income and debt fields; access limited to the customer, admins and the chosen lender export.""",
["Rates always shown with checked-on date (test).", "Stale products hidden (test with time travel).", "Encryption at rest verified."],
"Lender APIs."),

("17-marketplace-payments", "Equipment marketplace, PayMongo and Odoo", "4", "feat/marketplace",
 ["docs/marketplace.md", "docs/trust.md (VServe as seller)", "docs/integrations.md"],
"""- Catalogue with category spec schemas (zod) shared with the design studio; listings per company with B2B tiers; search, filters, compare (₱/W, ₱/kWh, warranty, lead time).
- Cart and checkout, plus paying for awarded parts orders from prompt 14 (purchase orders get payment status online); PayMongo sessions server-side; orders paid only from verified webhooks (signature, stored event id, duplicate-safe) + 15-minute reconciliation; milestone payments for projects on the same rails.
- Before building held payments, write a note on how PayMongo supports holding and releasing funds and what needs legal review; wait for my OK.
- Shipments with serials; disputes and refunds; seller payouts minus commission.
- VServe listings synced with Odoo (stock, orders) via a retry queue; "Sold by VServe" label; ranking test proves seller identity unused.""",
["Webhook tests: bad signature, duplicate, missed.", "Spec schema rejects incomplete products for design use."],
"Third-party logistics integrations."),

("18-delivery-referrals", "Project delivery, permits, handover and referrals", "5", "feat/delivery",
 ["docs/product.md", "docs/data-model.md (Delivery)"],
"""- Project created from an accepted quote: milestones linked to payments, install checklist with photos, commissioning test record, serial numbers.
- Permit and net-metering tracker (LGU electrical permit, CFEI, utility application, meter installation, first net-metered bill) with owner per step, documents, reminders; customer view.
- Handover pack PDF: as-built layout, SLD, serials, warranties, monitoring login instructions, maintenance schedule.
- Referrals: codes, attribution, commission after completion and payment, reversal on refund, payout records.""",
["Customer sees their project and permits on phone.", "Referral rules tested."],
"Maintenance marketplace (separate kit). Homeowner system record (prompt 19)."),
("19-system-record-service", "Homeowner system record and service requests", "5", "feat/system-record",
 ["docs/system-record.md", "docs/data-model.md (Delivery and after-sales)", "docs/product.md"],
"""Implement docs/system-record.md.
- Record created at project handover from project data (design version, serials from purchase orders, documents, installer details); owner confirms it. Owners can also add an outside system by uploading documents and entering serials.
- `/me/system` (C6): equipment with serials and warranty expiry, documents, production log vs expected, service history, sharing controls (grant/revoke, expiry), export as PDF + ZIP.
- Service requests: category, photos, error codes; responsible-party note (information only); route to the original installer with a 48 h response window, then to verified technicians (integrate with the maintenance app's booking flow from the vserve-solar-starter kit if it is built, otherwise a request list for verified technician companies).
- Warranty claim packet PDF.
- Serial checks: format, duplicates across systems flagged for admin review.""",
["Owner can revoke a company's access and it takes effect at once (test).", "Duplicate serial flagged (test).", "Export contains every document and asset."],
"Inverter cloud integrations; any promise of warranty coverage."),
]
EXTRA = {
"R-review": """# Independent pull-request review (after every prompt)

Use a fresh Claude Code session that did not write the code.

You are reviewing a pull request for VServe Solar Platform. You have not seen how it was written. Read CLAUDE.md, the docs named in the PR description and the diff.

Report in order of severity, each with file, line and a concrete fix:
1. Tenancy and security: any path where one company can see another company's leads, designs, quotes, costs or margins; missing RLS or tenancy test; secrets or unrestricted API keys in client code; unverified webhooks; cost or margin leaking into proposals.
2. Money and engineering correctness: client-side price or status changes; calculations not using packages/calc; missing data-source labels or engineer disclaimer.
3. Spec mismatches with the docs.
4. Missing tests: edge cases, race conditions, offline paths.
5. Third-party usage: calls not cached, no quota guard, terms not checked.
6. Accessibility and phone performance.
7. Unclear copy for a Filipino homeowner or a busy installer.
Do not rewrite code. End with "Approve" or "Request changes".
""",
"B-bugfix": """# Bug fix template

Bug: <what happened, where, steps, expected vs actual, screenshot>

1. Reproduce with a failing test first (unit, database or Playwright). Show it failing.
2. Explain the root cause in two or three sentences.
3. Make the smallest fix that passes; no unrelated refactors.
4. List other places with the same mistake.
5. Run all checks; open a PR `fix/<short-name>`.
""",
}
for slug, title, phase, branch, read, build, accept, out in P:
    rl = "\n".join(("- `%s` (%s" % (r.split(' (')[0], r.split(' (', 1)[1])) if ' (' in r else "- `%s`" % r for r in read)
    body = f"# Prompt {slug.split('-')[0]}: {title}\n\nPhase {phase} · branch `{branch}`\n\nCopy everything below the line into a new Claude Code session.\n\n---\n\n"
    body += f"## Goal\n{title} for VServe Solar Platform, as specified in the docs below.\n\n## Read first\n{rl}\n\n## Build\n{build}\n\n## Done when\n" + "\n".join(f"- [ ] {a}" for a in accept) + f"\n\n## Out of scope\n{out}\n" + FOOT
    open(os.path.join(D, slug + ".md"), "w").write(body)
for k, v in EXTRA.items():
    open(os.path.join(D, k + ".md"), "w").write(v)
print(len(P), "prompts +", len(EXTRA), "templates")
