import {
  applianceLoad,
  type ApplianceItem,
  ApplianceListSchema,
  batteryBackup,
  BatteryBackupInputSchema,
  billToSystem,
  BillToSystemInputSchema,
  ENGINE_VERSION,
  financialModel,
  FinancialModelInputSchema,
  loanVsSavings,
  LoanVsSavingsInputSchema,
  QuoteInputSchema,
  quoteScore,
  whatCanItRun,
} from '@vserve/calc';
import type { CalcSettings } from './settings';

/**
 * Customer calculators: form fields, defaults and the one compute function per calculator.
 * Pages and the save action both call `runCalculator`, so a saved result always equals the
 * result the customer saw. Server code only.
 */

export interface NumField {
  key: string;
  label: string;
  unit?: string;
  min: number;
  max: number;
  step: number;
  help?: string;
  integer?: boolean;
}

export type Values = Record<string, number>;
export type RawGetter = (key: string) => string | undefined;

export interface Parsed {
  values: Values;
  errors: Record<string, string>;
  /** True when the customer submitted the form (any known field present). */
  submitted: boolean;
}

/** Reads each field; a missing or out-of-range value keeps its default and records an error. */
export function parseFields(fields: NumField[], defaults: Values, get: RawGetter): Parsed {
  const values: Values = { ...defaults };
  const errors: Record<string, string> = {};
  let submitted = false;
  for (const f of fields) {
    const raw = get(f.key);
    if (raw === undefined) continue;
    submitted = true;
    const trimmed = raw.trim().replace(/,/g, '');
    const n = trimmed === '' ? NaN : Number(trimmed);
    if (!Number.isFinite(n) || n < f.min || n > f.max || (f.integer && !Number.isInteger(n))) {
      errors[f.key] =
        `Enter ${f.integer ? 'a whole number' : 'a number'} from ${f.min.toLocaleString('en-PH')} to ${f.max.toLocaleString('en-PH')}.`;
      continue;
    }
    values[f.key] = n;
  }
  return { values, errors, submitted };
}

/** Wraps Next's searchParams (or FormData) as a getter. Arrays use their first value. */
export function getterFrom(
  source: Record<string, string | string[] | undefined> | { get(k: string): unknown },
): RawGetter {
  if (typeof (source as { get?: unknown }).get === 'function') {
    return (k) => {
      const v = (source as { get(k: string): unknown }).get(k);
      return typeof v === 'string' ? v : undefined;
    };
  }
  return (k) => {
    const v = (source as Record<string, string | string[] | undefined>)[k];
    return Array.isArray(v) ? v[0] : v;
  };
}

// ---------------------------------------------------------------- bill to system
export const BILL_FIELDS: NumField[] = [
  { key: 'bill', label: 'Average monthly bill', unit: '₱', min: 0, max: 1_000_000, step: 100 },
  {
    key: 'daytime',
    label: 'Share of power used in daytime',
    unit: '%',
    min: 0,
    max: 100,
    step: 5,
    help: 'Homes with someone in during the day are often 50–70%.',
  },
  {
    key: 'offset',
    label: 'How much of your usage to cover',
    unit: '%',
    min: 0,
    max: 200,
    step: 5,
  },
];

// ---------------------------------------------------------------- appliances
export const APPLIANCES = [
  { name: 'Aircon (1 HP)', w: 1100, q: 1, h: 6 },
  { name: 'Refrigerator', w: 100, q: 1, h: 24 },
  { name: 'Electric fan', w: 50, q: 3, h: 10 },
  { name: 'LED bulb', w: 10, q: 8, h: 6 },
  { name: 'Washing machine', w: 500, q: 1, h: 1 },
  { name: 'TV', w: 100, q: 0, h: 5 },
  { name: 'Rice cooker', w: 700, q: 0, h: 1 },
  { name: 'Laptop', w: 60, q: 0, h: 8 },
] as const;

