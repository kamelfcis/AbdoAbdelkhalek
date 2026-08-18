import { describe, it, expect } from 'vitest';
import {
  adminResetTraineePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from '../../src/common/validation/auth-schemas.js';

describe('signupSchema registeredFrom', () => {
  it('accepts fitness, online_football, and squash', () => {
    expect(
      signupSchema.parse({
        email: 'a@b.com',
        password: 'secret1',
        fullName: 'Test',
        registeredFrom: 'fitness',
      }).registeredFrom
    ).toBe('online_football');
    expect(
      signupSchema.parse({
        email: 'a@b.com',
        password: 'secret1',
        fullName: 'Test',
        registeredFrom: 'online_football',
      }).registeredFrom
    ).toBe('online_football');
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

describe('loginSchema rememberMe', () => {
  it('accepts optional rememberMe boolean', () => {
    expect(
      loginSchema.parse({ email: 'a@b.com', password: 'secret1', rememberMe: true }).rememberMe
    ).toBe(true);
    expect(
      loginSchema.parse({ email: 'a@b.com', password: 'secret1' }).rememberMe
    ).toBeUndefined();
  });
});

describe('forgotPasswordSchema', () => {
  it('accepts valid email', () => {
    expect(forgotPasswordSchema.parse({ email: 'user@example.com' }).email).toBe('user@example.com');
  });

  it('rejects invalid email', () => {
    expect(() => forgotPasswordSchema.parse({ email: 'bad' })).toThrow();
  });
});

describe('resetPasswordSchema', () => {
  it('accepts token and password', () => {
    const parsed = resetPasswordSchema.parse({
      token: 'a'.repeat(64),
      password: 'newpass1',
    });
    expect(parsed.token).toHaveLength(64);
    expect(parsed.password).toBe('newpass1');
  });

  it('rejects empty token', () => {
    expect(() =>
      resetPasswordSchema.parse({ token: '', password: 'newpass1' })
    ).toThrow();
  });

  it('rejects short password', () => {
    expect(() =>
      resetPasswordSchema.parse({ token: 'a'.repeat(64), password: '123' })
    ).toThrow();
  });
});

describe('adminResetTraineePasswordSchema', () => {
  it('accepts a password between 6 and 128 characters', () => {
    expect(adminResetTraineePasswordSchema.parse({ password: 'secret1' }).password).toBe(
      'secret1'
    );
  });

  it('rejects a short password', () => {
    expect(() => adminResetTraineePasswordSchema.parse({ password: '12345' })).toThrow();
  });

  it('rejects a password longer than 128 characters', () => {
    expect(() =>
      adminResetTraineePasswordSchema.parse({ password: 'a'.repeat(129) })
    ).toThrow();
  });
});

