import { z } from 'zod';

/** Defaults loaded from the `settings` table at runtime. These seed values match docs/calculators.md. */
export const CalcConfigSchema = z.object({
  ratePhpPerKwh: z.number().positive(),
  yieldKwhPerKwpDay: z.number().positive(),
  panelWatts: z.number().positive(),
  panelAreaM2: z.number().positive(),
  priceLowPerKwp: z.number().nonnegative(),
  priceHighPerKwp: z.number().nonnegative(),
  exportCreditPhpPerKwh: z.number().nonnegative(),
  daysPerMonth: z.number().positive(),
});

export type CalcConfig = z.infer<typeof CalcConfigSchema>;

export const DEFAULT_CONFIG: CalcConfig = {
  ratePhpPerKwh: 15.06,
  yieldKwhPerKwpDay: 4.0,
  panelWatts: 600,
  panelAreaM2: 2.6,
  priceLowPerKwp: 50000,
  priceHighPerKwp: 70000,
  exportCreditPhpPerKwh: 5.5,
  daysPerMonth: 30,
};

export const ENGINE_VERSION = '1.0.0';

/** Amortised monthly payment; zero rate falls back to straight division. */
export function monthlyPayment(principal: number, annualRatePct: number, months: number): number {
  if (months <= 0) return 0;
  const r = annualRatePct / 1200;
  return r > 0 ? (principal * r) / (1 - Math.pow(1 + r, -months)) : principal / months;
}
