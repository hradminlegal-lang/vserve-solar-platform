# Screens

Mockups: `mockups/screens.html` and `mockups/png/`. Customer screens are designed for phones (360–400 px); company workspace screens for desktop (1280 px) with a usable phone layout for CRM and site survey. Brand names, people and prices in mockups are placeholders. Every screen needs loading, empty and error states.

## Customer (phone-first)
| # | Screen | Route | Mockup | Phase |
| --- | --- | --- | --- | --- |
| C1 | Roof check from address | `/roof-check` | `c1-roof-check.png` | 1 |
| C2 | Savings and payback (25-year) | `/calculators/savings` | `c2-savings.png` | 1 |
| C3 | Compare proposals from companies | `/requests/[id]` | `c3-compare.png` | 3 |
| C4 | How to pay: loan comparison | `/financing` | `c4-loans.png` | 3 |
| C5 | Proposal page (from one company) | `/p/[token]` | `c5-proposal.png` | 2 |
| C6 | My system record: equipment and serials, warranties, documents, production, service requests, sharing | `/me/system` | (follow C screens style) | 5 |
Plus the bill, appliances, battery and quote-checker calculators from the first kit.

## Company workspace (desktop-first)
| # | Screen | Route | Mockup | Phase |
| --- | --- | --- | --- | --- |
| W1 | Pipeline board | `/w/[company]/pipeline` | `w1-pipeline.png` | 2 |
| W2 | Design studio | `/w/[company]/designs/[id]` | `w2-design-studio.png` | 2 |
| W3 | Quote maker | `/w/[company]/quotes/[id]` | `w3-quote-maker.png` | 2 |
| W4 | Lead detail and onboarding | `/w/[company]/leads/[id]` | (follow W1 style) | 2 |
| W5 | Site survey (phone, offline) | `/w/[company]/survey/[id]` | (follow C screens style) | 2 |
| W6 | Campaigns and landing pages | `/w/[company]/campaigns` | — | 2 |
| W7 | Storefront and listings | `/w/[company]/store` | — | 4 |
| W8 | Parts price request: build, send, compare supplier quotes, hold stock, award | `/w/[company]/parts/[id]` | (follow W3 style: table of lines × suppliers) | 2 |
| W9 | Supplier inbox: answer requests, quotes, purchase orders, deliveries | `/w/[company]/supplier` | (follow W1/W3 style) | 2 |

## Copy rules
Big number → what it means → next step. Ranges for estimates. Every estimate shows its inputs and data source ("Roof data: Google Solar API, base quality, imagery 2025"; "Energy: PVWatts v8"). Engineering outputs carry: "Design estimate. Final design verified on site and signed by a licensed engineer."
