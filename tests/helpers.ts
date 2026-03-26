import { SimpleVerifyClient } from '../src';

export const VALID_KEY = 'vk_test_a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2';

interface MockResponse {
  body: unknown;
  status: number;
}

export function createMockFetch(responses: MockResponse[]) {
  const requests: { url: string; init: RequestInit }[] = [];
  let index = 0;

  const mockFetch = async (url: string | URL | Request, init?: RequestInit): Promise<Response> => {
    requests.push({ url: url.toString(), init: init ?? {} });
    const resp = responses[index++] ?? { body: {}, status: 200 };
    return {
      status: resp.status,
      json: async () => resp.body,
    } as Response;
  };

  return { fetch: mockFetch as typeof globalThis.fetch, requests };
}

export function createClient(responses: MockResponse[]) {
  const mock = createMockFetch(responses);
  const client = new SimpleVerifyClient({
    apiKey: VALID_KEY,
    fetch: mock.fetch,
  });
  return { client, requests: mock.requests };
}
