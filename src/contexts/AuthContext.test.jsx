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

vi.mock('../services/apiClient', () => ({
  setAuthTokenChangeHandler: vi.fn(),
}));

import { authService } from '../services/authService';

function Probe() {
  const { isAuthenticated, isCoach, isLoading, user } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="auth">{String(isAuthenticated)}</span>
      <span data-testid="coach">{String(isCoach)}</span>
      <span data-testid="user">{user?.email ?? 'none'}</span>
      <span data-testid="name">{user?.full_name ?? 'none'}</span>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authService.getSession.mockResolvedValue({ data: { session: null } });
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
    expect(authService.getSession).toHaveBeenCalledTimes(1);
  });

  it('derives coach user from session metadata with a single getSession call', async () => {
    authService.getSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'u1',
            email: 'admin@gmail.com',
            user_metadata: { is_coach: true, full_name: 'Coach Admin' },
          },
        },
      },
    });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('true'));
    expect(screen.getByTestId('coach')).toHaveTextContent('true');
    expect(screen.getByTestId('user')).toHaveTextContent('admin@gmail.com');
    expect(screen.getByTestId('name')).toHaveTextContent('Coach Admin');
    expect(authService.getSession).toHaveBeenCalledTimes(1);
  });

  it('throws when useAuth is used outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/AuthProvider/);
    spy.mockRestore();
  });
});