export const APPLIANCE_FIELDS: NumField[] = [
  ...APPLIANCES.flatMap((a, i) => [
    { key: `w${i}`, label: `${a.name} watts`, unit: 'W', min: 0, max: 10_000, step: 10 },
    { key: `q${i}`, label: `${a.name} how many`, min: 0, max: 100, step: 1, integer: true },
    { key: `h${i}`, label: `${a.name} hours a day`, unit: 'h', min: 0, max: 24, step: 0.5 },
  ]),
  {
    key: 'kwp',
    label: 'Solar system size',
    unit: 'kWp',
    min: 0,
    max: 1000,
    step: 0.1,
    help: 'For "what can it run": each appliance alone on one day of solar energy.',
  },
];

function applianceItems(v: Values): ApplianceItem[] {
  return APPLIANCES.map((_, i) => ({
    watts: v[`w${i}`] ?? 0,
    qty: v[`q${i}`] ?? 0,
    hoursPerDay: v[`h${i}`] ?? 0,
  }));
}

// ---------------------------------------------------------------- battery
export const BATTERY_FIELDS: NumField[] = [
  {
    key: 'load',
    label: 'Essential load (lights, fans, fridge, Wi-Fi)',
    unit: 'W',
    min: 0,
    max: 50_000,
    step: 10,
  },
  { key: 'hours', label: 'Hours of backup', unit: 'h', min: 0, max: 72, step: 0.5 },
  { key: 'acw', label: 'Aircon during brownouts', unit: 'W', min: 0, max: 20_000, step: 50 },
  { key: 'ach', label: 'Aircon hours', unit: 'h', min: 0, max: 72, step: 0.5 },
  {
    key: 'dod',
    label: 'Usable share of the battery (depth of discharge)',
    unit: '%',
    min: 1,
    max: 100,
    step: 1,
    help: 'Lithium (LFP) batteries are usually 90%. Lead-acid about 50%.',
  },
  { key: 'eff', label: 'Inverter efficiency', unit: '%', min: 1, max: 100, step: 1 },
];

// ---------------------------------------------------------------- savings (25-year model)
export const SAVINGS_FIELDS: NumField[] = [
  { key: 'cost', label: 'System price', unit: '₱', min: 0, max: 100_000_000, step: 1000 },
  {
    key: 'kwh',
    label: 'Production in year 1',
    unit: 'kWh',
    min: 0,
    max: 10_000_000,
    step: 100,
    help: 'From your quote or the bill calculator.',
  },
  { key: 'esc', label: 'Electricity price rise per year', unit: '%', min: 0, max: 10, step: 0.5 },
  { key: 'self', label: 'Share you use directly', unit: '%', min: 0, max: 100, step: 5 },
  { key: 'deg', label: 'Panel output loss per year', unit: '%', min: 0, max: 2, step: 0.1 },
  { key: 'om', label: 'Upkeep per year', unit: '₱', min: 0, max: 1_000_000, step: 500 },
  {
    key: 'invYear',
    label: 'Inverter replaced in year (0 = never)',
    min: 0,
    max: 40,
    step: 1,
    integer: true,
  },
  {
    key: 'invCost',
    label: 'Inverter replacement cost',
    unit: '₱',
    min: 0,
    max: 10_000_000,
    step: 1000,
  },
  { key: 'years', label: 'Years to model', min: 1, max: 40, step: 1, integer: true },
];
export const SAVINGS_SLIDERS = ['esc', 'self', 'deg'];

// ---------------------------------------------------------------- quote checker
export const QUOTE_DOC_ITEMS = [
  'Panel brand and model',
  'Panel count and wattage',
  'Inverter brand and model',
  'Battery brand, model and kWh (or grid-tied, no battery)',
  'Mounting system',
  'Protection and wiring (breakers, SPD, DC isolator, cable sizes)',
  'Labour and installation days',
  'Permits and net-metering processing',
  'Panel product warranty years',
  'Panel performance warranty',
  'Inverter warranty years',
  'Workmanship warranty years',
] as const;

