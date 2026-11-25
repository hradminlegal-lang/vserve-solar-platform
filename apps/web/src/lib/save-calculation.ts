import {
  type CalculatorKind,
  type CalculatorRun,
  defaultsFor,
  FIELDS,
  getterFrom,
  parseFields,
  parseQuoteDocs,
  QUOTE_DEFAULT_DOCS,
  runCalculator,
  toSavedRecord,
} from './calculators';
import type { CalcSettings } from './settings';

export type SavedRecord = ReturnType<typeof toSavedRecord>;

/** Customer profile columns a calculation can fill in (docs/data-model.md: customer_profiles). */
export interface ProfileColumns {
  rate_php_per_kwh?: number;
  daytime_share_pct?: number;
  budget_centavos?: number;
  financing_interest?: boolean;
}

/**
 * Where saved calculations go: `customer_profiles` (the columns above, plus the record under
 * `goals.calculators[kind]`). The Supabase implementation arrives with sign-in (prompt 04).
 */
export interface ProfileStore {
  saveCalculation(userId: string, record: SavedRecord, columns: ProfileColumns): Promise<void>;
}

export type SaveState =
  | { status: 'idle' }
  | { status: 'invalid'; message: string }
  | { status: 'signin'; message: string }
  | { status: 'unavailable'; message: string }
  | { status: 'saved'; message: string; record: SavedRecord };

const KINDS: CalculatorKind[] = ['bill', 'appliances', 'battery', 'savings', 'quote', 'loan'];

export function profileColumnsFor(run: CalculatorRun, s: CalcSettings): ProfileColumns {
  switch (run.kind) {
    case 'bill':
      return {
        rate_php_per_kwh: s.config.ratePhpPerKwh,
        daytime_share_pct: run.input.daytimeSharePct,
      };
    case 'loan':
      return { financing_interest: true };
    default:
      return {};
  }
}

/** Re-reads the submitted values, recomputes on the server and stores the result. */
export async function saveCalculationCore(
  form: FormData,
  deps: {
    settings: CalcSettings;
    userId: string | null;
    store: ProfileStore | null;
    now: Date;
  },
): Promise<SaveState> {
  const kind = form.get('kind');
  if (typeof kind !== 'string' || !KINDS.includes(kind as CalculatorKind)) {
    return { status: 'invalid', message: 'This calculator cannot be saved.' };
  }
  const k = kind as CalculatorKind;
  const get = getterFrom(form);
  const parsed = parseFields(FIELDS[k], defaultsFor(k, deps.settings), get);
  if (Object.keys(parsed.errors).length > 0) {
    return { status: 'invalid', message: 'Fix the highlighted values, then save.' };
  }
  const docs = k === 'quote' ? parseQuoteDocs(get, true, QUOTE_DEFAULT_DOCS) : undefined;
  const run = runCalculator(k, parsed.values, deps.settings, docs);
  const record = toSavedRecord(run, deps.now);
  if (!deps.userId) {
    return { status: 'signin', message: 'Sign in to save this to your profile.' };
  }
  if (!deps.store) {
    return { status: 'unavailable', message: 'Saving is not available yet. Please try later.' };
  }
  await deps.store.saveCalculation(deps.userId, record, profileColumnsFor(run, deps.settings));
  return { status: 'saved', message: 'Saved to your profile.', record };
}
