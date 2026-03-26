import { ApiClient } from './api-client';
import { SendVerificationRequest, Verification, VerificationCheck } from './models';

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
}