export const QUOTE_FIELDS: NumField[] = [
  { key: 'price', label: 'Total price incl. VAT', unit: '₱', min: 0, max: 100_000_000, step: 1000 },
  { key: 'kwp', label: 'System size', unit: 'kWp', min: 0.1, max: 1000, step: 0.1 },
  {
    key: 'battery',
    label: 'Battery price in the quote (0 if none)',
    unit: '₱',
    min: 0,
    max: 100_000_000,
    step: 1000,
  },
  {
    key: 'claim',
    label: 'Production the quote promises per month',
    unit: 'kWh',
    min: 0,
    max: 1_000_000,
    step: 10,
  },
  { key: 'usage', label: 'Your monthly usage', unit: 'kWh', min: 0, max: 1_000_000, step: 10 },
];

/** Checkbox params d0…d11. Unchecked boxes are absent once the form has been submitted. */
export function parseQuoteDocs(get: RawGetter, submitted: boolean, defaults: boolean[]): boolean[] {
  return QUOTE_DOC_ITEMS.map((_, i) => (submitted ? get(`d${i}`) !== undefined : !!defaults[i]));
}

// ---------------------------------------------------------------- loan vs savings
export const LOAN_FIELDS: NumField[] = [
  { key: 'price', label: 'System price', unit: '₱', min: 0, max: 100_000_000, step: 1000 },
  { key: 'down', label: 'Down payment', unit: '₱', min: 0, max: 100_000_000, step: 1000 },
  {
    key: 'rate',
    label: 'Yearly interest rate your lender quotes',
    unit: '%',
    min: 0,
    max: 60,
    step: 0.25,
    help: 'Enter the rate from your lender. We do not suggest a rate here.',
  },
  { key: 'term', label: 'Loan term', unit: 'years', min: 0, max: 30, step: 1 },
  { key: 'save', label: 'Monthly bill savings', unit: '₱', min: 0, max: 10_000_000, step: 100 },
  { key: 'esc', label: 'Electricity price rise per year', unit: '%', min: 0, max: 10, step: 0.5 },
];

// ---------------------------------------------------------------- registry
export type CalculatorKind = 'bill' | 'appliances' | 'battery' | 'savings' | 'quote' | 'loan';

/** Worked examples. Each is the first golden vector for its function (tests/golden). */
export function defaultsFor(kind: CalculatorKind, s: CalcSettings): Values {
  switch (kind) {
    case 'bill':
      return { bill: 6000, daytime: 60, offset: 80 };
    case 'appliances':
      return {
        ...Object.fromEntries(
          APPLIANCES.flatMap((a, i) => [
            [`w${i}`, a.w],
            [`q${i}`, a.q],
            [`h${i}`, a.h],
          ]),
        ),
        kwp: 3,
      };
    case 'battery':
      return { load: 400, hours: 6, acw: 0, ach: 0, dod: 90, eff: 90 };
    case 'savings':
      return {
        cost: 250000,
        kwh: 6000,
        esc: s.finance.escalationPct,
        self: 65,
        deg: s.finance.degradationPct,
        om: 3000,
        invYear: 12,
        invCost: 45000,
        years: 25,
      };
    case 'quote':
      return { price: 245000, kwp: 4.2, battery: 0, claim: 500, usage: 400 };
    case 'loan':
      return { price: 250000, down: 25000, rate: 9, term: 5, save: 4800, esc: 0 };
  }
}

export const FIELDS: Record<CalculatorKind, NumField[]> = {
  bill: BILL_FIELDS,
  appliances: APPLIANCE_FIELDS,
  battery: BATTERY_FIELDS,
  savings: SAVINGS_FIELDS,
  quote: QUOTE_FIELDS,
  loan: LOAN_FIELDS,
};

/** Quote worked example: 11 of 12 documentation items in writing. */
export const QUOTE_DEFAULT_DOCS = QUOTE_DOC_ITEMS.map((_, i) => i < 11);

