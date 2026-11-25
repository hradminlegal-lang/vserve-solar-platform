/** E-signature provider: Contracts. Real implementation arrives in phase 3. */
export interface SignatureRequest {
  documentPdfBase64: string;
  signerName: string;
  signerEmail: string;
}

export interface ESignClient {
  requestSignature(req: SignatureRequest): Promise<{ envelopeId: string; signingUrl: string }>;
}

export class FakeESign implements ESignClient {
  async requestSignature(req: SignatureRequest) {
    return {
      envelopeId: 'env_fake',
      signingUrl: `https://example.test/sign/${encodeURIComponent(req.signerEmail)}`,
    };
  }
}
