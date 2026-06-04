import { describe, it, expect } from 'vitest';
import { signupSchema } from '../../src/common/validation/auth-schemas.js';

describe('signupSchema registeredFrom', () => {
  it('accepts fitness and squash', () => {
    expect(
      signupSchema.parse({
        email: 'a@b.com',
        password: 'secret1',
        fullName: 'Test',
        registeredFrom: 'fitness',
      }).registeredFrom
    ).toBe('fitness');
    expect(
      signupSchema.parse({
        email: 'a@b.com',
        password: 'secret1',
        fullName: 'Test',
        registeredFrom: 'squash',
      }).registeredFrom
    ).toBe('squash');
  });

  it('omits registeredFrom when not provided', () => {
    const parsed = signupSchema.parse({
      email: 'a@b.com',
      password: 'secret1',
      fullName: 'Test',
    });
    expect(parsed.registeredFrom).toBeUndefined();
  });

  it('rejects invalid domain', () => {
    expect(() =>
      signupSchema.parse({
        email: 'a@b.com',
        password: 'secret1',
        fullName: 'Test',
        registeredFrom: 'tennis',
      })
    ).toThrow();
  });
});
