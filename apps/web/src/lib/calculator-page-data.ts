import type { Metadata } from 'next';
import { contentFor } from './calculator-content';
import {
  CALCULATOR_PATHS,
  type CalculatorKind,
  defaultsFor,
  FIELDS,
  getterFrom,
  parseFields,
} from './calculators';
import { loadCalcSettings, SEED_SETTINGS } from './settings';

export type SearchParams = Record<string, string | string[] | undefined>;

/** Everything a calculator page needs: settings, parsed values and the page words. */
export async function loadCalculatorPage(kind: CalculatorKind, sp: SearchParams) {
  const settings = await loadCalcSettings();
  const get = getterFrom(sp);
  const parsed = parseFields(FIELDS[kind], defaultsFor(kind, settings), get);
  return {
    settings,
    get,
    parsed,
    content: contentFor(kind, settings),
    path: CALCULATOR_PATHS[kind],
  };
}

export function calculatorMetadata(kind: CalculatorKind): Metadata {
  const c = contentFor(kind, SEED_SETTINGS);
  return {
    title: c.name,
    description: c.description,
    alternates: { canonical: CALCULATOR_PATHS[kind] },
    openGraph: { title: c.name, description: c.description, type: 'website' },
  };
}
