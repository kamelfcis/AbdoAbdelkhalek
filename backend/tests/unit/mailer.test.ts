import { describe, it, expect } from 'vitest';
import { isEmailConfigured } from '../../src/infrastructure/email/mailer.js';

describe('mailer', () => {
  it('isEmailConfigured returns false when no email env is set', () => {
    expect(isEmailConfigured()).toBe(false);
  });
});
