/** PayMongo: Checkout, milestone payments, refunds. Real implementation arrives in phase 4. */
export interface CheckoutRequest {
  referenceId: string;
  amountCentavos: number;
  description: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSession {
  id: string;
  checkoutUrl: string;
}

export interface PaymentsClient {
  createCheckout(req: CheckoutRequest): Promise<CheckoutSession>;
  verifyWebhook(rawBody: string, signatureHeader: string): boolean;
  refund(paymentId: string, amountCentavos: number, reason: string): Promise<{ id: string }>;
}

export class FakePayMongo implements PaymentsClient {
  async createCheckout(req: CheckoutRequest): Promise<CheckoutSession> {
    return {
      id: `cs_fake_${req.referenceId}`,
      checkoutUrl: `https://example.test/checkout/${req.referenceId}`,
    };
  }
  verifyWebhook(_rawBody: string, signatureHeader: string): boolean {
    return signatureHeader === 'valid';
  }
  async refund(paymentId: string): Promise<{ id: string }> {
    return { id: `ref_fake_${paymentId}` };
  }
}
