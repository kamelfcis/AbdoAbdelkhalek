import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../contexts/AuthContext';

function renderRoute(authState) {
  useAuth.mockReturnValue(authState);
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div>Dashboard content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows loader while auth is loading', () => {
    renderRoute({ isAuthenticated: false, isLoading: true });
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('redirects unauthenticated users to login', () => {
    renderRoute({ isAuthenticated: false, isLoading: false });
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    renderRoute({ isAuthenticated: true, isLoading: false });
    expect(screen.getByText('Dashboard content')).toBeInTheDocument();
  });
});
