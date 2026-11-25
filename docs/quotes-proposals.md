# Quote maker and proposals

## Quote maker (company side)
- Starts from a signed-off design version (or, for quick quotes, from a calculator estimate marked "Preliminary").
- Lines come from the design BOM. Each line: item, catalogue or company item id, qty, unit cost (from the company price list or live marketplace price), unit price, line total. Labour, permits, net-metering processing and delivery are standard lines.
- Pricing: target margin per company (default) with per-quote override; `quoteMargin` computes price, VAT (12% if VAT-registered), price per kWp and the range flag. Discount line with reason. Margin is never shown to customers.
- Options: up to 3 packages per quote (e.g. Grid-tied / Hybrid 5 kWh / Hybrid 10 kWh), each its own design variant or BOM.
- Payment terms: milestone template (e.g. 30% on contract, 60% on delivery, 10% on commissioning) editable per quote.
- Validity date (max 30 days); prices re-checked against the price list when a quote is duplicated or revived.
- Every quote fills the standard fields in `docs/quote-format.md` so it can be compared on the marketplace.
- Versioning: v1, v2… every sent version kept and viewable.

## Proposal (customer side)
A web page `/p/{token}` (unguessable link, optional PIN) and a matching PDF:
1. Cover: company, customer, address, date, validity.
2. Your roof: satellite image with the layout, panel count, kWp.
3. Your energy: monthly production vs usage chart, coverage %, self-use estimate.
4. Your savings: `financialModel` results (year-1 savings, payback, 25-year savings, IRR), with assumptions listed and editable sliders for rate escalation (results recompute; the stored figures stay).
5. Equipment: brands, models, datasheet links, warranties.
6. Price and options: package table; what's included; payment milestones.
7. Financing: `loanCompare` for the chosen package using current `lender_products`; "Check if I qualify" (financing module).
8. Company: verification badge, licensed engineer, reviews, portfolio.
9. Accept: customer picks a package, types full name, ticks terms, accepts. Store name, timestamp, IP, user agent, proposal version hash. Company is notified; CRM moves to `won`.
Tracking: opened, time on page, sections viewed, so sales knows when to follow up.

## Contract
After acceptance, generate a contract from a company template (scope, price, milestones, warranties, timeline, cancellation) for signature. For legally binding electronic signature, integrate a provider (decision pending); until then, accept plus signed PDF upload.
