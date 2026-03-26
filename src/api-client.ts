import { ApiResponse, ApiErrorResponse } from './models';
import {
  ApiError,
  AuthenticationError,
  ConnectionError,
  NotFoundError,
  RateLimitError,
  SimpleVerifyError,
  ValidationError,
} from './exceptions';

export type FetchFunction = (url: string, init?: any) => Promise<any>;

export interface ApiClientOptions {
  apiKey: string;
  baseUrl: string;
  timeout: number;
  fetch?: FetchFunction;
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
let SDK_VERSION = 'dev';
try { SDK_VERSION = require('../package.json').version; } catch { /* bundled or missing */ }

export class ApiClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly fetchFn: FetchFunction;

  constructor(options: ApiClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.timeout = options.timeout;
    this.fetchFn = options.fetch ?? fetch;
  }

  async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = this.baseUrl + path;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    let response: any;
    try {
      response = await this.fetchFn(url, {
        method,
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': `simpleverify-node/${SDK_VERSION}`,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new ConnectionError('Request to SimpleVerify API timed out');
      }
      throw new ConnectionError(
        `Failed to connect to SimpleVerify API: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      clearTimeout(timeoutId);
    }

    let data: ApiResponse<T>;
    try {
      data = await response.json() as ApiResponse<T>;
    } catch {
      throw new ApiError('Invalid JSON response from SimpleVerify API', response.status);
    }

    if (data.status === 'error') {
      this.throwException(response.status, (data as ApiErrorResponse).error);
    }

    return (data as { status: 'success'; data: T }).data;
  }

  private throwException(
    httpStatus: number,
    error: { code: string; message: string; details?: Record<string, unknown> },
  ): never {
    const { message, code, details } = error;

    switch (httpStatus) {
      case 401:
        throw new AuthenticationError(message, httpStatus, code, details);
      case 404:
        throw new NotFoundError(message, httpStatus, code, details);
      case 422:
        throw new ValidationError(message, httpStatus, code, details);
      case 429:
        throw new RateLimitError(message, httpStatus, code, details);
      default:
        throw new ApiError(message, httpStatus, code, details);
    }
  }
}
