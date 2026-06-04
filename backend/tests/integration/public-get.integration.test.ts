import { describe, it, expect } from 'vitest';
import { createTestAgent, shouldRunIntegration } from '../helpers/integration.js';

const run = shouldRunIntegration();
const describeIntegration = run ? describe : describe.skip;

const fitnessPublic = [
  '/api/categories',
  '/api/videos',
  '/api/packages',
  '/api/reviews',
  '/api/success-stories',
  '/api/faqs',
];

const squashPublic = [
  '/api/squash/categories',
  '/api/squash/videos',
  '/api/squash/packages',
  '/api/squash/reviews',
  '/api/squash/success-stories',
  '/api/squash/faqs',
  '/api/squash/coaches',
  '/api/squash/programs',
];

describeIntegration('Public GET endpoints', () => {
  if (!run) {
    it.skip('skipped — set RUN_INTEGRATION_TESTS=true and DB credentials', () => {});
    return;
  }

  const agent = createTestAgent();

  describe.each(fitnessPublic)('Fitness %s', (path) => {
    it('returns 200 with array body', async () => {
      const res = await agent.get(path);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe.each(squashPublic)('Squash %s', (path) => {
    it('returns 200 with array body', async () => {
      const res = await agent.get(path);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
