/** PVGIS API (EU JRC): Fallback or cross-check simulation, horizon profile. Real implementation arrives in phase 2. */
export interface HorizonPoint {
  azimuthDegrees: number;
  elevationDegrees: number;
}

export interface PvgisClient {
  annualSpecificYield(
    lat: number,
    lng: number,
    tiltDegrees: number,
    azimuthDegrees: number,
  ): Promise<number>;
  horizon(lat: number, lng: number): Promise<HorizonPoint[]>;
}

export class FakePvgis implements PvgisClient {
  async annualSpecificYield(): Promise<number> {
    return 1320;
  }
  async horizon(): Promise<HorizonPoint[]> {
    return [{ azimuthDegrees: 0, elevationDegrees: 2 }];
  }
}
