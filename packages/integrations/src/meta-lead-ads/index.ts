/** Meta Lead Ads webhooks: Lead capture from Facebook and Instagram ads. Real implementation arrives in phase 2. */
export interface IncomingLead {
  externalId: string;
  formId: string;
  fields: Record<string, string>;
  createdAt: string;
}

export interface LeadSource {
  verify(rawBody: string, signatureHeader: string): boolean;
  parse(rawBody: string): IncomingLead[];
}

export class FakeMetaLeadAds implements LeadSource {
  verify(_rawBody: string, signatureHeader: string): boolean {
    return signatureHeader === 'valid';
  }
  parse(rawBody: string): IncomingLead[] {
    return JSON.parse(rawBody) as IncomingLead[];
  }
}
