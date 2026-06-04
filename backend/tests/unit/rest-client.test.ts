import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('restList pagination', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('uses a single REST request when query already includes limit/offset', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: 'page-2' }],
    });
    global.fetch = fetchMock as typeof fetch;

    vi.doMock('../../src/config/env.js', () => ({
      env: {
        supabaseUrl: () => 'https://example.supabase.co',
        supabaseServiceKey: () => 'test-key',
      },
    }));

    const { restList } = await import('../../src/infrastructure/supabase-rest/client.js');
    const rows = await restList('videos', '?select=id&order=created_at.desc&limit=8&offset=8');

    expect(rows).toEqual([{ id: 'page-2' }]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toContain('limit=8&offset=8');
  });
});
