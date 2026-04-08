import { ApiClient } from './api-client';
import { MagicLinkExchange, SendVerificationRequest, Verification, VerificationCheck } from './models';

export class VerificationsResource {
  constructor(private readonly apiClient: ApiClient) {}

  async send(params: SendVerificationRequest): Promise<Verification> {
    return this.apiClient.request<Verification>('POST', '/api/v1/verify/send', params);
  }

  async check(verificationId: string, code: string): Promise<VerificationCheck> {
    return this.apiClient.request<VerificationCheck>('POST', '/api/v1/verify/check', {
      verification_id: verificationId,
      code,
    });
  }

  async get(verificationId: string): Promise<Verification> {
    return this.apiClient.request<Verification>('GET', `/api/v1/verify/${encodeURIComponent(verificationId)}`);
  }

  async exchange(verificationId: string, exchangeCode: string): Promise<MagicLinkExchange> {
    return this.apiClient.request<MagicLinkExchange>('POST', '/api/v1/verify/exchange', {
      verification_id: verificationId,
      exchange_code: exchangeCode,
    });
  }
}
