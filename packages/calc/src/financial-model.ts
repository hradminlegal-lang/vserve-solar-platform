import { z } from 'zod';

export const FinancialModelInputSchema = z.object({
  systemCostPhp: z.number().nonnegative(),
  year1Kwh: z.number().nonnegative(),
  degradationPct: z.number().min(0).max(100),
  ratePhpPerKwh: z.number().nonnegative(),
  exportCreditPhpPerKwh: z.number().nonnegative(),
  escalationPct: z.number(),
  selfUsePct: z.number().min(0).max(100),
  omPhpPerYear: z.number().nonnegative(),
  inflationPct: z.number(),
  inverterReplaceYear: z.number().int().nonnegative(),
  inverterReplaceCostPhp: z.number().nonnegative(),
  years: z.number().int().positive().max(40),
  discountPct: z.number(),
});
export type FinancialModelInput = z.infer<typeof FinancialModelInputSchema>;

export interface FinancialYear {
  year: number;
  productionKwh: number;
  savingsPhp: number;
  netPhp: number;
  cumulativePhp: number;
}

export interface FinancialModelResult {
  totalSavingsPhp: number;
  netGainPhp: number;
  paybackYears: number | null;
  npvPhp: number;
  irr: number | null;
  lcoePhpPerKwh: number | null;
  year1SavingsPhp: number;
  finalYear: FinancialYear | null;
  years: FinancialYear[];
  notes: string[];
}

/** Annual cash flows with degradation, rate escalation, O&M and one inverter replacement. */
export function financialModel(i: FinancialModelInput): FinancialModelResult {
  const flows = [-i.systemCostPhp];
  let cum = -i.systemCostPhp;
  let paybackYears: number | null = null;
  const years: FinancialYear[] = [];
  for (let y = 1; y <= i.years; y++) {
    const prod = i.year1Kwh * Math.pow(1 - i.degradationPct / 100, y - 1);
    const rate = i.ratePhpPerKwh * Math.pow(1 + i.escalationPct / 100, y - 1);
    const exp = i.exportCreditPhpPerKwh * Math.pow(1 + i.escalationPct / 100, y - 1);
    const self = (prod * i.selfUsePct) / 100;
    const savings = self * rate + (prod - self) * exp;
    const om = i.omPhpPerYear * Math.pow(1 + i.inflationPct / 100, y - 1);
    const capex = y === i.inverterReplaceYear ? i.inverterReplaceCostPhp : 0;
    const net = savings - om - capex;
    const before = cum;
    cum += net;
    flows.push(net);
    if (paybackYears === null && cum >= 0) paybackYears = y - 1 + (net > 0 ? -before / net : 0);
    years.push({
      year: y,
      productionKwh: prod,
      savingsPhp: savings,
      netPhp: net,
      cumulativePhp: cum,
    });
  }
  const npv = (r: number) => flows.reduce((a, f, t) => a + f / Math.pow(1 + r, t), 0);
  let irr: number | null = null;
  if (npv(-0.99) * npv(10) < 0) {
    let lo = -0.99;
    let hi = 10;
    for (let k = 0; k < 200; k++) {
      const m = (lo + hi) / 2;
      if (npv(lo) * npv(m) <= 0) hi = m;
      else lo = m;
    }
    irr = (lo + hi) / 2;
  }
  let discEnergy = 0;
  let discCost = i.systemCostPhp;
  years.forEach((yr, k) => {
    const d = Math.pow(1 + i.discountPct / 100, k + 1);
    discEnergy += yr.productionKwh / d;
    discCost +=
      (i.omPhpPerYear * Math.pow(1 + i.inflationPct / 100, k) +
        (k + 1 === i.inverterReplaceYear ? i.inverterReplaceCostPhp : 0)) /
      d;
  });
  return {
    totalSavingsPhp: years.reduce((a, yr) => a + yr.savingsPhp, 0),
    netGainPhp: cum,
    paybackYears,
    npvPhp: npv(i.discountPct / 100),
    irr,
    lcoePhpPerKwh: discEnergy > 0 ? discCost / discEnergy : null,
    year1SavingsPhp: years[0]?.savingsPhp ?? 0,
    finalYear: years[years.length - 1] ?? null,
    years,
    notes: paybackYears === null ? ['no_payback'] : [],
  };
}
