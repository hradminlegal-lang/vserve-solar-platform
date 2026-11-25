/** Google Maps JavaScript API, Geocoding, Places: Address entry and satellite map in the roof check and design studio. Real implementation arrives in phase 1. */
export interface GeocodeResult {
  formattedAddress: string;
  lat: number;
  lng: number;
  placeId?: string;
}

export interface GoogleMapsClient {
  geocode(address: string): Promise<GeocodeResult | null>;
}

export class FakeGoogleMaps implements GoogleMapsClient {
  async geocode(address: string): Promise<GeocodeResult | null> {
    if (!address.trim()) return null;
    return { formattedAddress: address, lat: 14.4273, lng: 120.9767, placeId: 'fake-place' };
  }
}
