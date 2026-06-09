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
  Select: ({ label, value, onChange, options, ...props }) => (
    <label>
      {label}
      <select
        value={value}
        onChange={onChange}
        aria-label={typeof label === 'string' ? label : undefined}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
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
  { id: 'vid-1', category_id: 'cat-1', title_en: 'Hurdle Jump', title_ar: 'Hurdle Jump', is_public: true },
  { id: 'vid-2', category_id: 'cat-2', title_en: 'Leg Extension', title_ar: 'Leg Extension', is_public: false },
  { id: 'vid-3', category_id: 'cat-1', title_en: 'Plank Hold', title_ar: 'Plank Hold', is_public: false },
];

describe('TraineeAccessModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCategories.mockResolvedValue({ items: categories, total: 2 });
    mockGetVideos.mockResolvedValue({ items: videos, total: 3 });
    mockGetTraineeAccess.mockResolvedValue({
      categories: [],
      videos: [],
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

    expect(screen.getByLabelText('Core')).toBeInTheDocument();
    expect(screen.getByLabelText('Strength')).toBeInTheDocument();
    expect(screen.getByText('Hurdle Jump')).toBeInTheDocument();
    expect(screen.getByText('Leg Extension')).toBeInTheDocument();
    expect(screen.getByText(/Manage permissions for trainee: Mohamed Kamel/i)).toBeInTheDocument();
  });

  it('shows all videos when filter is All categories', async () => {
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
      expect(screen.getByText('Hurdle Jump')).toBeInTheDocument();
      expect(screen.getByText('Leg Extension')).toBeInTheDocument();
      expect(screen.getByText('Plank Hold')).toBeInTheDocument();
    });
  });

  it('legacy load: category-only access hydrates all category videos as checked', async () => {
    mockGetTraineeAccess.mockResolvedValue({
      categories: [{ category_id: 'cat-1' }],
      videos: [],
    });

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
      expect(screen.getByLabelText('Hurdle Jump')).toBeChecked();
      expect(screen.getByLabelText('Plank Hold')).toBeChecked();
      expect(screen.getByLabelText('Leg Extension')).not.toBeChecked();
    });
  });

  it('filters videos via category dropdown, not category access checkboxes', async () => {
    render(
      <TraineeAccessModal
        isOpen
        onClose={vi.fn()}
        trainee={trainee}
        currentLanguage="en"
        domain="fitness"
      />
    );

    await waitFor(() => expect(screen.getByLabelText('Core')).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText('Core'));

    await waitFor(() => {
      expect(screen.getByText('Hurdle Jump')).toBeInTheDocument();
      expect(screen.getByText('Leg Extension')).toBeInTheDocument();
      expect(screen.getByText('Plank Hold')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('video-category-filter'), { target: { value: 'cat-1' } });

    await waitFor(() => {
      expect(screen.getByText('Hurdle Jump')).toBeInTheDocument();
      expect(screen.getByText('Plank Hold')).toBeInTheDocument();
      expect(screen.queryByText('Leg Extension')).not.toBeInTheDocument();
    });
  });

  it('Grant All videos selects only visible filtered videos', async () => {
    render(
      <TraineeAccessModal
        isOpen
        onClose={vi.fn()}
        trainee={trainee}
        currentLanguage="en"
        domain="fitness"
      />
    );

    await waitFor(() => expect(screen.getByLabelText('Core')).toBeInTheDocument());

    fireEvent.change(screen.getByTestId('video-category-filter'), { target: { value: 'cat-1' } });

    const grantButtons = screen.getAllByRole('button', { name: 'Grant All' });
    fireEvent.click(grantButtons[1]);

    await waitFor(() => {
      expect(screen.getByLabelText('Hurdle Jump')).toBeChecked();
      expect(screen.getByLabelText('Plank Hold')).toBeChecked();
      expect(screen.queryByLabelText('Leg Extension')).not.toBeInTheDocument();
    });
  });

  it('save sends explicit videoIds only for checked videos', async () => {
    const onClose = vi.fn();
    render(
      <TraineeAccessModal
        isOpen
        onClose={onClose}
        trainee={trainee}
        currentLanguage="en"
        domain="fitness"
      />
    );

    await waitFor(() => expect(screen.getByText('Hurdle Jump')).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText('Hurdle Jump'));
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      expect(mockSetTraineeAccess).toHaveBeenCalledWith('user-1', {
        categoryIds: [],
        videoIds: ['vid-1'],
      });
    });
  });

  it('checking a category selects all videos in that category for save', async () => {
    const onClose = vi.fn();
    render(
      <TraineeAccessModal
        isOpen
        onClose={onClose}
        trainee={trainee}
        currentLanguage="en"
        domain="fitness"
      />
    );

    await waitFor(() => expect(screen.getByLabelText('Core')).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText('Core'));
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      expect(mockSetTraineeAccess).toHaveBeenCalledWith('user-1', {
        categoryIds: ['cat-1'],
        videoIds: ['vid-1', 'vid-3'],
      });
    });
  });

  it('public videos render green indicator', async () => {
    render(
      <TraineeAccessModal
        isOpen
        onClose={vi.fn()}
        trainee={trainee}
        currentLanguage="en"
        domain="fitness"
      />
    );

    await waitFor(() => expect(screen.getByText('Hurdle Jump')).toBeInTheDocument());

    const publicIndicator = screen.getByTestId('video-public-indicator-vid-1');
    const privateIndicator = screen.getByTestId('video-public-indicator-vid-2');

    expect(publicIndicator).toHaveAttribute('data-public', 'true');
    expect(publicIndicator.className).toContain('bg-green-500');
    expect(privateIndicator).toHaveAttribute('data-public', 'false');
    expect(privateIndicator.className).toContain('bg-red-400');
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

    await waitFor(() => expect(screen.getByLabelText('Core')).toBeInTheDocument());

    const grantButtons = screen.getAllByRole('button', { name: 'Grant All' });
    fireEvent.click(grantButtons[0]);
    fireEvent.click(grantButtons[1]);

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach((box) => expect(box).toBeChecked());
    });
  });

  it('clears all selections via Revoke All', async () => {
    mockGetTraineeAccess.mockResolvedValue({
      categories: [{ category_id: 'cat-1' }],
      videos: [{ video_id: 'vid-1' }],
    });

    render(
      <TraineeAccessModal
        isOpen
        onClose={vi.fn()}
        trainee={trainee}
        currentLanguage="en"
        domain="fitness"
      />
    );

    await waitFor(() => expect(screen.getByLabelText('Core')).toBeInTheDocument());

    const revokeButtons = screen.getAllByRole('button', { name: 'Revoke All' });
    fireEvent.click(revokeButtons[0]);
    fireEvent.click(revokeButtons[1]);

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach((box) => expect(box).not.toBeChecked());
    });
  });
});
