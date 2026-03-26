import { describe, it, expect } from 'vitest';
import { createClient } from './helpers';
import {
  AuthenticationError,
  ValidationError,
  RateLimitError,
  NotFoundError,
} from '../src';

describe('Exception handling', () => {
  it('throws AuthenticationError on 401', async () => {
    const { client } = createClient([{
      body: {
        status: 'error',
        error: {
          code: 'INVALID_API_KEY',
          message: 'The provided API key is not valid.',
        },
      },
      status: 401,
    }]);

    await expect(
      client.verifications.send({ type: 'sms', destination: '+15551234567' }),
    ).rejects.toThrow(AuthenticationError);

    try {
      await client.verifications.send({ type: 'sms', destination: '+15551234567' });
    } catch (e) {
      // second call won't have a response queued, but first catch is what matters
    }
  });

  it('throws ValidationError on 422', async () => {
    const { client } = createClient([{
      body: {
        status: 'error',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'The given data was invalid.',
          details: { destination: ['Invalid phone number format.'] },
        },
      },
      status: 422,
    }]);

    try {
      await client.verifications.send({ type: 'sms', destination: 'bad' });
      expect.unreachable('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      const err = e as ValidationError;
      expect(err.httpStatus).toBe(422);
      expect(err.errorCode).toBe('VALIDATION_ERROR');
      expect(err.details).toHaveProperty('destination');
    }
  });

  it('throws RateLimitError on 429 with retryAfterSeconds', async () => {
    const { client } = createClient([{
      body: {
        status: 'error',
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many verification attempts.',
          details: { retry_after_seconds: 25 },
        },
      },
      status: 429,
    }]);

    try {
      await client.verifications.send({ type: 'sms', destination: '+15551234567' });
      expect.unreachable('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(RateLimitError);
      const err = e as RateLimitError;
      expect(err.httpStatus).toBe(429);
      expect(err.errorCode).toBe('RATE_LIMITED');
      expect(err.retryAfterSeconds).toBe(25);
    }
  });

  it('throws NotFoundError on 404', async () => {
    const { client } = createClient([{
      body: {
        status: 'error',
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found.',
        },
      },
      status: 404,
    }]);

    try {
      await client.verifications.get('nonexistent-id');
      expect.unreachable('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(NotFoundError);
      const err = e as NotFoundError;
      expect(err.httpStatus).toBe(404);
      expect(err.errorCode).toBe('NOT_FOUND');
    }
  });

  it('maps UNSUPPORTED_COUNTRY to ValidationError', async () => {
    const { client } = createClient([{
      body: {
        status: 'error',
        error: {
          code: 'UNSUPPORTED_COUNTRY',
          message: 'SMS is not currently supported for country: GB',
          details: { country_code: 'GB', supported_countries: ['US', 'CA'] },
        },
      },
      status: 422,
    }]);

    try {
      await client.verifications.send({ type: 'sms', destination: '+447911123456' });
      expect.unreachable('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      const err = e as ValidationError;
      expect(err.errorCode).toBe('UNSUPPORTED_COUNTRY');
      expect(err.details?.country_code).toBe('GB');
    }
  });
});
