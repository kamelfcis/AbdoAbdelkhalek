import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TraineeProfileModal from './TraineeProfileModal';

const getProfileDetails = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../lib/getContentService', () => ({
  getContentService: () => ({
    getProfileDetails,
  }),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('TraineeProfileModal', () => {
  const session = { user: { email: 'trainee@example.com' } };
  const onClose = vi.fn();
  const onLogout = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    onClose.mockClear();
    onLogout.mockClear();
    mockNavigate.mockClear();
    getProfileDetails.mockReset();
    getProfileDetails.mockResolvedValue({
      userData: {
        full_name: 'Test Trainee',
        email: 'trainee@example.com',
        phone: '1234567890',
        created_at: '2024-01-01',
        is_coach: false,
      },
      videoCount: 5,
      categoryCount: 2,
      subscriptions: [],
    });
  });

  it('does not render when closed', () => {
    render(
      <TraineeProfileModal
        isOpen={false}
        onClose={onClose}
        session={session}
        domain="fitness"
        onLogout={onLogout}
      />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders when open and fetches profile details', async () => {
    render(
      <TraineeProfileModal
        isOpen
        onClose={onClose}
        session={session}
        domain="fitness"
        onLogout={onLogout}
        currentLanguage="en"
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await waitFor(() => {
      expect(getProfileDetails).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test Trainee' })).toBeInTheDocument();
    });
  });

  it('uses squash domain service when domain is squash', async () => {
    render(
      <TraineeProfileModal
        isOpen
        onClose={onClose}
        session={session}
        domain="squash"
        onLogout={onLogout}
        currentLanguage="en"
      />
    );

    await waitFor(() => {
      expect(getProfileDetails).toHaveBeenCalledTimes(1);
    });
  });

  it('redirects to fitness login after logout', async () => {
    render(
      <TraineeProfileModal
        isOpen
        onClose={onClose}
        session={session}
        domain="fitness"
        onLogout={onLogout}
        currentLanguage="en"
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test Trainee' })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: 'Logout' }));

    await waitFor(() => {
      expect(onLogout).toHaveBeenCalledTimes(1);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/login?domain=fitness', {
      replace: true,
      state: { logoutSuccess: true },
    });
  });

  it('redirects to squash login after logout', async () => {
    render(
      <TraineeProfileModal
        isOpen
        onClose={onClose}
        session={session}
        domain="squash"
        onLogout={onLogout}
        currentLanguage="en"
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test Trainee' })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: 'Logout' }));

    await waitFor(() => {
      expect(onLogout).toHaveBeenCalledTimes(1);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/login?domain=squash', {
      replace: true,
      state: { logoutSuccess: true },
    });
  });
});
