import { z } from 'zod';
import { type CalcConfig, DEFAULT_CONFIG } from './config';

export const QuoteInputSchema = z.object({
  totalPricePhp: z.number().nonnegative(),
  kwp: z.number().gt(0),
  batteryPricePhp: z.number().nonnegative(),
  claimedKwhMonth: z.number().nonnegative(),
  itemsInWriting: z.number().int().min(0),
});
export type QuoteInput = z.infer<typeof QuoteInputSchema>;

export type PriceFlag = 'below_range' | 'in_range' | 'above_range';

export interface QuoteScoreResult {
  perKwp: number;
  expectedKwh: number;
  sizeRatio: number;
  claimRatio: number;
  claimDeviation: number;
  priceFlag: PriceFlag;
  sizeFlag: 'undersized' | 'fits' | 'oversized';
  claimFlag: 'plausible' | 'too_high' | 'too_low';
  score: number;
  notes: string[];
}

/** Scores a quote 0–100: price per kWp 40, sizing 25, production claim 15, documentation 20. */
export function quoteScore(
  q: QuoteInput,
  usageKwh: number,
  c: CalcConfig = DEFAULT_CONFIG,
): QuoteScoreResult {
  const perKwp = q.kwp > 0 ? (q.totalPricePhp - q.batteryPricePhp) / q.kwp : 0;
  let sp = 40;
  if (perKwp < c.priceLowPerKwp) sp = 40 - (c.priceLowPerKwp - perKwp) / 500;
  else if (perKwp > c.priceHighPerKwp) sp = 40 - (perKwp - c.priceHighPerKwp) / 750;
  sp = Math.max(0, sp);
  const expectedKwh = q.kwp * c.yieldKwhPerKwpDay * c.daysPerMonth;
  const sizeRatio = usageKwh > 0 ? expectedKwh / usageKwh : 0;
  let ss = 25;
  if (sizeRatio < 0.8) ss = 25 - (0.8 - sizeRatio) * 50;
  else if (sizeRatio > 1.3) ss = 25 - (sizeRatio - 1.3) * 50;
  ss = Math.max(0, ss);
  const claimDeviation = expectedKwh > 0 ? Math.abs(q.claimedKwhMonth / expectedKwh - 1) : 1;
  let sc = 15;
  if (claimDeviation > 0.1) sc = 15 - (claimDeviation - 0.1) * 60;
  sc = Math.max(0, sc);
  const si = (Math.max(0, Math.min(12, q.itemsInWriting)) / 12) * 20;
  return {
    perKwp,
    expectedKwh,
    sizeRatio,
    claimRatio: expectedKwh > 0 ? q.claimedKwhMonth / expectedKwh : 0,
    claimDeviation,
    priceFlag:
      perKwp < c.priceLowPerKwp
        ? 'below_range'
        : perKwp > c.priceHighPerKwp
          ? 'above_range'
          : 'in_range',
    sizeFlag: sizeRatio < 0.8 ? 'undersized' : sizeRatio > 1.3 ? 'oversized' : 'fits',
    claimFlag:
      claimDeviation <= 0.1
        ? 'plausible'
        : q.claimedKwhMonth > expectedKwh
          ? 'too_high'
          : 'too_low',
    score: Math.round(sp + ss + sc + si),
    notes: q.itemsInWriting < 12 ? ['missing_items'] : [],
  };
}