export function runCalculator(kind: CalculatorKind, v: Values, s: CalcSettings, docs?: boolean[]) {
  const c = s.config;
  switch (kind) {
    case 'bill': {
      const input = BillToSystemInputSchema.parse({
        monthlyBillPhp: v.bill,
        daytimeSharePct: v.daytime,
        offsetPct: v.offset,
      });
      return { kind, input, result: billToSystem(input, c) } as const;
    }
    case 'appliances': {
      const items = ApplianceListSchema.parse(applianceItems(v));
      const kwp = v.kwp ?? 0;
      return {
        kind,
        input: { items, systemKwp: kwp },
        result: { load: applianceLoad(items, c), run: whatCanItRun(kwp, items, c) },
      } as const;
    }
    case 'battery': {
      const input = BatteryBackupInputSchema.parse({
        essentialLoadW: v.load,
        backupHours: v.hours,
        aircondW: v.acw,
        aircondHours: v.ach,
        depthOfDischargePct: v.dod,
        inverterEfficiencyPct: v.eff,
      });
      return { kind, input, result: batteryBackup(input) } as const;
    }
    case 'savings': {
      const input = FinancialModelInputSchema.parse({
        systemCostPhp: v.cost,
        year1Kwh: v.kwh,
        degradationPct: v.deg,
        ratePhpPerKwh: c.ratePhpPerKwh,
        exportCreditPhpPerKwh: c.exportCreditPhpPerKwh,
        escalationPct: v.esc,
        selfUsePct: v.self,
        omPhpPerYear: v.om,
        inflationPct: s.finance.omInflationPct,
        inverterReplaceYear: v.invYear,
        inverterReplaceCostPhp: v.invCost,
        years: v.years,
        discountPct: s.finance.discountPct,
      });
      return { kind, input, result: financialModel(input) } as const;
    }
    case 'quote': {
      const input = QuoteInputSchema.parse({
        totalPricePhp: v.price,
        kwp: v.kwp,
        batteryPricePhp: v.battery,
        claimedKwhMonth: v.claim,
        itemsInWriting: (docs ?? QUOTE_DEFAULT_DOCS).filter(Boolean).length,
      });
      const usageKwh = v.usage ?? 0;
      return {
        kind,
        input: { ...input, usageKwh },
        result: quoteScore(input, usageKwh, c),
      } as const;
    }
    case 'loan': {
      const input = LoanVsSavingsInputSchema.parse({
        pricePhp: v.price,
        downPaymentPhp: v.down,
        annualRatePct: v.rate,
        termYears: v.term,
        monthlySavingsPhp: v.save,
        escalationPct: v.esc,
      });
      return { kind, input, result: loanVsSavings(input) } as const;
    }
  }
}

export type CalculatorRun = ReturnType<typeof runCalculator>;

/**
 * A saved calculation. Money is stored as integer centavos (keys ending in `Php` become
 * `…Centavos`); yearly rows are dropped to keep the record small.
 */
export function toSavedRecord(run: CalculatorRun, savedAt: Date) {
  return {
    kind: run.kind,
    engineVersion: ENGINE_VERSION,
    savedAt: savedAt.toISOString(),
    input: toCentavos(run.input),
    result: toCentavos(run.result),
  };
}

/** Engine result keys that are peso amounts but do not end in `Php`. */
const MONEY_KEYS = new Set([
  'priceLow',
  'priceHigh',
  'perKwp',
  'monthlyPayment',
  'monthlyCashFlow',
  'totalInterest',
  'netGain25y',
]);

export function toCentavos(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(toCentavos);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (k === 'years' && Array.isArray(v)) continue;
      if (typeof v === 'number' && /Php/.test(k)) {
        out[k.replace(/Php/, 'Centavos')] = Math.round(v * 100);
      } else if (typeof v === 'number' && MONEY_KEYS.has(k)) {
        out[`${k}Centavos`] = Math.round(v * 100);
      } else out[k] = toCentavos(v);
    }
    return out;
  }
  return value;
}

export const CALCULATOR_PATHS: Record<CalculatorKind, string> = {
  bill: '/calculators/bill-to-system',
  appliances: '/calculators/appliances',
  battery: '/calculators/battery',
  savings: '/calculators/savings',
  quote: '/calculators/quote-checker',
  loan: '/calculators/loan-vs-savings',
};
