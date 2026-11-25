# Trust: verification, reviews, ranking, neutrality

## Verification levels (set only by admin via server function)
| Level | Requirements | Shown as |
| --- | --- | --- |
| Basic | Phone verified, owner's government ID, DTI or SEC registration | No badge; "Registered business" line |
| Verified | Basic + valid business permit + named PRC Registered Electrical Engineer or Registered Master Electrician with licence number + 3 completed jobs with photos (platform or portfolio) | Green "Verified" badge |
| Pro | Verified + proof of liability insurance + 20 completed platform jobs + rating ≥ 4.5 + median lead response ≤ 24 h | Green "Pro" badge |

- Each badge links to a page explaining exactly what it means.
- Documents with expiry dates trigger reminders at 30 and 7 days; on expiry the level drops automatically and the business is told why.
- Rejected documents are deleted from Storage after 30 days; the reason stays in `verifications`.

## Reviews
- Only the buyer of a `completed` job can review, once per job, opening 14 days after completion (so the system has run), closing after 180 days.
- Fields: rating 1–5, text 20–2,000 chars, optional photos, optional system size and bills before/after.
- Installers can reply once, publicly. They cannot edit, hide or delete reviews.
- Auto-flag for human moderation: contact details or links, profanity, duplicate text, several reviews from accounts created in the last 7 days, rating far from the job's dispute history. The Claude API may suggest a flag reason; a human decides.
- Hidden reviews still count in an internal metric; public pages show "x reviews removed for breaking review rules".
- Star markup on public pages follows Google's review snippet guidelines (no self-serving markup on VServe's own pages).

## Ranking (directory and RFQ matching)
Published factors only: service area match, verification level, rating (Bayesian average, prior 4.0 with weight 5), review count, median response time, capacity this month, distance. No paid boost in matching. Sponsored directory slots (phase 5) are labelled "Sponsored" and limited to 1 per page. Every list has a "Why this order?" link.

## VServe as seller
- VServe listings and quotes carry "Sold by VServe" / "VServe Solar" labels.
- Ranking code receives no seller-identity field; a test asserts this.
- The quote checker scores VServe quotes with the same function as everyone else.
- The neutrality policy is published on `/trust` and reviewed quarterly.

## Disputes
Opened by either party with reason and photos; payouts and review publishing on hold; admin decides within 7 days (full/partial/no refund, warning, level drop, removal). Every decision written to `audit_log`.

## Removal policy
Immediate suspension for forged documents, fake reviews or taking payment outside an in-progress platform job to avoid fees after a warning. Three upheld disputes in 12 months → review of verification level.
