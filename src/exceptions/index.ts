export class SimpleVerifyError extends Error {
  public readonly httpStatus?: number;
  public readonly errorCode?: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    httpStatus?: number,
    errorCode?: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'SimpleVerifyError';
    this.httpStatus = httpStatus;
    this.errorCode = errorCode;
    this.details = details;
  }
}

export class ApiError extends SimpleVerifyError {
  constructor(message: string, httpStatus?: number, errorCode?: string, details?: Record<string, unknown>) {
    super(message, httpStatus, errorCode, details);
    this.name = 'ApiError';
  }
}

export class AuthenticationError extends SimpleVerifyError {
  constructor(message: string, httpStatus?: number, errorCode?: string, details?: Record<string, unknown>) {
    super(message, httpStatus, errorCode, details);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends SimpleVerifyError {
  constructor(message: string, httpStatus?: number, errorCode?: string, details?: Record<string, unknown>) {
    super(message, httpStatus, errorCode, details);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends SimpleVerifyError {
  public readonly retryAfterSeconds: number;

  constructor(message: string, httpStatus?: number, errorCode?: string, details?: Record<string, unknown>) {
    super(message, httpStatus, errorCode, details);
    this.name = 'RateLimitError';
    this.retryAfterSeconds = (details?.retry_after_seconds as number) ?? 0;
  }
}

export class NotFoundError extends SimpleVerifyError {
  constructor(message: string, httpStatus?: number, errorCode?: string, details?: Record<string, unknown>) {
    super(message, httpStatus, errorCode, details);
    this.name = 'NotFoundError';
  }
}

export class ConnectionError extends SimpleVerifyError {
  constructor(message: string) {
    super(message);
    this.name = 'ConnectionError';
  }
}
