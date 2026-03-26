import { describe, it, expect } from 'vitest';
import { createClient } from './helpers';

describe('VerificationsResource', () => {
  it('sends an SMS verification', async () => {
    const { client, requests } = createClient([{
      body: {
        status: 'success',
        data: {
          verification_id: 'abc-123',
          type: 'sms',
          destination: '*******4567',
          status: 'pending',
          expires_at: '2026-03-25T12:10:00+00:00',
          environment: 'test',
          test: { code: '482913' },
        },
      },
      status: 201,
    }]);

    const result = await client.verifications.send({
      type: 'sms',
      destination: '+15551234567',
    });

    expect(result.verification_id).toBe('abc-123');
    expect(result.type).toBe('sms');
    expect(result.destination).toBe('*******4567');
    expect(result.status).toBe('pending');
    expect(result.environment).toBe('test');
    expect(result.test?.code).toBe('482913');
    expect(result.test?.token).toBeUndefined();

    expect(requests[0].url).toContain('/api/v1/verify/send');
    expect(requests[0].init.method).toBe('POST');
  });

  it('sends a magic link', async () => {
    const token = 'a'.repeat(64);
    const { client } = createClient([{
      body: {
        status: 'success',
        data: {
          verification_id: 'magic-456',
          type: 'magic_link',
          destination: 'u***@example.com',
          status: 'pending',
          expires_at: '2026-03-25T12:25:00+00:00',
          environment: 'test',
          test: { token },
        },
      },
      status: 201,
    }]);

    const result = await client.verifications.send({
      type: 'magic_link',
      destination: 'user@example.com',
      redirect_url: 'https://app.com/dashboard',
    });

    expect(result.type).toBe('magic_link');
    expect(result.test?.token).toBe(token);
    expect(result.test?.code).toBeUndefined();
  });

  it('handles live mode with no test data', async () => {
    const { client } = createClient([{
      body: {
        status: 'success',
        data: {
          verification_id: 'live-789',
          type: 'email',
          destination: 'u***@example.com',
          status: 'pending',
          expires_at: '2026-03-25T12:10:00+00:00',
          environment: 'live',
        },
      },
      status: 201,
    }]);

    const result = await client.verifications.send({
      type: 'email',
      destination: 'user@example.com',
    });

    expect(result.environment).toBe('live');
    expect(result.test).toBeUndefined();
  });

  it('checks a valid code', async () => {
    const { client, requests } = createClient([{
      body: {
        status: 'success',
        data: {
          verification_id: 'abc-123',
          valid: true,
          type: 'sms',
          destination: '*******4567',
        },
      },
      status: 200,
    }]);

    const result = await client.verifications.check('abc-123', '482913');

    expect(result.valid).toBe(true);
    expect(result.type).toBe('sms');
    expect(result.destination).toBe('*******4567');

    expect(requests[0].url).toContain('/api/v1/verify/check');
    expect(requests[0].init.method).toBe('POST');
  });

  it('checks an invalid code', async () => {
    const { client } = createClient([{
      body: {
        status: 'success',
        data: {
          verification_id: 'abc-123',
          valid: false,
        },
      },
      status: 200,
    }]);

    const result = await client.verifications.check('abc-123', '000000');

    expect(result.valid).toBe(false);
    expect(result.type).toBeUndefined();
    expect(result.destination).toBeUndefined();
  });

  it('gets verification status', async () => {
    const { client, requests } = createClient([{
      body: {
        status: 'success',
        data: {
          verification_id: 'abc-123',
          type: 'sms',
          destination: '*******4567',
          status: 'verified',
          expires_at: '2026-03-25T12:10:00+00:00',
          created_at: '2026-03-25T12:00:00+00:00',
        },
      },
      status: 200,
    }]);

    const result = await client.verifications.get('abc-123');

    expect(result.status).toBe('verified');
    expect(result.created_at).toBe('2026-03-25T12:00:00+00:00');

    expect(requests[0].url).toContain('/api/v1/verify/abc-123');
    expect(requests[0].init.method).toBe('GET');
  });
});
