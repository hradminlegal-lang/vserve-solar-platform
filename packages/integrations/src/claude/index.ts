/** Claude API: Bill reading, lead message drafts, plain-language summaries, moderation hints. Real implementation arrives in phase 1. */
export interface BillReading {
  utility: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  kwh: number | null;
  amountPhp: number | null;
  ratePhpPerKwh: number | null;
  accountLast4: string | null;
  confidence: Record<'utility' | 'period' | 'kwh' | 'amount' | 'rate' | 'account', number>;
}

export interface ClaudeClient {
  readBill(imageBase64: string, mediaType: string): Promise<BillReading>;
}

export class FakeClaude implements ClaudeClient {
  async readBill(_imageBase64: string, _mediaType: string): Promise<BillReading> {
    return {
      utility: 'Meralco',
      periodStart: '2026-09-15',
      periodEnd: '2026-10-14',
      kwh: 398,
      amountPhp: 6000,
      ratePhpPerKwh: 15.06,
      accountLast4: '1234',
      confidence: { utility: 0.99, period: 0.95, kwh: 0.97, amount: 0.98, rate: 0.9, account: 0.9 },
    };
  }
}
