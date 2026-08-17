import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import WatchVideoPage from './WatchVideoPage';

const UUID = '550e8400-e29b-41d4-a716-446655440000';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({ isAuthenticated: true })),
}));

vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: vi.fn(() => ({ currentLanguage: 'en' })),
}));

vi.mock('../../shared/hooks/useVideo', () => ({
  useVideo: vi.fn(),
}));

vi.mock('../../shared/hooks/useVideos', () => ({
  useVideos: vi.fn(() => ({ data: [] })),
}));

vi.mock('../../shared/hooks/useVideoFavorites', () => ({
  useVideoFavorites: vi.fn(() => ({
    toggleFavorite: vi.fn(),
    isFavorite: vi.fn(() => false),
  })),
}));

vi.mock('../../shared/lib/resolveVideoPlayUrl', () => ({
  resolveVideoPlayUrl: vi.fn((video) => video?.video_url || ''),
}));

vi.mock('../../shared/lib/videoThumb', () => ({
  getVideoThumbSrc: vi.fn(() => ({ src: 'https://cdn/thumb.jpg', fallbackSrc: null })),
}));

vi.mock('../../shared/components/VideoPlayer', () => ({
  default: ({ playUrl, title }) => (
    <div data-testid="video-player" data-play-url={playUrl || ''}>
      {title}
    </div>
  ),
}));

vi.mock('../fitness/sections/OptimizedImage', () => ({
  default: ({ alt }) => <img alt={alt || ''} data-testid="optimized-image" />,
}));

vi.mock('./WatchLandingChrome', () => ({
  WatchLandingChrome: ({ children }) => <div data-testid="watch-chrome">{children}</div>,
}));

import { useVideo } from '../../shared/hooks/useVideo';

function renderWatchPage() {
  return render(
    <MemoryRouter initialEntries={[`/fitness/watch/${UUID}`]}>
      <Routes>
        <Route path="/fitness/watch/:videoId" element={<WatchVideoPage domain="fitness" />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('WatchVideoPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the player when the video can play', () => {
    useVideo.mockReturnValue({
      isLoading: false,
      error: null,
      data: {
        id: UUID,
        title_en: 'Playable workout',
        canPlay: true,
        video_url: 'https://cdn.example.com/video.mp4',
      },
    });

    renderWatchPage();

    expect(screen.getByTestId('video-player')).toBeInTheDocument();
    expect(screen.getByTestId('video-player')).toHaveAttribute(
      'data-play-url',
      'https://cdn.example.com/video.mp4'
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Playable workout' })).toBeInTheDocument();
  });

  it('shows a locked state instead of the player when access is denied', () => {
    useVideo.mockReturnValue({
      isLoading: false,
      error: null,
      data: {
        id: UUID,
        title_en: 'Locked workout',
        canPlay: false,
        locked: true,
      },
    });

    renderWatchPage();

    expect(screen.queryByTestId('video-player')).not.toBeInTheDocument();
    expect(screen.getByText('This video is locked')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Locked workout' })).toBeInTheDocument();
  });

  it('shows not-found when the video id is invalid', () => {
    useVideo.mockReturnValue({
      isLoading: false,
      error: null,
      data: { notFound: true, canPlay: false },
    });

    render(
      <MemoryRouter initialEntries={['/fitness/watch/not-a-uuid']}>
        <Routes>
          <Route path="/fitness/watch/:videoId" element={<WatchVideoPage domain="fitness" />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Video not found')).toBeInTheDocument();
    expect(screen.queryByTestId('video-player')).not.toBeInTheDocument();
  });
});
