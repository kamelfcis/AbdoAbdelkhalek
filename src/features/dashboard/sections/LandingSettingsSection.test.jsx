import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LandingSettingsSection } from './LandingSettingsSection';

vi.mock('../context/DashboardCoachContext', () => ({
  useDashboardCoach: vi.fn(),
}));

vi.mock('../../../shared/hooks/useLandingSections', () => ({
  useLandingSections: vi.fn(),
}));

vi.mock('../../../shared/lib/fontAwesomeLoader', () => ({
  loadFontAwesome: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../../shared/ui', () => ({
  Card: ({ children }) => <div data-testid="card">{children}</div>,
  ToggleSwitch: ({ checked, onChange, disabled }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
    />
  ),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  SkeletonGroup: () => <div>loading</div>,
}));

import { useDashboardCoach } from '../context/DashboardCoachContext';
import { useLandingSections } from '../../../shared/hooks/useLandingSections';

const t = (key) => key;

function renderSection() {
  return render(
    <MemoryRouter>
      <LandingSettingsSection />
    </MemoryRouter>
  );
}

describe('LandingSettingsSection', () => {
  const toggleSectionAsync = vi.fn().mockResolvedValue({});

  beforeEach(() => {
    vi.clearAllMocks();
    useDashboardCoach.mockReturnValue({
      adminDomain: 'fitness',
      t,
      isRTL: false,
    });
    useLandingSections.mockReturnValue({
      sections: {
        'success-stories': true,
        reviews: true,
        categories: true,
        videos: true,
        packages: true,
        faq: true,
      },
      isLoading: false,
      isError: false,
      toggleSectionAsync,
      isToggling: false,
      togglingKey: null,
    });
  });

  it('renders section toggle cards for fitness domain', () => {
    renderSection();
    expect(screen.getByText('landing-section-success-stories')).toBeInTheDocument();
    expect(screen.getByText('landing-section-faq')).toBeInTheDocument();
    expect(screen.getAllByRole('switch')).toHaveLength(6);
  });

  it('calls API when toggle is clicked', async () => {
    renderSection();
    const switches = screen.getAllByRole('switch');
    fireEvent.click(switches[1]);
    await waitFor(() => {
      expect(toggleSectionAsync).toHaveBeenCalledWith({ key: 'reviews', visible: false });
    });
  });
});
