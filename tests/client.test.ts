import { describe, it, expect } from 'vitest';
import { SimpleVerifyClient } from '../src';
import { VALID_KEY } from './helpers';

describe('SimpleVerifyClient', () => {
  it('accepts a valid test key', () => {
    const client = new SimpleVerifyClient(VALID_KEY);
    expect(client).toBeDefined();
    expect(client.verifications).toBeDefined();
  });

  it('accepts a valid live key', () => {
    const key = 'vk_live_' + 'ab'.repeat(32);
    const client = new SimpleVerifyClient(key);
    expect(client).toBeDefined();
  });

  it('accepts options object', () => {
    const client = new SimpleVerifyClient({
      apiKey: VALID_KEY,
      baseUrl: 'https://custom.api.com',
      timeout: 60000,
    });
    expect(client).toBeDefined();
  });

  it('rejects empty key', () => {
    expect(() => new SimpleVerifyClient('')).toThrow('API key is required');
  });

  it('rejects missing key', () => {
    expect(() => new SimpleVerifyClient({ apiKey: '' })).toThrow('API key is required');
  });

  it('rejects invalid prefix', () => {
    const key = 'vk_bad_' + 'ab'.repeat(32);
    expect(() => new SimpleVerifyClient(key)).toThrow('Invalid API key format');
  });

  it('rejects short key', () => {
    expect(() => new SimpleVerifyClient('vk_test_tooshort')).toThrow('Invalid API key format');
  });

  it('returns same verifications instance', () => {
    const client = new SimpleVerifyClient(VALID_KEY);
    expect(client.verifications).toBe(client.verifications);
  });
});
