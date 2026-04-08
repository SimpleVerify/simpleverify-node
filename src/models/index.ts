export interface SendVerificationRequest {
  type: 'sms' | 'email' | 'magic_link';
  destination: string;
  redirect_url?: string;
  failure_redirect_url?: string;
  metadata?: Record<string, unknown>;
}

export interface Verification {
  verification_id: string;
  type: string;
  destination: string;
  status: string;
  expires_at?: string;
  environment?: string;
  created_at?: string;
  test?: TestData;
}

export interface VerificationCheck {
  verification_id: string;
  valid: boolean;
  type?: string;
  destination?: string;
}

export interface MagicLinkExchange {
  verification_id: string;
  type: string;
  destination: string;
  metadata: Record<string, unknown>;
  verified_at?: string;
  environment?: string;
}

export interface TestData {
  code?: string;
  token?: string;
}

export interface ApiErrorResponse {
  status: 'error';
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface ApiSuccessResponse<T> {
  status: 'success';
  data: T;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
