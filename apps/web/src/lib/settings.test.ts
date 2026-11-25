import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DEFAULT_CONFIG } from '@vserve/calc';
import { describe, expect, it } from 'vitest';
import { formatAsOf, SEED_ROWS, SEED_SETTINGS, settingsFromRows } from './settings';

const MIGRATION = join(
  __dirname,
  '../../../../supabase/migrations/20261125010000_core_tenancy.sql',
);

describe('calculator settings', () => {
  it('seed rows match the rows the migration inserts', () => {
    const sql = readFileSync(MIGRATION, 'utf8');
    const inserted = [...sql.matchAll(/\('((?:calc|finance)\.\w+)', '([\d.]+)'/g)].map((m) => ({
      key: m[1],
      value: Number(m[2]),
    }));
    expect(inserted).toEqual(SEED_ROWS);
  });

  it('seed config equals the engine defaults used by the golden vectors', () => {
    expect(SEED_SETTINGS.config).toEqual(DEFAULT_CONFIG);
    expect(SEED_SETTINGS.source).toBe('seed');
  });

  it('reads string values and takes the latest change date', () => {
    const rows = SEED_ROWS.map((r) => ({
      ...r,
      value: String(r.value),
      updated_at: '2026-09-01T00:00:00Z',
    }));
    rows[0] = { ...rows[0]!, value: '16.2', updated_at: '2026-11-02T03:00:00Z' };
    const s = settingsFromRows(rows, 'settings');
    expect(s?.config.ratePhpPerKwh).toBe(16.2);
    expect(s?.asOf).toBe('2026-11-02');
  });

  it('rejects incomplete or invalid settings', () => {
    expect(settingsFromRows(SEED_ROWS.slice(1), 'settings')).toBeNull();
    const bad = SEED_ROWS.map((r) => (r.key === 'calc.panelWatts' ? { ...r, value: -5 } : r));
    expect(settingsFromRows(bad, 'settings')).toBeNull();
  });

  it('formats the as-of date in Manila time', () => {
    expect(formatAsOf('2026-10-31')).toBe('Oct 2026');
  });
});
