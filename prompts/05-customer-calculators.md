# Prompt 05: Customer calculators and education pages (SEO/AEO)

Phase 1 · branch `feat/customer-calculators`

Copy everything below the line into a new Claude Code session.

---

## Goal
Customer calculators and education pages (SEO/AEO) for VServe Solar Platform, as specified in the docs below.

## Read first
- `docs/calculators.md` (Customer calculators)
- `docs/screens.md`
- `mockups/png/c2-savings.png`

## Build
Pages under `/calculators`: bill-to-system, appliances/what-can-it-run, battery backup, savings (25-year `financialModel` with assumption sliders: escalation, self-use, degradation), quote checker, and loan vs savings. Each:
- server-renders a worked example with defaults; 40–60 word answer first; FAQ; JSON-LD (WebApplication, FAQPage, BreadcrumbList);
- results as big number → plain meaning → next step, with inputs and dated defaults shown;
- "Save to my profile" recomputes on the server and stores in customer_profiles/roof_checks as relevant;
- Playwright: 3 golden vectors per calculator through the UI.
Savings page matches mockup C2 including the cumulative chart (inline SVG, accessible label, no chart library unless approved).

## Done when
- [ ] Lighthouse mobile ≥ 90 / accessibility 100 / SEO ≥ 95.
- [ ] Structured data validates.
- [ ] Server-saved results equal client results.

## Out of scope
Roof check (next prompt), financing offers.

## How to work
1. Read the files under "Read first". Reply with a plan: files to create or change, tests to add, questions. Wait for my approval before writing code.
2. Work on the branch named above. Write tests first where this prompt says so.
3. Before finishing run `pnpm lint && pnpm typecheck && pnpm test` plus any extra command named here, and fix failures.
4. Finish with: what you built, how to try it (URL or steps), what is not done, open questions. Open a pull request.
