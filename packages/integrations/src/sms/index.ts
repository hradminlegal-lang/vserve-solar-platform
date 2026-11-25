/** SMS provider (Philippine sender ID): OTP and reminders. Real implementation arrives in phase 1. */
export interface SmsClient {
  send(toE164: string, message: string): Promise<{ id: string }>;
}

export class FakeSms implements SmsClient {
  readonly sent: { to: string; message: string }[] = [];
  async send(toE164: string, message: string): Promise<{ id: string }> {
    this.sent.push({ to: toE164, message });
    return { id: `sms_fake_${this.sent.length}` };
  }
}
