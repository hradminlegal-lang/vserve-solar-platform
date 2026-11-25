/** Email (Resend or similar): Proposals and notifications. Real implementation arrives in phase 1. */
export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface EmailClient {
  send(message: EmailMessage): Promise<{ id: string }>;
}

export class FakeEmail implements EmailClient {
  readonly sent: EmailMessage[] = [];
  async send(message: EmailMessage): Promise<{ id: string }> {
    this.sent.push(message);
    return { id: `email_fake_${this.sent.length}` };
  }
}
