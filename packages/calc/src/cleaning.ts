import { z } from 'zod';
import { type CalcConfig, DEFAULT_CONFIG } from './config';

/** Cleaning price tiers from the maintenance booking spec (₱). Above 10 kWp is quoted. */
export function cleaningPrice(kwp: number): number | null {
  return kwp <= 3 ? 1500 : kwp <= 5 ? 2500 : kwp <= 10 ? 4000 : null;
}

export const CleaningPaybackInputSchema = z.object({
  kwp: z.number().gt(0),
  lossPct: z.number().min(0).max(100),
  selfUsePct: z.number().min(0).max(100),
});
export type CleaningPaybackInput = z.infer<typeof CleaningPaybackInputSchema>;

export interface CleaningPaybackResult {
  price: number | null;
  lostKwh: number;
  lostPhpPerMonth: number;
  paybackMonths: number | null;
  notes: string[];
}

/** Months until a cleaning pays for itself, from a measured loss. */
export function cleaningPayback(
  i: CleaningPaybackInput,
  c: CalcConfig = DEFAULT_CONFIG,
): CleaningPaybackResult {
  const price = cleaningPrice(i.kwp);
  const lostKwh = (i.kwp * c.yieldKwhPerKwpDay * c.daysPerMonth * i.lossPct) / 100;
  const s = i.selfUsePct / 100;
  const lostPhp = lostKwh * (s * c.ratePhpPerKwh + (1 - s) * c.exportCreditPhpPerKwh);
  return {
    price,
    lostKwh,
    lostPhpPerMonth: lostPhp,
    paybackMonths: price && lostPhp > 0 ? price / lostPhp : null,
    notes: price === null ? ['quote_required'] : [],
  };
}
