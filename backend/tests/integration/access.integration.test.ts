import { describe, it, expect, beforeAll } from 'vitest';
import {
  createTestAgent,
  loginCoach,
  shouldRunIntegration,
  authHeader,
  firstId,
} from '../helpers/integration.js';

const run = shouldRunIntegration();
const describeIntegration = run ? describe : describe.skip;

describeIntegration('Access grant/revoke (PUT)', () => {
  if (!run) {
    it.skip('skipped — set RUN_INTEGRATION_TESTS=true and DB credentials', () => {});
    return;
  }

  const agent = createTestAgent();
  let token = '';
  let coachId = '';

  beforeAll(async () => {
    const login = await loginCoach(agent);
    token = login.accessToken;
    coachId = login.userId;
  });

  async function testDomainAccess(prefix: '/api' | '/api/squash') {
    const videosRes = await agent.get(`${prefix}/videos`).set(authHeader(token));
    expect(videosRes.status).toBe(200);
    const videoId = firstId(videosRes.body);
    expect(videoId).toBeTruthy();

    const grant = await agent
      .put(`${prefix}/videos/${videoId}/access`)
      .set(authHeader(token))
      .send({ userIds: [coachId] });
    expect(grant.status).toBe(200);

    const verify = await agent
      .get(`${prefix}/videos/${videoId}/access`)
      .set(authHeader(token));
    expect(verify.status).toBe(200);
    const ids = Array.isArray(verify.body) ? verify.body : verify.body?.userIds;
    expect(ids).toContain(coachId);

    const revoke = await agent
      .put(`${prefix}/videos/${videoId}/access`)
      .set(authHeader(token))
      .send({ userIds: [] });
    expect(revoke.status).toBe(200);

    const traineePut = await agent
      .put(`${prefix}/access/trainee/${coachId}`)
      .set(authHeader(token))
      .send({ categoryIds: [], videoIds: [videoId] });
    expect(traineePut.status).toBe(200);

    const traineeGet = await agent
      .get(`${prefix}/access/trainee/${coachId}`)
      .set(authHeader(token));
    expect(traineeGet.status).toBe(200);

    const clearTrainee = await agent
      .put(`${prefix}/access/trainee/${coachId}`)
      .set(authHeader(token))
      .send({ categoryIds: [], videoIds: [] });
    expect(clearTrainee.status).toBe(200);
  }

  it('Fitness video + trainee access', async () => {
    await testDomainAccess('/api');
  });

  it('Squash video + trainee access', async () => {
    await testDomainAccess('/api/squash');
  });
});
