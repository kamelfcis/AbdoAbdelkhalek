import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { resolveDomain, resolveDomainFromPath, useDomain } from './useDomain';
import { themeIds } from '../../design-system/themes';

describe('resolveDomain', () => {
  const originalEnv = process.env.REACT_APP_DOMAIN;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.REACT_APP_DOMAIN;
    } else {
      process.env.REACT_APP_DOMAIN = originalEnv;
    }
  });

  it('uses REACT_APP_DOMAIN override', () => {
    process.env.REACT_APP_DOMAIN = 'squash';
    expect(resolveDomain('localhost')).toBe(themeIds.SQUASH);
    process.env.REACT_APP_DOMAIN = 'fitness';
    expect(resolveDomain('localhost')).toBe(themeIds.FITNESS);
  });

  it('detects squash from hostname', () => {
    delete process.env.REACT_APP_DOMAIN;
    expect(resolveDomain('squash.abdelrhmanabdelkhalek.com')).toBe(themeIds.SQUASH);
    expect(resolveDomain('squash.example.com')).toBe(themeIds.SQUASH);
  });

  it('defaults to fitness', () => {
    delete process.env.REACT_APP_DOMAIN;
    expect(resolveDomain('abdelrhmanabdelkhalek.com')).toBe(themeIds.FITNESS);
    expect(resolveDomain('localhost')).toBe(themeIds.FITNESS);
  });

  it('prefers pathname over env', () => {
    process.env.REACT_APP_DOMAIN = 'fitness';
    expect(resolveDomain('localhost', '/squash')).toBe(themeIds.SQUASH);
    expect(resolveDomain('localhost', '/fitness')).toBe(themeIds.FITNESS);
  });
});

describe('resolveDomainFromPath', () => {
  it('maps landing routes', () => {
    expect(resolveDomainFromPath('/squash')).toBe(themeIds.SQUASH);
    expect(resolveDomainFromPath('/fitness')).toBe(themeIds.FITNESS);
    expect(resolveDomainFromPath('/')).toBe(null);
    expect(resolveDomainFromPath('/dashboard/squash/overview')).toBe(themeIds.SQUASH);
  });
});

describe('useDomain', () => {
  beforeEach(() => {
    vi.stubEnv('REACT_APP_DOMAIN', 'fitness');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns fitness flags for dashboard/public context', () => {
    const { result } = renderHook(() => useDomain());
    expect(result.current.domain).toBe(themeIds.FITNESS);
    expect(result.current.isFitness).toBe(true);
    expect(result.current.isSquash).toBe(false);
    expect(result.current.themeId).toBe(themeIds.FITNESS);
  });
});
