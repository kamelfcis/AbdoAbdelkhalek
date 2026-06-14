import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import DashboardRoute from './CoachRoute';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../contexts/AuthContext';

function renderRoute(authState) {
  useAuth.mockReturnValue(authState);
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/" element={<div>Home page</div>} />
        <Route path="/login" element={<div>Login page</div>} />
        <Route
          path="/dashboard"
          element={
            <DashboardRoute>
              <div>Dashboard content</div>
            </DashboardRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('DashboardRoute', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders dashboard for authenticated trainees', () => {
    renderRoute({ isAuthenticated: true, isCoach: false, isLoading: false });
    expect(screen.getByText('Dashboard content')).toBeInTheDocument();
  });

  it('redirects unauthenticated users to login', () => {
    renderRoute({ isAuthenticated: false, isCoach: false, isLoading: false });
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('renders dashboard for coaches', () => {
    renderRoute({ isAuthenticated: true, isCoach: true, isLoading: false });
    expect(screen.getByText('Dashboard content')).toBeInTheDocument();
  });
});
