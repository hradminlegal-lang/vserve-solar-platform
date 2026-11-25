import { billToSystem, DEFAULT_CONFIG } from '@vserve/calc';
import { describe, expect, it } from 'vitest';

describe('@vserve/calc from the web app', () => {
  it('sizes a ₱6,000 bill to 3.0 kWp with the default config', () => {
    const r = billToSystem(
      { monthlyBillPhp: 6000, daytimeSharePct: 60, offsetPct: 80 },
      DEFAULT_CONFIG,
    );
    expect(r.panels).toBe(5);
    expect(r.kwp).toBeCloseTo(3, 5);
  });
});
