/** Google Open Buildings: Footprints where the Solar API has no building. Real implementation arrives in phase 2. */
export interface Footprint {
  id: string;
  polygon: [number, number][];
  areaM2: number;
  confidence: number;
}

export interface FootprintSource {
  nearest(lat: number, lng: number): Promise<Footprint | null>;
}

export class FakeOpenBuildings implements FootprintSource {
  async nearest(lat: number, lng: number): Promise<Footprint | null> {
    const d = 0.0001;
    return {
      id: 'fp_fake',
      polygon: [
        [lng, lat],
        [lng + d, lat],
        [lng + d, lat + d],
        [lng, lat + d],
        [lng, lat],
      ],
      areaM2: 120,
      confidence: 0.8,
    };
  }
}
