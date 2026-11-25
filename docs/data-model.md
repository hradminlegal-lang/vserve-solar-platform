# Data model (Postgres / Supabase, multi-tenant)

Conventions: uuid ids; `created_at`/`updated_at` timestamptz; money `bigint` centavos (`_centavos`); enums as Postgres enums; RLS on every table. **Tenant isolation:** every company-owned row has `company_id`; RLS allows access only to members of that company (via `company_members`) plus admins. A test suite proves no cross-company reads or writes for every company-owned table. Status changes go through database functions that write `*_events` rows.

## Platform and identity
| Table | Key columns |
| --- | --- |
| `profiles` | id = auth user, full_name, phone_e164, email, is_admin (server-set), privacy_consent_at |
| `companies` | type (installer/epc/distributor), legal_name, trade_name, slug, dti_sec_no, permit_path, service_area geography, verification_level (server-set), rating_avg, rating_count, median_response_hours, plan, vat_registered, default_margin_pct, default_setbacks jsonb |
| `company_members` | company_id, profile_id, role (owner/admin/sales/engineer/installer/viewer), prc_licence_no, licence_type, licence_expiry |
| `verifications`, `audit_log`, `settings`, `settings_history` | as in trust rules |

## Customers
`customer_profiles` (owner profile_id, address, location geography(Point), property_type, roof_type, utility, rate, monthly_kwh array(12), daytime_share_pct, goals, budget_centavos, financing_interest) · `bills` (image_path, period, kwh, amount, confidence, confirmed) · `roof_checks` (location, source solar_api/manual, imagery_quality, imagery_date, segments jsonb, max_panels, est_kwp, est_annual_kwh, fetched_at).
Customers share a profile with a company by creating a `profile_shares` row (company_id, scope, expires_at); companies never read customer_profiles directly otherwise.

## CRM (company-owned)
`leads` (company_id, customer_profile_id nullable, contact fields, address, location, source, campaign_id, utm jsonb, ad_ref, stage, lost_reason, score, assigned_to, next_task_at) · `lead_events` · `tasks` · `messages` (channel, direction, body, template_id) · `files` · `campaigns` (name, channel, start/end, spend_centavos by month jsonb) · `landing_pages` (slug, template, content jsonb, published) · `site_surveys` (lead_id, checklist jsonb, photos, measurements jsonb, completed_by, completed_at).

## Design (company-owned)
`designs` (lead_id, name, status draft/ready/signed_off, current_version) · `design_versions` (design_id, version, roof_planes jsonb [polygon, pitch, azimuth, setbacks], obstructions jsonb, panel_model_id, panels jsonb [plane, x, y, orientation], inverters jsonb, strings jsonb, battery jsonb, energy jsonb [per-plane source, dataset, specific_yield, monthly kWh], shading jsonb, bom jsonb, warnings jsonb, overrides jsonb, data_sources jsonb, signed_off_by, signed_off_at, prc_no) · `design_assets` (layout_png, sld_svg, report_pdf).

## Quotes and proposals (company-owned, shared to customer by token)
`price_lists` and `price_list_items` (company items and costs) · `quotes` (lead_id, design_version_id, version, status draft/sent/viewed/accepted/expired/declined, valid_until, terms jsonb, standard_fields jsonb, score) · `quote_options` (name, lines jsonb, cost_centavos, price_centavos, vat_centavos, margin_pct) · `proposals` (quote_id, token, pin_hash, opened_at, views jsonb) · `acceptances` (proposal_id, option_id, full_name, ip, user_agent, version_hash, accepted_at) · `contracts`.

## Marketplace and payments
`products` (category, brand, model, specs jsonb validated per category schema, datasheet_url) · `listings` (company_id, product_id, price_centavos, b2b_tiers jsonb, stock, lead_time_days, warranty) · `proposal_requests`, `request_invites`, `lead_credits` · `orders`, `order_items`, `shipments` (serials) · `payments` (paymongo ids, status held/released/refunded) · `payouts` · `disputes`, `refunds` · `subscriptions`.

## Parts price requests (phase 2)
`supplier_rfqs` (buyer company_id, project/lead_id, design_version_id, delivery address and location, needed_by, deadline, status draft/open/awarded/closed/cancelled) · `supplier_rfq_lines` (product_id or free text, qty, alternatives_policy, allowed_models) · `supplier_rfq_invites` (rfq_id, supplier company_id, status invited/quoted/declined/expired, responded_at) · `supplier_quotes` (invite_id, valid_until, delivery_fee_centavos, delivery_date, notes) · `supplier_quote_lines` (rfq_line_id, unit_price_centavos, qty_available, lead_time_days, alternative_product_id, authorised_channel bool, warranty_terms) · `stock_holds` (quote_line_id, expires_at, status requested/confirmed/declined/lapsed) · `purchase_orders` and `purchase_order_lines` (supplier, buyer, totals, status issued/dispatched/delivered/cancelled, proof_of_delivery, payment_status offline/paid) · `serials` (product_id, serial, purchase_order_id, project_id, system_record_id).
RLS: a supplier sees only its own invites, quotes and POs; the buyer sees all quotes on its requests; no supplier sees another supplier's prices.

## Financing
`lender_products` (see financing.md) · `loan_applications` (customer, product, amount, status, consent_at, documents) · `lender_events`.

## Delivery and after-sales (phase 5)
`projects` (from accepted quote; milestones), `install_checklists`, `permits` (step, owner, status, documents), `referrals`, `reviews` (one per completed project).
`system_records` (owner profile_id, address, summary jsonb, source platform/owner_entered, created_from project_id) · `record_assets` (record_id, serial_id or entered serial, product, warranty terms and expiry) · `record_documents` · `record_shares` (record_id, company_id or technician profile_id, scope, expires_at, revoked_at) · `production_logs` (record_id, month, kwh, source) · `service_tickets` (record_id, category, description, photos, routed_to, status open/assigned/visited/resolved/closed, responsible_party_note) · `service_events`.
RLS: owner controls the record; companies and technicians read only through an active, unrevoked share.

## Indexes
GiST on all geography columns; `(company_id, stage, updated_at)` on leads; `(company_id, status)` on quotes and designs; foreign keys indexed; unique proposal tokens.
