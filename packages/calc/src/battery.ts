import { z } from 'zod';

export const BatteryBackupInputSchema = z.object({
  essentialLoadW: z.number().nonnegative(),
  backupHours: z.number().nonnegative(),
  aircondW: z.number().nonnegative(),
  aircondHours: z.number().nonnegative(),
  depthOfDischargePct: z.number().gt(0).max(100),
  inverterEfficiencyPct: z.number().gt(0).max(100),
});
export type BatteryBackupInput = z.infer<typeof BatteryBackupInputSchema>;

export interface BatteryBackupResult {
  neededKwh: number;
  nominalKwh: number | null;
  hybridInverterMinKw: number;
  notes: string[];
}

/** Battery size for the loads a customer wants during a brownout. */
export function batteryBackup(i: BatteryBackupInput): BatteryBackupResult {
  const neededKwh = (i.essentialLoadW * i.backupHours + i.aircondW * i.aircondHours) / 1000;
  const denom = (i.depthOfDischargePct / 100) * (i.inverterEfficiencyPct / 100);
  return {
    neededKwh,
    nominalKwh: denom > 0 ? neededKwh / denom : null,
    hybridInverterMinKw: ((i.essentialLoadW + i.aircondW) * 1.25) / 1000,
    notes: denom > 0 ? [] : ['invalid_dod_or_efficiency'],
  };
}
