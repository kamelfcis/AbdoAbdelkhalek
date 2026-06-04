import { describe, it, expect } from 'vitest';
import { createTestAgent } from './helpers/integration.js';

describe('API health', () => {
  it('GET /api/health returns ok', async () => {
    const res = await createTestAgent().get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, service: 'abdelrhmanabdelkhalek-api' });
  });

  it('GET /api/squash/health returns squash domain', async () => {
    const res = await createTestAgent().get('/api/squash/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, domain: 'squash' });
  });
});
