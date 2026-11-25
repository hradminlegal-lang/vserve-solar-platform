# Prompt 08: Landing pages, website widget, ad lead sync and attribution

Phase 2 · branch `feat/lead-capture`

Copy everything below the line into a new Claude Code session.

---

## Goal
Landing pages, website widget, ad lead sync and attribution for VServe Solar Platform, as specified in the docs below.

## Read first
- `docs/sales-pipeline.md` (Lead sources, Dashboards)
- `docs/integrations.md`

## Build
- Campaigns table with monthly spend entry; UTM capture on every lead.
- Landing page builder: 3 templates (bill calculator hero, roof check hero, testimonial hero), edit text/images/colours within the design system, publish at `/{company}/get-solar` with SEO meta; form creates a lead with UTMs.
- Embeddable calculator widget (script + iframe) for company websites, posting leads with source `widget`; domain allow-list per company.
- Meta Lead Ads and Google Ads lead form webhooks: per-company connection, signature/key verification, idempotent lead creation, field mapping UI. Build against fakes first; write the steps needed for Meta app review.
- Reports: cost per lead, per site survey, per won project by campaign and source.

## Done when
- [ ] Duplicate webhook deliveries create one lead (test).
- [ ] Widget can't post from non-allowed domains.
- [ ] Attribution numbers match a seeded scenario test.

## Out of scope
Running ads for companies; ad creative tools.

## How to work
1. Read the files under "Read first". Reply with a plan: files to create or change, tests to add, questions. Wait for my approval before writing code.
2. Work on the branch named above. Write tests first where this prompt says so.
3. Before finishing run `pnpm lint && pnpm typecheck && pnpm test` plus any extra command named here, and fix failures.
4. Finish with: what you built, how to try it (URL or steps), what is not done, open questions. Open a pull request.
