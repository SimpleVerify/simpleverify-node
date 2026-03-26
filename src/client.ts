import { ApiClient, FetchFunction } from './api-client';
import { VerificationsResource } from './verifications';

const API_KEY_PATTERN = /^vk_(test|live)_[0-9a-f]{64}$/;

export interface SimpleVerifyOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  fetch?: FetchFunction;
}

export class SimpleVerifyClient {
  private _verifications?: VerificationsResource;
  private readonly apiClient: ApiClient;

  constructor(config: string | SimpleVerifyOptions) {
    const options: SimpleVerifyOptions = typeof config === 'string' ? { apiKey: config } : config;

    if (!options.apiKey) {
      throw new Error('API key is required.');
    }

    if (!API_KEY_PATTERN.test(options.apiKey)) {
      throw new Error('Invalid API key format. Expected vk_test_ or vk_live_ followed by 64 hex characters.');
    }

    this.apiClient = new ApiClient({
      apiKey: options.apiKey,
      baseUrl: options.baseUrl ?? 'https://api.simpleverify.io',
      timeout: options.timeout ?? 30000,
      fetch: options.fetch,
    });
  }

  get verifications(): VerificationsResource {
    return (this._verifications ??= new VerificationsResource(this.apiClient));
  }
}
