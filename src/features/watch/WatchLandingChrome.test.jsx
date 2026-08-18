import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WatchLandingChrome } from './WatchLandingChrome';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: vi.fn(() => ({ currentLanguage: 'en' })),
}));

vi.mock('../../shared/contexts/LandingSectionsContext', () => ({
  LandingSectionsProvider: ({ children }) => children,
}));

vi.mock('../../shared/layout/MediaPreconnect', () => ({
  default: () => null,
}));

vi.mock('../../shared/components/TraineeProfileModal', () => ({
  default: () => null,
}));

vi.mock('../fitness/sections/Navbar', () => ({
  default: () => <nav data-testid="watch-nav">nav</nav>,
}));
vi.mock('../fitness/sections/Sidebar', () => ({ default: () => null }));
vi.mock('../fitness/sections/Footer', () => ({ default: () => null }));
vi.mock('../fitness/sections/ScrollToTop', () => ({ default: () => null }));
vi.mock('../fitness/sections/FloatingInstagramButton', () => ({ default: () => null }));
vi.mock('../squash/sections/SquashNavbar', () => ({ default: () => null }));
vi.mock('../squash/sections/SquashSidebar', () => ({ default: () => null }));
vi.mock('../squash/sections/SquashFooter', () => ({ default: () => null }));
vi.mock('../squash/sections/SquashScrollToTop', () => ({ default: () => null }));

import { useAuth } from '../../contexts/AuthContext';

describe('WatchLandingChrome', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows chrome and children while auth is still loading', () => {
    useAuth.mockReturnValue({
      isLoading: true,
      user: null,
      session: null,
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <WatchLandingChrome domain="fitness">
          <div data-testid="player-slot">player</div>
        </WatchLandingChrome>
      </MemoryRouter>
    );

    expect(screen.getByTestId('player-slot')).toBeInTheDocument();
    expect(screen.getByTestId('watch-nav')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
});
