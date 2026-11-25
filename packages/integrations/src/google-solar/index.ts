/** Google Solar API (buildingInsights, dataLayers): Roof segments, panel potential, flux and shade rasters. Real implementation arrives in phase 1. */
export type ImageryQuality = 'HIGH' | 'MEDIUM' | 'BASE';

export interface RoofSegment {
  pitchDegrees: number;
  azimuthDegrees: number;
  areaM2: number;
}

export interface BuildingInsights {
  imageryQuality: ImageryQuality;
  imageryDate: string; // YYYY-MM-DD
  segments: RoofSegment[];
  maxPanels: number;
  maxAnnualKwh: number;
}

export interface SolarApiClient {
  findClosestBuilding(
    lat: number,
    lng: number,
    minQuality: ImageryQuality,
  ): Promise<BuildingInsights | null>;
}

export class FakeSolarApi implements SolarApiClient {
  async findClosestBuilding(
    _lat: number,
    _lng: number,
    _minQuality: ImageryQuality,
  ): Promise<BuildingInsights | null> {
    return {
      imageryQuality: 'BASE',
      imageryDate: '2025-01-15',
      segments: [{ pitchDegrees: 15, azimuthDegrees: 135, areaM2: 46.8 }],
      maxPanels: 9,
      maxAnnualKwh: 7228,
    };
  }
}
