import { z } from 'zod';

export const PanelFitInputSchema = z.object({
  planeWidthM: z.number().positive(),
  planeHeightM: z.number().positive(),
  setbackM: z.number().nonnegative(),
  gapM: z.number().nonnegative(),
  panelWidthM: z.number().positive(),
  panelHeightM: z.number().positive(),
  panelWatts: z.number().positive(),
  maxPanels: z.number().int().nonnegative().optional(),
});
export type PanelFitInput = z.infer<typeof PanelFitInputSchema>;

export interface PanelFitResult {
  panels: number;
  orientation: 'portrait' | 'landscape' | null;
  cols: number;
  rows: number;
  kwp: number;
}

/** Panels that fit a rectangular roof plane after setbacks; the better of portrait and landscape. */
export function panelFit(i: PanelFitInput): PanelFitResult {
  const W = i.planeWidthM - 2 * i.setbackM;
  const H = i.planeHeightM - 2 * i.setbackM;
  if (W <= 0 || H <= 0) return { panels: 0, orientation: null, cols: 0, rows: 0, kwp: 0 };
  const fit = (pw: number, ph: number) => ({
    cols: Math.max(0, Math.floor((W + i.gapM) / (pw + i.gapM))),
    rows: Math.max(0, Math.floor((H + i.gapM) / (ph + i.gapM))),
  });
  const p = fit(i.panelWidthM, i.panelHeightM);
  const l = fit(i.panelHeightM, i.panelWidthM);
  const pn = p.cols * p.rows;
  const ln = l.cols * l.rows;
  const best =
    ln > pn
      ? { ...l, orientation: 'landscape' as const, panels: ln }
      : { ...p, orientation: 'portrait' as const, panels: pn };
  const panels = i.maxPanels != null ? Math.min(best.panels, i.maxPanels) : best.panels;
  return {
    panels,
    orientation: best.orientation,
    cols: best.cols,
    rows: best.rows,
    kwp: (panels * i.panelWatts) / 1000,
  };
}

export const RoofPlaneEnergySchema = z.object({
  kwp: z.number().nonnegative(),
  specificYieldKwhPerKwp: z.number().nonnegative(),
  shadingLossPct: z.number().min(0).max(100),
});
export type RoofPlaneEnergy = z.infer<typeof RoofPlaneEnergySchema>;

export interface SystemProductionResult {
  kwp: number;
  annualKwh: number;
  perPlaneKwh: number[];
  specificYield: number;
}

/** Combine roof planes' simulated yield and shading into annual production. */
export function systemProduction(planes: RoofPlaneEnergy[]): SystemProductionResult {
  let kwp = 0;
  let kwh = 0;
  const perPlaneKwh = planes.map((p) => {
    const e = p.kwp * p.specificYieldKwhPerKwp * (1 - p.shadingLossPct / 100);
    kwp += p.kwp;
    kwh += e;
    return e;
  });
  return { kwp, annualKwh: kwh, perPlaneKwh, specificYield: kwp > 0 ? kwh / kwp : 0 };
}
