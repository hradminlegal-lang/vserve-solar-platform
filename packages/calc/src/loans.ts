import { z } from 'zod';
import { monthlyPayment } from './config';

export const LoanVsSavingsInputSchema = z.object({
  pricePhp: z.number().nonnegative(),
  downPaymentPhp: z.number().nonnegative(),
  annualRatePct: z.number().min(0),
  termYears: z.number().min(0),
  monthlySavingsPhp: z.number().nonnegative(),
  escalationPct: z.number(),
});
export type LoanVsSavingsInput = z.infer<typeof LoanVsSavingsInputSchema>;

export interface LoanVsSavingsResult {
  monthlyPayment: number;
  monthlyCashFlow: number;
  totalInterest: number;
  netGain25y: number;
  breakEvenMonth: number | null;
  notes: string[];
}

/** One loan against bill savings over 25 years (300 months); savings escalate yearly. */
export function loanVsSavings(i: LoanVsSavingsInput): LoanVsSavingsResult {
  const P = Math.max(0, i.pricePhp - i.downPaymentPhp);
  const n = Math.round(i.termYears * 12);
  const payment = monthlyPayment(P, i.annualRatePct, n);
  let cumulative = -i.downPaymentPhp;
  let breakEvenMonth: number | null = null;
  let totalSavings = 0;
  for (let m = 1; m <= 300; m++) {
    const s = i.monthlySavingsPhp * Math.pow(1 + i.escalationPct / 100, Math.floor((m - 1) / 12));
    totalSavings += s;
    cumulative += s - (m <= n ? payment : 0);
    if (breakEvenMonth === null && cumulative >= 0) breakEvenMonth = m;
  }
  return {
    monthlyPayment: payment,
    monthlyCashFlow: i.monthlySavingsPhp - payment,
    totalInterest: payment * n - P,
    netGain25y: totalSavings - i.downPaymentPhp - payment * n,
    breakEvenMonth,
    notes: breakEvenMonth === null ? ['no_break_even'] : [],
  };
}

export const LenderOfferSchema = z.object({
  lender: z.string(),
  annualRatePct: z.number().min(0),
  termYears: z.number().positive(),
  minDownPct: z.number().min(0).max(100),
  feesPct: z.number().min(0),
  minLoanPhp: z.number().min(0),
  maxLoanPhp: z.number().min(0),
});
export type LenderOffer = z.infer<typeof LenderOfferSchema>;

export interface LoanOfferResult {
  lender: string;
  eligible: boolean;
  downPaymentPhp: number;
  principalPhp: number;
  monthlyPaymentPhp: number;
  totalInterestPhp: number;
  upfrontPhp: number;
  totalCostPhp: number;
  monthlyCashFlowPhp: number;
}

/** Each lender offer for one system price. Offers come from `lender_products`, never hard-coded. */
export function loanCompare(
  pricePhp: number,
  monthlySavingsPhp: number,
  offers: LenderOffer[],
): LoanOfferResult[] {
  return offers.map((o) => {
    const down = (pricePhp * o.minDownPct) / 100;
    const principal = pricePhp - down;
    const eligible = principal >= o.minLoanPhp && principal <= o.maxLoanPhp;
    const n = Math.round(o.termYears * 12);
    const pay = monthlyPayment(principal, o.annualRatePct, n);
    const fees = (principal * o.feesPct) / 100;
    return {
      lender: o.lender,
      eligible,
      downPaymentPhp: down,
      principalPhp: principal,
      monthlyPaymentPhp: pay,
      totalInterestPhp: pay * n - principal,
      upfrontPhp: down + fees,
      totalCostPhp: down + fees + pay * n,
      monthlyCashFlowPhp: monthlySavingsPhp - pay,
    };
  });
}

export const AffordabilityInputSchema = z.object({
  grossMonthlyIncomePhp: z.number().nonnegative(),
  existingMonthlyDebtPhp: z.number().nonnegative(),
  maxDtiPct: z.number().min(0).max(100),
  annualRatePct: z.number().min(0),
  termYears: z.number().positive(),
  cashAvailablePhp: z.number().nonnegative(),
  systemPricePhp: z.number().nonnegative(),
});
export type AffordabilityInput = z.infer<typeof AffordabilityInputSchema>;

export interface AffordabilityResult {
  maxMonthlyPaymentPhp: number;
  maxLoanPhp: number;
  affordsSystem: boolean;
  notes: string[];
}

/** Indicative only: the lender decides. */
export function affordability(i: AffordabilityInput): AffordabilityResult {
  const maxPayment = Math.max(
    0,
    (i.grossMonthlyIncomePhp * i.maxDtiPct) / 100 - i.existingMonthlyDebtPhp,
  );
  const r = i.annualRatePct / 1200;
  const n = Math.round(i.termYears * 12);
  const maxLoan =
    n > 0 ? (r > 0 ? (maxPayment * (1 - Math.pow(1 + r, -n))) / r : maxPayment * n) : 0;
  return {
    maxMonthlyPaymentPhp: maxPayment,
    maxLoanPhp: maxLoan,
    affordsSystem: maxLoan + i.cashAvailablePhp >= i.systemPricePhp,
    notes: ['lender_decides'],
  };
}
