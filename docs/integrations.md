# Integrations

All third-party calls run server-side behind an interface (`packages/integrations/<name>`) with a fake implementation for tests and local dev. Keys in Supabase secrets / Vercel env. Each integration logs request ids, latency and errors (never personal data or images), caches where terms allow, and has a usage alert.

| Integration | Used for | Phase | Notes to check before building |
| --- | --- | --- | --- |
| Google Maps JavaScript API, Geocoding, Places Autocomplete | Address entry, satellite map in roof check and design studio | 1 | Map ID with satellite; restrict keys by HTTP referrer / server IP; budget alerts |
| Google Solar API (buildingInsights, dataLayers) | Roof segments, panel potential, flux and shade rasters | 1 (roof check), 2 (studio) | PH coverage partial, mostly BASE quality; handle "not found"; read Maps Platform terms on caching and display before storing results |
| NREL PVWatts v8 API | Per-plane energy simulation | 2 | Record dataset returned for PH coordinates; API key; rate limits |
| PVGIS API (JRC) | Fallback / cross-check simulation, horizon profile | 2 | Free, no key; check which radiation database it uses for PH; be gentle with call volume |
| Claude API | Bill reading, lead message drafts, proposal summaries in plain Taglish, review moderation hints | 1+ | Server only; structured JSON outputs; per-tenant usage caps |
| PayMongo | Checkout, milestone payments, refunds | 4 (3 for lead credits) | Webhook signature, idempotency, test mode in dev/staging |
| Meta Lead Ads webhooks | Lead capture from Facebook/Instagram ads | 2 | App review for leads_retrieval; per-company page connection |
| Google Ads lead form webhooks | Lead capture from Google Ads | 2 | Per-company webhook key |
| SMS provider (PH sender ID) | OTP, reminders | 1 | Sender name registration |
| Email (Resend or similar) | Proposals, notifications | 1 | SPF/DKIM per domain |
| E-signature provider | Contracts | 3 | Choose one with valid electronic signatures under the PH E-Commerce Act; legal review |
| Odoo | VServe's own listings, stock and orders | 4 | XML-RPC/JSON-RPC user with limited rights; retry queue |
| Google Open Buildings | Footprints where Solar API has none | 2 | Pre-load PH service-area tiles into PostGIS; footprint only |
