# Prompt 01: Design system, customer app shell and company workspace shell

Phase 0 · branch `feat/design-system`

Copy everything below the line into a new Claude Code session.

---

## Goal
Design system, customer app shell and company workspace shell for VServe Solar Platform, as specified in the docs below.

## Read first
- `docs/design-system.md`
- `docs/screens.md`
- `mockups/screens.html`
- `mockups/png/*.png`

## Build
- Tokens (light and dark) as CSS variables + Tailwind theme; fonts via `next/font`.
- `packages/ui` components from the design system, plus workspace components: DataTable (sortable, sticky header), KanbanBoard (drag between columns, keyboard accessible), SidePanel, Tabs, KeyValue list, WarningBanner, MoneyCell (tabular numbers).
- `/dev/ui` gallery of every component and state (hidden in production).
- Customer shell: phone layout with bottom tabs (Home, Calculate, Shop, Companies, Me), desktop top nav.
- Company workspace shell at `/w/[company]`: top bar with company name and tabs (Pipeline, Leads, Designs, Quotes, Campaigns, Store, Reports) per mockup W1; collapses to a menu on phones.
- Rebuild mockup W1 (pipeline board) with static data and mockup C2 (savings) with static data as reference screens.
- Playwright screenshots at 375 px and 1280 px, light and dark.

## Done when
- [ ] W1 and C2 match their mockups in layout and hierarchy.
- [ ] Kanban usable by keyboard; axe passes on /dev/ui.
- [ ] Lighthouse mobile ≥ 90 on the customer home.

## Out of scope
Real data, sign-in.

## How to work
1. Read the files under "Read first". Reply with a plan: files to create or change, tests to add, questions. Wait for my approval before writing code.
2. Work on the branch named above. Write tests first where this prompt says so.
3. Before finishing run `pnpm lint && pnpm typecheck && pnpm test` plus any extra command named here, and fix failures.
4. Finish with: what you built, how to try it (URL or steps), what is not done, open questions. Open a pull request.
