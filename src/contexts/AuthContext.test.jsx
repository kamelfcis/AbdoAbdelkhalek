import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

vi.mock('../services/authService', () => ({
  authService: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
  },
}));

vi.mock('../services/contentService', () => ({
  contentService: {
    getUserProfile: vi.fn(),
  },
}));

vi.mock('../services/apiClient', () => ({
  setAuthTokenChangeHandler: vi.fn(),
}));

import { authService } from '../services/authService';
import { contentService } from '../services/contentService';

function Probe() {
  const { isAuthenticated, isCoach, isLoading, user } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="auth">{String(isAuthenticated)}</span>
      <span data-testid="coach">{String(isCoach)}</span>
      <span data-testid="user">{user?.email ?? 'none'}</span>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authService.getSession.mockResolvedValue({ data: { session: null } });
    contentService.getUserProfile.mockResolvedValue({ data: null });
  });

  it('exposes unauthenticated state after bootstrap', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('auth')).toHaveTextContent('false');
    expect(screen.getByTestId('coach')).toHaveTextContent('false');
  });

  it('exposes coach when session and profile load', async () => {
    authService.getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'u1', email: 'admin@gmail.com', user_metadata: { is_coach: true } },
        },
      },
    });
    contentService.getUserProfile.mockResolvedValue({
      data: { id: 'u1', email: 'admin@gmail.com', is_coach: true },
    });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('true'));
    expect(screen.getByTestId('coach')).toHaveTextContent('true');
    expect(screen.getByTestId('user')).toHaveTextContent('admin@gmail.com');
  });

  it('throws when useAuth is used outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/AuthProvider/);
    spy.mockRestore();
  });
});
