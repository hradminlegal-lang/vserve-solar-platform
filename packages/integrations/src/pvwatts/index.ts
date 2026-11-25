/** NREL PVWatts v8 API: Per-roof-plane energy simulation. Real implementation arrives in phase 2. */
export interface PlaneSimulationInput {
  lat: number;
  lng: number;
  kwp: number;
  tiltDegrees: number;
  azimuthDegrees: number;
  lossesPct: number;
}

export interface PlaneSimulationResult {
  annualKwh: number;
  monthlyKwh: number[];
  dataset: string;
}

export interface EnergySimulator {
  simulate(input: PlaneSimulationInput): Promise<PlaneSimulationResult>;
}

export class FakePvWatts implements EnergySimulator {
  async simulate(input: PlaneSimulationInput): Promise<PlaneSimulationResult> {
    const annualKwh = (input.kwp * 1339 * (1 - input.lossesPct / 100)) / 0.86;
    return {
      annualKwh,
      monthlyKwh: Array.from({ length: 12 }, () => annualKwh / 12),
      dataset: 'fake',
    };
  }
}
