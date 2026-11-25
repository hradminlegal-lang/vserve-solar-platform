/** Google Ads lead form webhooks: Lead capture from Google Ads lead forms. Real implementation arrives in phase 2. */
export interface IncomingLead {
  externalId: string;
  campaignId: string;
  fields: Record<string, string>;
  createdAt: string;
}

export interface LeadFormWebhook {
  verify(key: string, expectedKey: string): boolean;
  parse(rawBody: string): IncomingLead;
}

export class FakeGoogleAdsLeads implements LeadFormWebhook {
  verify(key: string, expectedKey: string): boolean {
    return key === expectedKey;
  }
  parse(rawBody: string): IncomingLead {
    return JSON.parse(rawBody) as IncomingLead;
  }
}
