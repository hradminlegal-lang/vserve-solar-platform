# Design system

Look: amber sun on deep navy, white surfaces, highly legible type. Calm and trustworthy, like a good engineer's report, never salesy. Mockups in `mockups/` show the intent; this file is the rule.

## Colour tokens (CSS variables + Tailwind theme)
| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `bg` | #F5F7FA | #0B131C | Page |
| `surface` | #FFFFFF | #111C28 | Cards, sheets |
| `sunken` | #EEF2F6 | #0E1822 | Inputs area, result panels |
| `ink` | #13202D | #E6EDF4 | Text |
| `muted` | #566576 | #9AABBB | Secondary text (≥ 4.5:1 on bg) |
| `line` | #D9E0E8 | #223243 | Borders |
| `navy` | #0F2A43 | #081A2B | Hero blocks, active tabs |
| `sun` | #E9A316 | #F2B733 | Primary buttons, highlights (text on it is `ink` #13202D) |
| `sun-soft` | #FDF1D6 | #2B2410 | Highlighted result card |
| `good` / `good-soft` | #1D7F47 / #E2F4EA | #4CC283 / #12291D | Verified, plausible, in range |
| `warn` / `warn-soft` | #9A6A00 / #FBF0D4 | #E3B448 / #2A2310 | Above/below range |
| `bad` / `bad-soft` | #B42828 / #FBE4E4 | #F07171 / #2D1515 | Errors, implausible claims |

Status colours always come with a word or icon (never colour alone).

## Type
- Display: Bricolage Grotesque 700/800 (headings, big numbers).
- Body: Atkinson Hyperlegible 400/700 (all UI text; chosen for legibility on cheap screens and in sunlight).
- Mono: JetBrains Mono (codes, referral codes, technical values).
- Scale (px): 12 / 14 / 16 (body) / 18 / 22 / 28 / 36. Big result numbers 32–40, `tabular-nums`.
- Self-host fonts via `next/font`; subset Latin; `display: swap`.

## Spacing, shape, motion
- 4 px grid; common gaps 8 / 12 / 16 / 24.
- Radius: 10 px cards, 8 px inputs, 999 px pills. One border OR one shadow per card, not both.
- Motion: 150–250 ms ease-out on state changes only; respect `prefers-reduced-motion`.

## Components (build in `packages/ui`, each with loading/disabled/error states and a story or test page)
Button (primary sun, secondary outline, ghost) · IconButton · Input with label, help and error · NumberInput with unit suffix (₱, kWh, kWp, %) · Select · Checkbox/Toggle · Chip/Tag (neutral, good, warn, bad, sun) · Card · ResultCard (big number + label + explanation) · KPI grid · ProgressBar · Stepper (wizard) · BottomTabBar (5 tabs) · TopBar with back · Sheet/Dialog · Toast · EmptyState · ErrorState · Skeleton · Badge (Verified, Pro, Sold by VServe, Sponsored) · RatingStars · ReviewCard · InstallerCard · QuoteCompareCard · ProductCard (price, ₱/W, warranty) · PermitStep · PhotoUploader (compress to 1600 px, progress, retry).

## Layout
- Mobile first: 360–400 px design width, 16 px side gutter, bottom tab bar (Home, Calculate, Shop, Installers, Me). Business portal tabs: Leads, Quotes, Tools, Shop, Profile.
- One primary action per screen, in thumb reach (bottom of the content or a sticky bottom bar).
- Desktop (≥ 1024 px): same content in a centered 1120 px column; tab bar becomes a top nav; calculators show inputs and results side by side.
- Tap targets ≥ 48 px. Inputs use `inputmode="decimal"` for numbers.
