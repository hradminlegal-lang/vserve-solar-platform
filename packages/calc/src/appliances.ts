import { z } from 'zod';
import { type CalcConfig, DEFAULT_CONFIG } from './config';

export const ApplianceItemSchema = z.object({
  watts: z.number().nonnegative(),
  qty: z.number().int().nonnegative(),
  hoursPerDay: z.number().nonnegative(),
});
export type ApplianceItem = z.infer<typeof ApplianceItemSchema>;
export const ApplianceListSchema = z.array(ApplianceItemSchema);

export interface ApplianceLoadResult {
  dailyKwh: number;
  monthlyKwh: number;
  monthlyCostPhp: number;
  panels: number;
  kwp: number;
  peakKw: number;
  hybridInverterMinKw: number;
  notes: string[];
}

/** What a list of appliances uses, and the system that would cover it. Hours are capped at 24. */
export function applianceLoad(
  items: ApplianceItem[],
  c: CalcConfig = DEFAULT_CONFIG,
): ApplianceLoadResult {
  let wh = 0;
  let peakW = 0;
  for (const a of items) {
    const h = Math.min(24, a.hoursPerDay);
    wh += a.watts * a.qty * h;
    peakW += a.watts * a.qty;
  }
  const dailyKwh = wh / 1000;
  const monthlyKwh = dailyKwh * c.daysPerMonth;
  const panelKw = c.panelWatts / 1000;
  const panels = dailyKwh > 0 ? Math.ceil(dailyKwh / c.yieldKwhPerKwpDay / panelKw) : 0;
  return {
    dailyKwh,
    monthlyKwh,
    monthlyCostPhp: monthlyKwh * c.ratePhpPerKwh,
    panels,
    kwp: panels * panelKw,
    peakKw: peakW / 1000,
    hybridInverterMinKw: (peakW * 1.25) / 1000,
    notes: items.some((a) => a.hoursPerDay > 24) ? ['hours_capped'] : [],
  };
}

export interface WhatCanItRunResult {
  dailyKwh: number;
  hours: number[];
  notes: string[];
}

/** Hours each appliance could run alone on a system's daily energy, capped at 24. */
export function whatCanItRun(
  systemKwp: number,
  items: ApplianceItem[],
  c: CalcConfig = DEFAULT_CONFIG,
): WhatCanItRunResult {
  const dailyKwh = systemKwp * c.yieldKwhPerKwpDay;
  return {
    dailyKwh,
    hours: items.map((a) => {
      const w = a.watts * a.qty;
      return w > 0 ? Math.min(24, (dailyKwh * 1000) / w) : 0;
    }),
    notes: [],
  };
}
