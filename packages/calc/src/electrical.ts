import { z } from 'zod';

export const StringSizingInputSchema = z.object({
  voc: z.number().positive(),
  vmp: z.number().positive(),
  vocCoeffPct: z.number(),
  pmaxCoeffPct: z.number(),
  tMin: z.number(),
  tHot: z.number(),
  inverterMaxV: z.number().positive(),
  mpptLow: z.number().positive(),
  mpptHigh: z.number().positive(),
  isc: z.number().positive(),
  inverterMaxIsc: z.number().positive(),
});
export type StringSizingInput = z.infer<typeof StringSizingInputSchema>;

export interface StringSizingResult {
  vocCold: number;
  vmpHot: number;
  vmpCold: number;
  minPanels: number;
  maxPanels: number;
  valid: boolean;
  currentOk: boolean;
  notes: string[];
}

/** Panels per string from temperature-corrected voltages. Design aid; an engineer confirms. */
export function stringSizing(i: StringSizingInput): StringSizingResult {
  const vocCold = i.voc * (1 + ((i.tMin - 25) * i.vocCoeffPct) / 100);
  const vmpHot = i.vmp * (1 + ((i.tHot - 25) * i.pmaxCoeffPct) / 100);
  const vmpCold = i.vmp * (1 + ((i.tMin - 25) * i.pmaxCoeffPct) / 100);
  const maxPanels = Math.min(
    Math.floor(i.inverterMaxV / vocCold),
    Math.floor(i.mpptHigh / vmpCold),
  );
  const minPanels = Math.ceil(i.mpptLow / vmpHot);
  return {
    vocCold,
    vmpHot,
    vmpCold,
    minPanels,
    maxPanels,
    valid: minPanels <= maxPanels,
    currentOk: i.isc <= i.inverterMaxIsc,
    notes: ['engineer_review'],
  };
}

export const FUSE_SIZES_A = [10, 12, 15, 16, 20, 25, 30, 32] as const;

export const StringFuseInputSchema = z.object({
  isc: z.number().positive(),
  parallelStrings: z.number().int().positive(),
  moduleMaxSeriesFuseA: z.number().positive(),
});
export type StringFuseInput = z.infer<typeof StringFuseInputSchema>;

export interface StringFuseResult {
  minRatingA: number;
  suggestedFuseA: number | null;
  fuseRequired: boolean;
  withinModuleMax: boolean;
  notes: string[];
}

/** Minimum fuse 1.56 × Isc; fuses needed from 3 parallel strings. Confirm against the Philippine Electrical Code. */
export function stringFuse(i: StringFuseInput): StringFuseResult {
  const minA = i.isc * 1.56;
  const fuse = FUSE_SIZES_A.find((f) => f >= minA) ?? null;
  return {
    minRatingA: minA,
    suggestedFuseA: fuse,
    fuseRequired: i.parallelStrings >= 3,
    withinModuleMax: fuse !== null && fuse <= i.moduleMaxSeriesFuseA,
    notes: ['engineer_review'],
  };
}

export const WIRE_SIZES_MM2 = [2.5, 4, 6, 10, 16, 25, 35] as const;

export const VoltageDropInputSchema = z.object({
  voltage: z.number().positive(),
  currentA: z.number().nonnegative(),
  lengthM: z.number().nonnegative(),
  areaMm2: z.number().positive(),
  conductor: z.enum(['copper', 'aluminium']),
  targetPct: z.number().positive(),
});
export type VoltageDropInput = z.infer<typeof VoltageDropInputSchema>;

export interface VoltageDropResult {
  dropV: number;
  dropPct: number;
  lossW: number;
  ok: boolean;
  minSizeMm2: number | null;
  notes: string[];
}

/** Two-way run voltage drop and the smallest standard size that meets the target. */
export function voltageDrop(i: VoltageDropInput): VoltageDropResult {
  const rho = i.conductor === 'aluminium' ? 0.0282 : 0.0175;
  const drop = (2 * i.lengthM * i.currentA * rho) / i.areaMm2;
  const pct = i.voltage > 0 ? (drop / i.voltage) * 100 : 0;
  const minSize =
    WIRE_SIZES_MM2.find(
      (s) => ((2 * i.lengthM * i.currentA * rho) / s / i.voltage) * 100 <= i.targetPct,
    ) ?? null;
  return {
    dropV: drop,
    dropPct: pct,
    lossW: drop * i.currentA,
    ok: pct <= i.targetPct,
    minSizeMm2: minSize,
    notes: ['ampacity_checked_separately'],
  };
}

export const InverterRatioInputSchema = z.object({
  arrayKwp: z.number().nonnegative(),
  inverterAcKw: z.number().nonnegative(),
});
export type InverterRatioInput = z.infer<typeof InverterRatioInputSchema>;

export interface InverterRatioResult {
  ratio: number | null;
  flag: 'invalid' | 'undersized_array' | 'clipping_risk' | 'ok';
}

/** DC/AC ratio: below 1.0 the array is undersized, above 1.3 the inverter clips. */
export function inverterRatio(i: InverterRatioInput): InverterRatioResult {
  const ratio = i.inverterAcKw > 0 ? i.arrayKwp / i.inverterAcKw : null;
  return {
    ratio,
    flag:
      ratio === null
        ? 'invalid'
        : ratio < 1.0
          ? 'undersized_array'
          : ratio > 1.3
            ? 'clipping_risk'
            : 'ok',
  };
}
