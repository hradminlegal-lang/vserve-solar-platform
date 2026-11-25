import { z } from 'zod';
import { type CalcConfig, DEFAULT_CONFIG } from './config';
import type { PriceFlag } from './quote-score';

export const QuoteMarginInputSchema = z.object({
  panels: z.number().int().positive(),
  panelCost: z.number().nonnegative(),
  inverterCost: z.number().nonnegative(),
  mountingPerPanel: z.number().nonnegative(),
  bosCost: z.number().nonnegative(),
  labourPerKwp: z.number().nonnegative(),
  permitsCost: z.number().nonnegative(),
  marginPct: z.number().min(0),
  vat: z.boolean(),
});
export type QuoteMarginInput = z.infer<typeof QuoteMarginInputSchema>;

export interface QuoteMarginResult {
  kwp: number;
  cost: number;
  grossProfit: number;
  price: number;
  perKwp: number;
  flag: PriceFlag;
}

/** Price from costs and a target gross margin (capped at 95%), plus 12% VAT when registered. */
export function quoteMargin(
  i: QuoteMarginInput,
  c: CalcConfig = DEFAULT_CONFIG,
): QuoteMarginResult {
  const kwp = (i.panels * c.panelWatts) / 1000;
  const cost =
    i.panels * i.panelCost +
    i.inverterCost +
    i.panels * i.mountingPerPanel +
    i.bosCost +
    i.labourPerKwp * kwp +
    i.permitsCost;
  const m = Math.min(95, i.marginPct) / 100;
  const exVat = cost / (1 - m);
  const price = i.vat ? exVat * 1.12 : exVat;
  const perKwp = kwp > 0 ? price / kwp : 0;
  return {
    kwp,
    cost,
    grossProfit: exVat - cost,
    price,
    perKwp,
    flag:
      perKwp < c.priceLowPerKwp
        ? 'below_range'
        : perKwp > c.priceHighPerKwp
          ? 'above_range'
          : 'in_range',
  };
}

export const ReferralInputSchema = z.object({
  avgJobPhp: z.number().nonnegative(),
  completedReferrals: z.number().int().nonnegative(),
  tier1Pct: z.number().min(0),
  tier2Pct: z.number().min(0),
  tier3Pct: z.number().min(0),
  maintenanceReferrals: z.number().int().nonnegative(),
});
export type ReferralInput = z.infer<typeof ReferralInputSchema>;

export interface ReferralResult {
  installCommission: number;
  maintenance: number;
  total: number;
  tier: 0 | 1 | 2 | 3;
}

/** Referral commissions by tier (1–2, 3–5, 6+). Rates are inputs, never constants. */
export function referralEarnings(i: ReferralInput): ReferralResult {
  let total = 0;
  for (let k = 1; k <= i.completedReferrals; k++) {
    total += (i.avgJobPhp * (k <= 2 ? i.tier1Pct : k <= 5 ? i.tier2Pct : i.tier3Pct)) / 100;
  }
  const maintenance = i.maintenanceReferrals * 150;
  return {
    installCommission: total,
    maintenance,
    total: total + maintenance,
    tier:
      i.completedReferrals >= 6
        ? 3
        : i.completedReferrals >= 3
          ? 2
          : i.completedReferrals >= 1
            ? 1
            : 0,
  };
}
