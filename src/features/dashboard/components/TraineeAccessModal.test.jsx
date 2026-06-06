import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import TraineeAccessModal from './TraineeAccessModal';

const {
  mockGetCategories,
  mockGetVideos,
  mockGetTraineeAccess,
  mockSetTraineeAccess,
} = vi.hoisted(() => ({
  mockGetCategories: vi.fn(),
  mockGetVideos: vi.fn(),
  mockGetTraineeAccess: vi.fn(),
  mockSetTraineeAccess: vi.fn(),
}));

vi.mock('../../../shared/lib/getContentService', () => ({
  getContentService: () => ({
    getCategories: mockGetCategories,
    getVideos: mockGetVideos,
    getTraineeAccess: mockGetTraineeAccess,
    setTraineeAccess: mockSetTraineeAccess,
  }),
}));

vi.mock('../../../shared/ui/Toast', () => ({
  default: () => null,
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('../../../shared/ui', () => ({
  Modal: ({ isOpen, title, children, footer }) =>
    isOpen ? (
      <div role="dialog">
        <div>{title}</div>
        <div>{children}</div>
        <div>{footer}</div>
      </div>
    ) : null,
  Spinner: () => <div aria-label="loading">Loading</div>,
  Button: ({ children, onClick, type = 'button', ...props }) => (
    <button type={type} onClick={onClick} {...props}>
      {children}
    </button>
  ),
  EmptyState: ({ title }) => <div>{title}</div>,
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

const trainee = {
  id: 'user-1',
  full_name: 'Mohamed Kamel',
  email: 'kamelfcis@gmail.com',
};

const categories = [
  { id: 'cat-1', name_en: 'Core', name_ar: 'Core' },
  { id: 'cat-2', name_en: 'Strength', name_ar: 'Strength' },
];

const videos = [
  { id: 'vid-1', title_en: 'Hurdle Jump', title_ar: 'Hurdle Jump' },
  { id: 'vid-2', title_en: 'Leg Extension', title_ar: 'Leg Extension' },
];

describe('TraineeAccessModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCategories.mockResolvedValue({ items: categories, total: 2 });
    mockGetVideos.mockResolvedValue({ items: videos, total: 2 });
    mockGetTraineeAccess.mockResolvedValue({
      categories: [{ category_id: 'cat-1' }],
      videos: [{ video_id: 'vid-1' }],
    });
    mockSetTraineeAccess.mockResolvedValue({});
  });

  it('loads catalog and renders checkboxes when opened', async () => {
    render(
      <TraineeAccessModal
        isOpen
        onClose={vi.fn()}
        trainee={trainee}
        currentLanguage="en"
        domain="fitness"
      />
    );

    await waitFor(() => {
      expect(mockGetCategories).toHaveBeenCalledWith({ limit: 500, offset: 0 });
      expect(mockGetVideos).toHaveBeenCalledWith({ limit: 500, offset: 0 });
      expect(mockGetTraineeAccess).toHaveBeenCalledWith('user-1');
    });

    expect(screen.getByText('Core')).toBeInTheDocument();
    expect(screen.getByText('Strength')).toBeInTheDocument();
    expect(screen.getByText('Hurdle Jump')).toBeInTheDocument();
    expect(screen.getByText('Leg Extension')).toBeInTheDocument();
    expect(screen.getByText(/Manage permissions for trainee: Mohamed Kamel/i)).toBeInTheDocument();
  });

  it('selects all categories and videos via Grant All', async () => {
    render(
      <TraineeAccessModal
        isOpen
        onClose={vi.fn()}
        trainee={trainee}
        currentLanguage="en"
        domain="fitness"
      />
    );

    await waitFor(() => expect(screen.getByText('Core')).toBeInTheDocument());

    const grantButtons = screen.getAllByRole('button', { name: 'Grant All' });
    fireEvent.click(grantButtons[0]);
    fireEvent.click(grantButtons[1]);

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach((box) => expect(box).toBeChecked());
    });
  });

  it('clears all selections via Revoke All', async () => {
    render(
      <TraineeAccessModal
        isOpen
        onClose={vi.fn()}
        trainee={trainee}
        currentLanguage="en"
        domain="fitness"
      />
    );

    await waitFor(() => expect(screen.getByText('Core')).toBeInTheDocument());

    const revokeButtons = screen.getAllByRole('button', { name: 'Revoke All' });
    fireEvent.click(revokeButtons[0]);
    fireEvent.click(revokeButtons[1]);

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach((box) => expect(box).not.toBeChecked());
    });
  });
});
