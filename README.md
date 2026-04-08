# SimpleVerify Node.js SDK

Official Node.js/TypeScript client library for the [SimpleVerify](https://simpleverify.io) API. Send and verify SMS codes, email codes, and magic links with a few lines of code.

## Requirements

- Node.js 18+

## Installation

```bash
npm install simpleverify
```

## Quick Start

```typescript
import { SimpleVerifyClient } from 'simpleverify';

const client = new SimpleVerifyClient('vk_test_your_api_key_here');

// Send an SMS verification
const verification = await client.verifications.send({
  type: 'sms',
  destination: '+15551234567',
});

console.log(verification.verification_id); // "a1b2c3d4-..."
console.log(verification.status);           // "pending"

// Check the code the user entered
const result = await client.verifications.check(verification.verification_id, '482913');

if (result.valid) {
  console.log('Verified!');
}
```

## Usage

### Initialize the Client

```typescript
// With just an API key
const client = new SimpleVerifyClient('vk_test_...');

// With options
const client = new SimpleVerifyClient({
  apiKey: 'vk_test_...',
  baseUrl: 'https://api.simpleverify.io', // default
  timeout: 30000,                          // default, in milliseconds
});
```

### Send a Verification

```typescript
// SMS
const verification = await client.verifications.send({
  type: 'sms',
  destination: '+15551234567',
});

// Email
const verification = await client.verifications.send({
  type: 'email',
  destination: 'user@example.com',
});

// Magic link
const verification = await client.verifications.send({
  type: 'magic_link',
  destination: 'user@example.com',
  redirect_url: 'https://yourapp.com/dashboard',
  failure_redirect_url: 'https://yourapp.com/auth/magic-link-result',
});

// With metadata
const verification = await client.verifications.send({
  type: 'sms',
  destination: '+15551234567',
  metadata: { user_id: 42 },
});
```

The response is a `Verification` object:

```typescript
verification.verification_id // UUID
verification.type            // "sms", "email", or "magic_link"
verification.destination     // masked: "*******4567" or "u***@example.com"
verification.status          // "pending"
verification.expires_at      // ISO 8601 datetime
verification.environment     // "test" or "live"
```

### Test Mode

When using a `vk_test_` API key, the response includes the code or token so you can complete the flow without real SMS/email delivery:

```typescript
verification.test?.code   // "482913" (SMS/email)
verification.test?.token  // 64-char string (magic link)
```

In live mode (`vk_live_` key), `verification.test` is `undefined`.

If you set `failure_redirect_url` on a magic link, failed clicks redirect there with `status` (`invalid`, `expired`, or `already_used`) and `verification_id` query parameters.

Successful magic link clicks redirect with `status=verified`, `verification_id`, and a one-time `exchange_code`. Redeem that code from your backend:

```typescript
const exchange = await client.verifications.exchange(verificationId, exchangeCode);

exchange.destination // verified email address
exchange.metadata    // original metadata object
```

### Check a Code

```typescript
const result = await client.verifications.check(verification.verification_id, '482913');

result.valid            // true or false
result.verification_id  // UUID
result.type             // present when valid
result.destination      // present when valid (masked)
```

An invalid code returns `valid: false` (not an error). Only check the `valid` field.

### Get Verification Status

```typescript
const status = await client.verifications.get(verification.verification_id);

status.status      // "pending", "verified", or "expired"
status.created_at  // ISO 8601 datetime
```

## Error Handling

All API errors throw specific error classes extending `SimpleVerifyError`:

```typescript
import {
  SimpleVerifyError,
  AuthenticationError,
  ValidationError,
  RateLimitError,
  NotFoundError,
} from 'simpleverify';

try {
  await client.verifications.send({ type: 'sms', destination: '+15551234567' });
} catch (e) {
  if (e instanceof RateLimitError) {
    console.log(`Rate limited. Retry in ${e.retryAfterSeconds} seconds.`);
  } else if (e instanceof ValidationError) {
    console.log('Validation errors:', e.details);
  } else if (e instanceof AuthenticationError) {
    console.log('Bad API key:', e.errorCode);
  } else if (e instanceof NotFoundError) {
    console.log('Verification not found.');
  } else if (e instanceof SimpleVerifyError) {
    console.log(`Status: ${e.httpStatus}, Code: ${e.errorCode}, Message: ${e.message}`);
  }
}
```

| HTTP Status | Error Class |
|-------------|-------------|
| 401 | `AuthenticationError` |
| 404 | `NotFoundError` |
| 422 | `ValidationError` |
| 429 | `RateLimitError` |
| Other | `ApiError` |
| Network failure | `ConnectionError` |

## TypeScript

This package includes full TypeScript type definitions. All request and response types are exported:

```typescript
import type { SendVerificationRequest, Verification, VerificationCheck, TestData } from 'simpleverify';
```

## License

MIT
