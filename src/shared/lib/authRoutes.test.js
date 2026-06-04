import { describe, it, expect } from 'vitest';
import { loginPath, parseSignupDomain, traineeHomePath } from './authRoutes';

describe('authRoutes', () => {
  it('parses valid signup domains', () => {
    expect(parseSignupDomain('fitness')).toBe('fitness');
    expect(parseSignupDomain('squash')).toBe('squash');
    expect(parseSignupDomain('other')).toBeNull();
  });

  it('builds login paths with domain query', () => {
    expect(loginPath('fitness')).toBe('/login?domain=fitness');
    expect(loginPath('squash')).toBe('/login?domain=squash');
    expect(loginPath(null)).toBe('/login');
  });

  it('maps trainee home by domain', () => {
    expect(traineeHomePath('fitness')).toBe('/fitness');
    expect(traineeHomePath('squash')).toBe('/squash');
    expect(traineeHomePath(null)).toBe('/');
  });
});
