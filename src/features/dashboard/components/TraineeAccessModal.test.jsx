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
  Dialog: ({ isOpen, title, children, footer }) =>
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
    Input: ({ value, onChange, placeholder, ...props }) => (
      <input value={value} onChange={onChange} placeholder={placeholder} {...props} />
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
    ToggleGroup: ({ children, value, onValueChange, ...props }) => (
      <div data-toggle-value={value} {...props}>
        {React.Children.map(children, (child) =>
          child
            ? React.cloneElement(child, {
                onClick: () => onValueChange?.(child.props.value),
              })
            : null
        )}
      </div>
    ),
    ToggleGroupItem: ({ children, value, onClick, ...props }) => (
      <button type="button" onClick={onClick} data-value={value} {...props}>
        {children}
      </button>
    ),
    Checkbox: ({ checked, indeterminate, onCheckedChange, 'aria-label': ariaLabel, id }) => (
      <input
        type="checkbox"
        id={id}
        aria-label={ariaLabel}
        checked={Boolean(checked)}
        ref={(el) => {
          if (el) el.indeterminate = Boolean(indeterminate);
        }}
        onChange={() => onCheckedChange?.(!checked)}
      />
    ),
    Badge: ({ children, ...props }) => <span {...props}>{children}</span>,
    EmptyState: ({ title }) => <div>{title}</div>,
    Skeleton: () => <div aria-hidden="true" />,
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
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === '(min-width: 768px)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
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
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes (1 videos)' }));

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
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes (2 videos)' }));

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

  it('search filters category list', async () => {
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

    const searchInputs = screen.getAllByTestId('access-panel-search');
    fireEvent.change(searchInputs[0], { target: { value: 'Strength' } });

    await waitFor(() => {
      expect(screen.queryByLabelText('Core')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Strength')).toBeInTheDocument();
    });
  });

  it('search filters video list', async () => {
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

    const searchInputs = screen.getAllByTestId('access-panel-search');
    fireEvent.change(searchInputs[1], { target: { value: 'Plank' } });

    await waitFor(() => {
      expect(screen.queryByText('Hurdle Jump')).not.toBeInTheDocument();
      expect(screen.getByText('Plank Hold')).toBeInTheDocument();
    });
  });

  it('public/private visibility toggle narrows videos', async () => {
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

    fireEvent.click(screen.getByTestId('visibility-public'));

    await waitFor(() => {
      expect(screen.getByText('Hurdle Jump')).toBeInTheDocument();
      expect(screen.queryByText('Leg Extension')).not.toBeInTheDocument();
      expect(screen.queryByText('Plank Hold')).not.toBeInTheDocument();
    });
  });

  it('summary bar shows correct counts', async () => {
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
      expect(screen.getByTestId('access-summary-bar')).toHaveTextContent('1 categories');
      expect(screen.getByTestId('access-summary-bar')).toHaveTextContent('2 videos');
      expect(screen.getByTestId('access-unsaved-badge')).toBeInTheDocument();
    });
  });

  it('shows indeterminate category when partial videos selected', async () => {
    render(
      <TraineeAccessModal
        isOpen
        onClose={vi.fn()}
        trainee={trainee}
        currentLanguage="en"
        domain="fitness"
      />
    );

    await waitFor(() => expect(screen.getByLabelText('Hurdle Jump')).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText('Hurdle Jump'));

    await waitFor(() => {
      const coreCheckbox = screen.getByLabelText('Core');
      expect(coreCheckbox).not.toBeChecked();
      expect(coreCheckbox).toHaveProperty('indeterminate', true);
    });
  });

  it('mobile tab switching shows videos panel', async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
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

    await waitFor(() => expect(screen.getByTestId('access-tab-layout')).toBeInTheDocument());

    expect(screen.getByLabelText('Core')).toBeInTheDocument();
    expect(screen.queryByText('Hurdle Jump')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('access-tab-videos'));

    await waitFor(() => {
      expect(screen.getByText('Hurdle Jump')).toBeInTheDocument();
      expect(screen.queryByLabelText('Core')).not.toBeInTheDocument();
    });
  });
});
