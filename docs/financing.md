# Financing

Goal: a customer sees exactly what owning solar costs each month with each available loan, whether they are likely to qualify, and can send an application to a lender without retyping anything.

## Lender products (admin-maintained table `lender_products`)
Fields: lender, product name, type (housing loan top-up, home improvement, personal, salary, green/solar loan, government fund), annual rate %, rate type (fixed/variable, fixed period), term options (years), min/max loan, min down %, fees %, eligible borrower types (employed, self-employed, OFW, business), required documents, membership required (e.g. Pag-IBIG, GSIS), source URL, checked_on date, active flag. Rates shown always carry "as of {checked_on}". Products older than 60 days are hidden until re-checked.

Programs to research and load at launch (verify each lender's current published terms): Pag-IBIG home improvement loans used for solar, GSIS rooftop solar loan for members, bank solar or green loans and housing-loan top-ups (e.g. BPI Solar Mortgage), and personal or salary loans as the fallback.

## Customer flow
1. From a calculator result or a proposal: "How can I pay for this?"
2. Cash vs loan: `loanCompare` over all active products; sorted by monthly cash flow; ineligible offers shown greyed out with the reason (e.g. "Minimum loan ₱400,000").
3. Affordability: optional income, existing debts and cash; `affordability` shows an indicative maximum. Copy: "Estimate only. The lender makes the decision."
4. Pre-qualification form: employment type, income range, membership numbers, documents checklist per product.
5. Send to lender: with explicit consent, send a lead package (contact, property, system price, chosen product, documents) by the lender's preferred channel (email or API later). Status: sent → contacted → approved / declined / withdrawn, updated by lender portal link or admin.
6. Proposal and CRM show the financing status; project can't move to `contract` with a loan pending unless the customer chooses to proceed.

## Rules
- VServe does not lend and does not promise approval.
- Referral fees from lenders are disclosed on the financing page.
- Financial data is sensitive personal information: encrypted columns, minimum retention, access limited to the customer, the chosen lender and admins.
