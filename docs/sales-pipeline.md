# Sales pipeline, client onboarding and ads

## Lead sources (each lead stores `source`, `campaign`, `utm_*`, `ad_id` when known)
| Source | How it arrives |
| --- | --- |
| Company landing page | Hosted page `/{company-slug}/get-solar` built from a template: hero, calculator, testimonials, form |
| Marketplace proposal request | Customer sends their profile to up to 3 matched companies (phase 3) |
| Meta lead ads | Webhook from Meta Lead Ads (company connects its page in settings) |
| Google Ads lead forms | Webhook from Google Ads lead form extensions |
| Manual / walk-in / referral | Added by staff, or by referral link |
| Website embed | Embeddable calculator widget for the company's own site (iframe + script), posting leads to the CRM |

Ad spend is entered monthly per campaign (or imported later), so the dashboard can show cost per lead, cost per site visit and cost per signed project.

## Pipeline stages (fixed keys; companies can rename labels)
`new` → `contacted` → `qualified` → `site_survey` → `design` → `proposal_sent` → `negotiation` → `won` → `financing` → `contract` → `installation` → `commissioned` → `handover`. Exit: `lost` (reason required: price, timing, financing denied, competitor, not qualified, no response).

Each stage has an SLA the company can set (default: contact new leads within 2 working hours). Overdue cards are flagged.

## Client onboarding (what the company collects, in this order)
1. Contact: name, mobile, email, preferred channel (call, SMS, Viber, Messenger).
2. Property: address and map pin, property type (house, townhouse, condo, commercial), owner or tenant, roof type and age.
3. Energy: 3–12 months of bills (photo upload, AI reads kWh and amount), utility, rate, daytime usage share, major appliances, planned additions (aircon, EV).
4. Goals: save money, backup during brownouts, both; budget; financing interest; timeline.
5. Qualification score (0–100): has bill data, owner, budget fits estimate, timeline ≤ 3 months, roof suitable. Shown as Hot / Warm / Cold.
6. Consent: Data Privacy Act consent to process and to share with financing partners if chosen.

## Site survey (mobile, works offline)
Checklist with photos: roof material and condition, roof access, rafters/purlins spacing, shading objects with height estimate, main panel rating and free slots, meter type, inverter and battery location, cable route length, internet for monitoring, earth electrode, photos of utility meter and main breaker. Measurements feed the design studio.

## Tasks and communication
Tasks with due dates per lead; templates for SMS, email and Viber/Messenger messages; every call, message and file in a timeline. Reminders to the assigned salesperson.

## Dashboards
Leads by source, conversion per stage, average days per stage, win rate per salesperson, cost per lead and per won project by campaign, pipeline value (₱), forecast by month.
