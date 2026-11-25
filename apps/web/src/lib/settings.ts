import { type CalcConfig, CalcConfigSchema } from '@vserve/calc';
import { z } from 'zod';

/**
 * Calculator defaults. The live values come from the `settings` table (admin-editable, dated).
 * SEED_ROWS mirrors the rows inserted by supabase/migrations/20261125010000_core_tenancy.sql and is
 * only used when the database is not configured (local dev without Supabase, CI e2e). A unit test
 * fails if the two drift apart. Server code only: never import this into a client component.
 */
export interface FinanceDefaults {
  degradationPct: number;
  escalationPct: number;
  omInflationPct: number;
  discountPct: number;
  maxDtiPct: number;
}

export interface CalcSettings {
  config: CalcConfig;
  finance: FinanceDefaults;
  /** ISO date the defaults were last changed. */
  asOf: string;
  source: 'settings' | 'seed';
}

const FinanceSchema = z.object({
  degradationPct: z.number().min(0).max(100),
  escalationPct: z.number(),
  omInflationPct: z.number(),
  discountPct: z.number(),
  maxDtiPct: z.number().min(0).max(100),
});

export interface SettingRow {
  key: string;
  value: unknown;
  updated_at?: string;
}

export const SEED_AS_OF = '2026-10-31';

export const SEED_ROWS: SettingRow[] = [
  { key: 'calc.ratePhpPerKwh', value: 15.06 },
  { key: 'calc.yieldKwhPerKwpDay', value: 4.0 },
  { key: 'calc.panelWatts', value: 600 },
  { key: 'calc.panelAreaM2', value: 2.6 },
  { key: 'calc.priceLowPerKwp', value: 50000 },
  { key: 'calc.priceHighPerKwp', value: 70000 },
  { key: 'calc.exportCreditPhpPerKwh', value: 5.5 },
  { key: 'calc.daysPerMonth', value: 30 },
  { key: 'finance.degradationPct', value: 0.5 },
  { key: 'finance.escalationPct', value: 2 },
  { key: 'finance.omInflationPct', value: 3 },
  { key: 'finance.discountPct', value: 8 },
  { key: 'finance.maxDtiPct', value: 35 },
];

/** Turns `settings` rows into a validated config. Returns null if anything is missing or invalid. */
export function settingsFromRows(
  rows: SettingRow[],
  source: CalcSettings['source'],
  fallbackAsOf = SEED_AS_OF,
): CalcSettings | null {
  const calc: Record<string, number> = {};
  const finance: Record<string, number> = {};
  let asOf = '';
  for (const r of rows) {
    const n = typeof r.value === 'number' ? r.value : Number(r.value);
    if (!Number.isFinite(n)) continue;
    if (r.key.startsWith('calc.')) calc[r.key.slice(5)] = n;
    else if (r.key.startsWith('finance.')) finance[r.key.slice(8)] = n;
    else continue;
    if (r.updated_at && r.updated_at > asOf) asOf = r.updated_at;
  }
  const c = CalcConfigSchema.safeParse(calc);
  const f = FinanceSchema.safeParse(finance);
  if (!c.success || !f.success) return null;
  return {
    config: c.data,
    finance: f.data,
    asOf: asOf ? asOf.slice(0, 10) : fallbackAsOf,
    source,
  };
}

export const SEED_SETTINGS = settingsFromRows(SEED_ROWS, 'seed') as CalcSettings;

/** Loads defaults from Supabase (public read, cached for an hour); falls back to the seed rows. */
export async function loadCalcSettings(): Promise<CalcSettings> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return SEED_SETTINGS;
  try {
    const res = await fetch(
      `${url}/rest/v1/settings?select=key,value,updated_at&or=(key.like.calc.*,key.like.finance.*)`,
      { headers: { apikey: key, authorization: `Bearer ${key}` }, next: { revalidate: 3600 } },
    );
    if (!res.ok) return SEED_SETTINGS;
    const rows = (await res.json()) as SettingRow[];
    return settingsFromRows(rows, 'settings') ?? SEED_SETTINGS;
  } catch {
    return SEED_SETTINGS;
  }
}

/** "Oct 2026", shown next to every default. */
export function formatAsOf(iso: string): string {
  const d = new Date(`${iso}T12:00:00+08:00`);
  return d.toLocaleDateString('en-PH', {
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Manila',
  });
}
