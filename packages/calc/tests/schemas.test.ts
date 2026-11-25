import { describe, expect, it } from 'vitest';
import {
  BatteryBackupInputSchema,
  BillToSystemInputSchema,
  CalcConfigSchema,
  DEFAULT_CONFIG,
  ENGINE_VERSION,
  QuoteInputSchema,
  VoltageDropInputSchema,
  cleaningPrice,
  monthlyPayment,
} from '../src/index';

describe('input schemas', () => {
  it('accepts the default config', () => {
    expect(CalcConfigSchema.parse(DEFAULT_CONFIG)).toEqual(DEFAULT_CONFIG);
  });

  it('rejects a negative bill and a share over 100%', () => {
    expect(
      BillToSystemInputSchema.safeParse({ monthlyBillPhp: -1, daytimeSharePct: 50, offsetPct: 80 })
        .success,
    ).toBe(false);
    expect(
      BillToSystemInputSchema.safeParse({
        monthlyBillPhp: 6000,
        daytimeSharePct: 120,
        offsetPct: 80,
      }).success,
    ).toBe(false);
  });

  it('rejects a quote with zero kWp, which the engine would otherwise score', () => {
    expect(
      QuoteInputSchema.safeParse({
        totalPricePhp: 1,
        kwp: 0,
        batteryPricePhp: 0,
        claimedKwhMonth: 0,
        itemsInWriting: 0,
      }).success,
    ).toBe(false);
  });

  it('rejects a zero depth of discharge', () => {
    expect(
      BatteryBackupInputSchema.safeParse({
        essentialLoadW: 400,
        backupHours: 6,
        aircondW: 0,
        aircondHours: 0,
        depthOfDischargePct: 0,
        inverterEfficiencyPct: 90,
      }).success,
    ).toBe(false);
  });

  it('only accepts copper or aluminium conductors', () => {
    expect(
      VoltageDropInputSchema.safeParse({
        voltage: 230,
        currentA: 10,
        lengthM: 10,
        areaMm2: 4,
        conductor: 'gold',
        targetPct: 2,
      }).success,
    ).toBe(false);
  });
});

describe('helpers', () => {
  it('prices cleaning by tier and asks for a quote above 10 kWp', () => {
    expect([
      cleaningPrice(3),
      cleaningPrice(3.01),
      cleaningPrice(5),
      cleaningPrice(10),
      cleaningPrice(10.1),
    ]).toEqual([1500, 2500, 2500, 4000, null]);
  });

  it('returns zero payment for a zero-month loan', () => {
    expect(monthlyPayment(100000, 9, 0)).toBe(0);
  });

  it('has a semantic engine version', () => {
    expect(ENGINE_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
