import { describe, it, expect } from 'vitest';
import { createTestAgent } from '../helpers/integration.js';

describe('Validation', () => {
  const agent = createTestAgent();

  it('POST /api/auth/login with empty body returns 400', async () => {
    const res = await agent.post('/api/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/validation/i);
  });

  it('POST /api/categories with empty body returns 401 without auth', async () => {
    const res = await agent.post('/api/categories').send({});
    expect(res.status).toBe(401);
  });

  it('POST /api/uploads/presign requires authentication', async () => {
    const res = await agent.post('/api/uploads/presign').send({
      bucket: 'categories',
      path: 'categories/test.jpg',
      contentType: 'image/jpeg',
    });
    expect(res.status).toBe(401);
  });
});
