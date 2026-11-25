import { z } from 'zod';
import { type CalcConfig, DEFAULT_CONFIG } from './config';

export const BillToSystemInputSchema = z.object({
  monthlyBillPhp: z.number().nonnegative(),
  daytimeSharePct: z.number().min(0).max(100),
  offsetPct: z.number().min(0).max(200),
});
export type BillToSystemInput = z.infer<typeof BillToSystemInputSchema>;

export interface BillToSystemResult {
  usageKwh: number;
  panels: number;
  kwp: number;
  roofAreaM2: number;
  productionKwh: number;
  selfUsedKwh: number;
  exportedKwh: number;
  savingsPhp: number;
  priceLow: number;
  priceHigh: number;
  paybackYearsLow: number | null;
  paybackYearsHigh: number | null;
  savings25yPhp: number;
  notes: string[];
}

/** Monthly bill → system size, price range, savings and payback. */
export function billToSystem(
  i: BillToSystemInput,
  c: CalcConfig = DEFAULT_CONFIG,
): BillToSystemResult {
  const usageKwh = c.ratePhpPerKwh > 0 ? i.monthlyBillPhp / c.ratePhpPerKwh : 0;
  const targetKwh = (usageKwh * i.offsetPct) / 100;
  const panelKw = c.panelWatts / 1000;
  const panels =
    targetKwh > 0 ? Math.ceil(targetKwh / (c.yieldKwhPerKwpDay * c.daysPerMonth) / panelKw) : 0;
  const kwp = panels * panelKw;
  const productionKwh = kwp * c.yieldKwhPerKwpDay * c.daysPerMonth;
  const selfUsedKwh = Math.min(productionKwh, (usageKwh * i.daytimeSharePct) / 100);
  const exportedKwh = Math.max(0, productionKwh - selfUsedKwh);
  const savingsPhp = selfUsedKwh * c.ratePhpPerKwh + exportedKwh * c.exportCreditPhpPerKwh;
  const priceLow = kwp * c.priceLowPerKwp;
  const priceHigh = kwp * c.priceHighPerKwp;
  const notes: string[] = [];
  if (panels === 0) notes.push('no_usage');
  if (exportedKwh > selfUsedKwh) notes.push('mostly_exported');
  return {
    usageKwh,
    panels,
    kwp,
    roofAreaM2: panels * c.panelAreaM2,
    productionKwh,
    selfUsedKwh,
    exportedKwh,
    savingsPhp,
    priceLow,
    priceHigh,
    paybackYearsLow: savingsPhp > 0 ? priceLow / savingsPhp / 12 : null,
    paybackYearsHigh: savingsPhp > 0 ? priceHigh / savingsPhp / 12 : null,
    savings25yPhp: savingsPhp * 12 * 25,
    notes,
  };
}
