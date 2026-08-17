import { describe, it, expect } from 'vitest';
import { loginPath, parseSignupDomain, traineeHomePath, resolvePostLoginPath } from './authRoutes';

const SAMPLE_UUID = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
const WATCH = `/fitness/watch/${SAMPLE_UUID}`;

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

  it('resolvePostLoginPath honors safe watch next for trainees', () => {
    expect(
      resolvePostLoginPath({
        signupDomain: 'fitness',
        nextParam: WATCH,
        fromLocation: null,
        isCoach: false,
      })
    ).toBe(WATCH);
  });

  it('resolvePostLoginPath honors safe watch from location state', () => {
    expect(
      resolvePostLoginPath({
        signupDomain: 'fitness',
        nextParam: null,
        fromLocation: { pathname: WATCH },
        isCoach: false,
      })
    ).toBe(WATCH);
  });

  it('resolvePostLoginPath falls back to trainee home', () => {
    expect(
      resolvePostLoginPath({
        signupDomain: 'squash',
        nextParam: '/evil',
        fromLocation: { pathname: '/dashboard' },
        isCoach: false,
      })
    ).toBe('/squash');
  });

  it('resolvePostLoginPath honors safe watch next for coaches too', () => {
    expect(
      resolvePostLoginPath({
        signupDomain: 'fitness',
        nextParam: WATCH,
        isCoach: true,
        coachDashboardPath: '/dashboard/fitness/videos',
      })
    ).toBe(WATCH);
  });

  it('resolvePostLoginPath sends coaches to dashboard without safe next', () => {
    expect(
      resolvePostLoginPath({
        signupDomain: 'fitness',
        nextParam: '/evil',
        isCoach: true,
        coachDashboardPath: '/dashboard/fitness/videos',
      })
    ).toBe('/dashboard/fitness/videos');
  });

  it('builds login paths with a safe next return', () => {
    expect(loginPath('fitness', WATCH)).toBe(`/login?domain=fitness&next=${encodeURIComponent(WATCH)}`);
  });
});
