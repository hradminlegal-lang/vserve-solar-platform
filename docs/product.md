# Product overview: VServe Solar Platform

## One sentence
A multi-company solar marketplace where homeowners and businesses understand, compare, finance and buy solar, and where solar companies run their whole sales and engineering process: ads and leads, client onboarding, rooftop design on satellite maps, energy estimates, quotes, proposals, financing and the equipment purchase.

## Three sides
| Side | Who | What they get |
| --- | --- | --- |
| Customers | Homeowners, small businesses, schools, farms | Calculators, a free roof check from their address, proposals from several verified companies side by side, loan comparison and pre-qualification, checkout for kits and equipment, a record of their system |
| Companies (tenants) | Installers, EPCs, distributors | A workspace with CRM pipeline, ad landing pages and lead capture, site survey app, design studio (roof modelling, panel layout, shading, energy simulation, strings, BOM, single-line diagram), quote maker and online proposals with e-acceptance, storefront in the marketplace, team accounts |
| VServe (platform) | Admin, support, engineering reviewer | Verification of companies, catalogue standards, lender partners, ranking rules, disputes, payments, subscriptions, analytics |

Each company is a tenant: its leads, designs, quotes, prices and margins are private to it. Customers own their own profile and can share it with any company.

## Modules
| # | Module | Users | Phase |
| --- | --- | --- | --- |
| 1 | Customer calculators and education | Customers | 1 |
| 2 | Roof check from address (quick estimate) | Customers | 1 |
| 3 | Company workspace: onboarding, verification, team, settings | Companies | 1 |
| 4 | CRM pipeline and client onboarding | Companies | 2 |
| 5 | Lead capture and ads (landing pages, forms, Meta/Google lead sync, attribution) | Companies | 2 |
| 6 | Design studio (satellite roof modelling, layout, shading, energy, strings, BOM, SLD, report), HelioScope-style | Company engineers | 2 |
| 7 | Quote maker and online proposals with e-acceptance | Companies, customers | 2 |
| 8 | Parts price requests: send a design's BOM to several distributors, compare stock, price and delivery, hold stock, award purchase orders (`docs/supplier-rfq.md`) | Installers, distributors | 2 |
| 9 | Customer proposal requests and side-by-side comparison | Customers, companies | 3 |
| 10 | Financing: loan comparison, affordability, pre-qualification, lender hand-off | Customers, companies | 3 |
| 11 | Equipment marketplace (B2C kits, B2B wholesale) and payments, including paying for awarded parts orders | All | 4 |
| 12 | Reviews, verification badges, company public pages | All | 3 |
| 13 | Project delivery: install checklist, permits and net-metering tracker, handover pack, referrals | Companies, customers | 5 |
| 14 | Homeowner system record and service requests, routed to the original installer or verified technicians (`docs/system-record.md`) | Owners, companies, technicians | 5 |

## Phases and gates
| Phase | Scope | Gate |
| --- | --- | --- |
| 0 | Repo, CI, design system, multi-tenant auth shell | Preview deploy; tenancy tests pass |
| 1 | Calculators, roof check, company sign-up and verification | 10 companies verified; roof check on 50 real PH addresses; field test passed |
| 2 | CRM, lead capture, site survey, design studio, quote maker, proposals, parts price requests | 5 pilot companies send 100 real proposals; 20 parts requests each get ≥ 2 supplier quotes |
| 3 | Customer proposal requests, comparison, reviews, financing | 300 proposal requests; 2 lender partners live |
| 4 | Marketplace and payments | Order defect rate < 2% |
| 5 | Delivery, permits, homeowner system record, service routing, referrals | — |

The maintenance marketplace (separate kit `vserve-solar-starter`) supplies the verified technicians that phase 5 service requests are routed to.

## Business model
Kept outside this repository.

## Out of scope until named
Utility-scale design, ground-mount trackers, 3D LiDAR modelling, automatic permit filing with LGUs, own lending.
