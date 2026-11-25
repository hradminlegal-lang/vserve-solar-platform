import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  APPLIANCE_FIELDS,
  BILL_FIELDS,
  type CalculatorKind,
  defaultsFor,
  FIELDS,
  getterFrom,
  parseFields,
  parseQuoteDocs,
  QUOTE_DEFAULT_DOCS,
  runCalculator,
  toCentavos,
  toSavedRecord,
} from './calculators';
import { SEED_SETTINGS } from './settings';

interface Vector {
  input: unknown;
  expected: Record<string, unknown>;
}
function golden(fn: string): Vector[] {
  const file = join(__dirname, `../../../../tests/golden/${fn}.json`);
  return (JSON.parse(readFileSync(file, 'utf8')) as { vectors: Vector[] }).vectors;
}
function expectClose(actual: Record<string, unknown>, expected: Record<string, unknown>) {
  for (const [k, v] of Object.entries(expected)) {
    if (typeof v === 'number') expect(actual[k], k).toBeCloseTo(v, 2);
    else if (v && typeof v === 'object' && !Array.isArray(v))
      expectClose(actual[k] as Record<string, unknown>, v as Record<string, unknown>);
    else expect(actual[k], k).toEqual(v);
  }
}

const run = (kind: CalculatorKind) =>
  runCalculator(kind, defaultsFor(kind, SEED_SETTINGS), SEED_SETTINGS);

describe('worked examples equal the first golden vector', () => {
  it('bill to system', () => {
    const r = run('bill');
    expect(r.input).toEqual(golden('billToSystem')[0]!.input);
    expectClose(r.result as never, golden('billToSystem')[0]!.expected);
  });
  it('appliances and what it can run', () => {
    const r = run('appliances');
    if (r.kind !== 'appliances') throw new Error();
    expectClose(r.result.load as never, golden('applianceLoad')[0]!.expected);
    const wcir = golden('whatCanItRun')[0]!;
    const expectedHours = wcir.expected.hours as number[];
    expect(r.result.run.hours.slice(0, expectedHours.length)).toEqual(
      expectedHours.map((h) => expect.closeTo(h, 2)),
    );
    expect(r.result.run.hours.slice(expectedHours.length)).toEqual([0, 0, 0]);
  });
  it('battery', () => {
    const r = run('battery');
    expect(r.input).toEqual(golden('batteryBackup')[0]!.input);
    expectClose(r.result as never, golden('batteryBackup')[0]!.expected);
  });
  it('savings uses settings for rate, export credit, inflation and discount', () => {
    const r = run('savings');
    expect(r.input).toEqual(golden('financialModel')[0]!.input);
    expectClose(r.result as never, golden('financialModel')[0]!.expected);
  });
  it('quote checker', () => {
    const r = run('quote');
    const [q, usage] = golden('quoteScore')[0]!.input as [Record<string, number>, number];
    expect(r.input).toEqual({ ...q, usageKwh: usage });
    expectClose(r.result as never, golden('quoteScore')[0]!.expected);
  });
  it('loan vs savings', () => {
    const r = run('loan');
    expect(r.input).toEqual(golden('loanVsSavings')[0]!.input);
    expectClose(r.result as never, golden('loanVsSavings')[0]!.expected);
  });
});

describe('reading form values', () => {
  it('keeps defaults when nothing was submitted', () => {
    const p = parseFields(BILL_FIELDS, defaultsFor('bill', SEED_SETTINGS), () => undefined);
    expect(p).toEqual({
      values: { bill: 6000, daytime: 60, offset: 80 },
      errors: {},
      submitted: false,
    });
  });

  it('reads commas, rejects out-of-range and non-numbers with a message', () => {
    const get = getterFrom({ bill: '12,000', daytime: '150', offset: 'abc' });
    const p = parseFields(BILL_FIELDS, defaultsFor('bill', SEED_SETTINGS), get);
    expect(p.values).toEqual({ bill: 12000, daytime: 60, offset: 80 });
    expect(p.errors.daytime).toBe('Enter a number from 0 to 100.');
    expect(p.errors.offset).toBe('Enter a number from 0 to 200.');
    expect(p.submitted).toBe(true);
  });

  it('requires whole numbers for counts', () => {
    const p = parseFields(APPLIANCE_FIELDS, defaultsFor('appliances', SEED_SETTINGS), (k) =>
      k === 'q0' ? '1.5' : undefined,
    );
    expect(p.errors.q0).toMatch(/whole number/);
  });

  it('reads search params arrays and FormData the same way', () => {
    const fd = new FormData();
    fd.set('bill', '3000');
    expect(getterFrom(fd)('bill')).toBe('3000');
    expect(getterFrom({ bill: ['3000', '9'] })('bill')).toBe('3000');
    expect(getterFrom(fd)('missing')).toBeUndefined();
  });

  it('quote documentation boxes: defaults until submitted, then only the ticked ones', () => {
    expect(parseQuoteDocs(() => undefined, false, QUOTE_DEFAULT_DOCS).filter(Boolean)).toHaveLength(
      11,
    );
    const ticked = parseQuoteDocs(
      (k) => (k === 'd0' || k === 'd3' ? 'on' : undefined),
      true,
      QUOTE_DEFAULT_DOCS,
    );
    expect(ticked.filter(Boolean)).toHaveLength(2);
  });

  it('every calculator has unique field keys and defaults inside their ranges', () => {
    for (const kind of Object.keys(FIELDS) as CalculatorKind[]) {
      const d = defaultsFor(kind, SEED_SETTINGS);
      const keys = FIELDS[kind].map((f) => f.key);
      expect(new Set(keys).size).toBe(keys.length);
      for (const f of FIELDS[kind]) {
        expect(d[f.key], `${kind}.${f.key}`).toBeGreaterThanOrEqual(f.min);
        expect(d[f.key], `${kind}.${f.key}`).toBeLessThanOrEqual(f.max);
      }
    }
  });
});

describe('saved records', () => {
  it('store money as integer centavos and drop yearly rows', () => {
    const rec = toSavedRecord(run('savings'), new Date('2026-11-25T00:00:00Z'));
    expect(rec.engineVersion).toBe('1.0.0');
    expect(rec.savedAt).toBe('2026-11-25T00:00:00.000Z');
    const input = rec.input as Record<string, number>;
    expect(input.systemCostCentavos).toBe(25_000_000);
    expect(input.ratePhpPerKwh).toBeUndefined();
    expect(input.rateCentavosPerKwh).toBe(1506);
    const result = rec.result as Record<string, unknown>;
    expect(result.years).toBeUndefined();
    expect(Number.isInteger(result.totalSavingsCentavos)).toBe(true);
  });

  it('converts money keys without a Php suffix', () => {
    expect(
      toCentavos({ monthlyPayment: 4671.234, panels: 7, nested: [{ priceLow: 1.25 }] }),
    ).toEqual({
      monthlyPaymentCentavos: 467123,
      panels: 7,
      nested: [{ priceLowCentavos: 125 }],
    });
  });
});
