import { describe, expect, it } from 'vitest';
import { type CalculatorKind, defaultsFor, runCalculator, toSavedRecord } from './calculators';
import { type ProfileStore, saveCalculationCore, type SavedRecord } from './save-calculation';
import { SEED_SETTINGS } from './settings';

const now = new Date('2026-11-25T01:00:00Z');

function fakeStore() {
  const saved: { userId: string; record: SavedRecord; columns: object }[] = [];
  const store: ProfileStore = {
    saveCalculation: async (userId, record, columns) => {
      saved.push({ userId, record, columns });
    },
  };
  return { store, saved };
}

function formFor(kind: CalculatorKind, values: Record<string, number | string>) {
  const fd = new FormData();
  fd.set('kind', kind);
  for (const [k, v] of Object.entries(values)) fd.set(k, String(v));
  return fd;
}

describe('save to my profile', () => {
  it('server-saved result equals what the page computed, for every calculator', async () => {
    for (const kind of ['bill', 'appliances', 'battery', 'savings', 'quote', 'loan'] as const) {
      const values = { ...defaultsFor(kind, SEED_SETTINGS) };
      const first = Object.keys(values)[0]!;
      values[first] = values[first]! + 1;
      const docs =
        kind === 'quote'
          ? [true, false, true, true, false, false, true, true, true, true, true, true]
          : undefined;
      const fd = formFor(kind, values);
      docs?.forEach((on, i) => on && fd.set(`d${i}`, 'on'));
      const page = toSavedRecord(runCalculator(kind, values, SEED_SETTINGS, docs), now);
      const { store, saved } = fakeStore();
      const res = await saveCalculationCore(fd, {
        settings: SEED_SETTINGS,
        userId: 'u1',
        store,
        now,
      });
      expect(res.status, kind).toBe('saved');
      expect(saved[0]!.record, kind).toEqual(page);
      expect(saved[0]!.userId).toBe('u1');
    }
  });

  it('bill fills the rate and daytime share columns; loan marks financing interest', async () => {
    const { store, saved } = fakeStore();
    await saveCalculationCore(formFor('bill', { bill: 4000, daytime: 55, offset: 90 }), {
      settings: SEED_SETTINGS,
      userId: 'u1',
      store,
      now,
    });
    await saveCalculationCore(formFor('loan', defaultsFor('loan', SEED_SETTINGS)), {
      settings: SEED_SETTINGS,
      userId: 'u1',
      store,
      now,
    });
    await saveCalculationCore(formFor('battery', defaultsFor('battery', SEED_SETTINGS)), {
      settings: SEED_SETTINGS,
      userId: 'u1',
      store,
      now,
    });
    expect(saved.map((s) => s.columns)).toEqual([
      { rate_php_per_kwh: 15.06, daytime_share_pct: 55 },
      { financing_interest: true },
      {},
    ]);
  });

  it('asks the customer to sign in and stores nothing when signed out', async () => {
    const { store, saved } = fakeStore();
    const res = await saveCalculationCore(formFor('bill', { bill: 4000 }), {
      settings: SEED_SETTINGS,
      userId: null,
      store,
      now,
    });
    expect(res).toEqual({ status: 'signin', message: 'Sign in to save this to your profile.' });
    expect(saved).toHaveLength(0);
  });

  it('rejects unknown calculators and invalid values', async () => {
    const deps = { settings: SEED_SETTINGS, userId: 'u1', store: fakeStore().store, now };
    expect((await saveCalculationCore(formFor('nope' as CalculatorKind, {}), deps)).status).toBe(
      'invalid',
    );
    expect((await saveCalculationCore(formFor('bill', { bill: -1 }), deps)).status).toBe('invalid');
  });

  it('reports when no profile store is configured', async () => {
    const res = await saveCalculationCore(formFor('bill', { bill: 4000 }), {
      settings: SEED_SETTINGS,
      userId: 'u1',
      store: null,
      now,
    });
    expect(res.status).toBe('unavailable');
  });
});
