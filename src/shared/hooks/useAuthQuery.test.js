import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuthQueryOptions } from './useAuthQuery';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../../contexts/AuthContext';

describe('useAuthQueryOptions', () => {
  it('disables queries while loading', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, isLoading: true });
    const { result } = renderHook(() => useAuthQueryOptions(true));
    expect(result.current.enabled).toBe(false);
  });

  it('enables when authenticated and not loading', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    const { result } = renderHook(() => useAuthQueryOptions(true));
    expect(result.current.enabled).toBe(true);
  });

  it('respects explicit enabled=false', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    const { result } = renderHook(() => useAuthQueryOptions(false));
    expect(result.current.enabled).toBe(false);
  });
});
