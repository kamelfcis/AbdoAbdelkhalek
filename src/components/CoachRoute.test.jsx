import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CoachRoute from './CoachRoute';

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
            <CoachRoute>
              <div>Coach dashboard</div>
            </CoachRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('CoachRoute', () => {
  beforeEach(() => vi.clearAllMocks());

  it('redirects trainees to home', () => {
    renderRoute({ isAuthenticated: true, isCoach: false, isLoading: false });
    expect(screen.getByText('Home page')).toBeInTheDocument();
  });

  it('redirects unauthenticated users to login', () => {
    renderRoute({ isAuthenticated: false, isCoach: false, isLoading: false });
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('renders dashboard for coaches', () => {
    renderRoute({ isAuthenticated: true, isCoach: true, isLoading: false });
    expect(screen.getByText('Coach dashboard')).toBeInTheDocument();
  });
});
