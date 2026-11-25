# Multi-company marketplace

## Parts price requests
Installers buy most equipment through parts price requests (`docs/supplier-rfq.md`) rather than the catalogue cart: the request, quotes, stock holds and purchase orders come first (phase 2, paid offline); phase 4 adds payment for awarded orders on the same PayMongo rails as the store.

## Two ways customers buy
1. **Projects** (most customers): a full installed system from one company via proposal request → proposals → acceptance → milestone payments.
2. **Products**: panels, inverters, batteries, kits and accessories from distributor and installer storefronts (DIY buyers, installers buying B2B, replacement parts).

## Proposal requests (marketplace projects)
- Customer completes a profile (bills, address, roof check result, goals, budget, financing interest).
- Matching: up to 3 verified companies whose service area covers the address, ranked by published factors (verification level, rating, response time, capacity, distance); no paid boost.
- Companies get a masked lead card; accepting costs a lead credit; contact details unlock after accepting.
- Companies answer with a proposal from their quote maker (standard fields), shown side by side with `quoteScore` flags; customer accepts one.
- Rules on races, expiry and credits: one accept per invite in a transaction, invites expire after 24 h and are replaced once, credits never negative.

## Product catalogue
- Platform catalogue of models (brand, model, category, specs per category schema, datasheet, certifications); companies create listings (price, stock, warranty, lead time, location, B2B tier prices).
- Category spec schemas: panel (Wp, Voc, Vmp, Isc, Imp, temperature coefficients, dimensions, weight, efficiency, max series fuse, product and performance warranty), inverter (AC kW, max DC V, MPPT range and count, max input current per MPPT, phases, hybrid yes/no, battery voltage), battery (chemistry, nominal and usable kWh, voltage, cycles, warranty), mounting, cables, protection.
- The design studio uses the same spec records, so a design can only use parts with complete electrical specs.
- Compare up to 4: price, ₱/W (panels), ₱/kWh (batteries), efficiency, warranty, lead time, seller rating.

## Checkout and payments
PayMongo checkout created server-side; order paid only from a verified webhook (signature, stored event id, duplicate-safe), plus 15-minute reconciliation. Payment held and released to the seller after delivery confirmation or 7 days without a dispute (confirm with PayMongo and counsel how to structure this). Commission deducted at release. Refunds via API. Project milestone payments use the same rails.

## Seller rules
Verified business only; accurate stock; ship within stated lead time; serial numbers captured for panels, inverters, batteries; returns policy displayed; VServe's own listings labelled "Sold by VServe" and ranked by the same rules.
