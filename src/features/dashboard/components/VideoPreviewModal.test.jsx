import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VideoPreviewModal from './VideoPreviewModal';

describe('VideoPreviewModal', () => {
  const onClose = vi.fn();
  const video = { id: 1, title_en: 'Test Video', title_ar: 'فيديو تجريبي' };

  beforeEach(() => {
    onClose.mockClear();
    HTMLElement.prototype.requestFullscreen = vi.fn().mockResolvedValue(undefined);
    document.exitFullscreen = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      writable: true,
      value: null,
    });
  });

  afterEach(() => {
    document.body.style.overflow = '';
    vi.restoreAllMocks();
  });

  it('does not block native fullscreen in controlsList for MP4', () => {
    const { container } = render(
      <VideoPreviewModal
        isOpen
        onClose={onClose}
        video={video}
        videoUrl="https://cdn.example.com/videos/test.mp4"
        loading={false}
        currentLanguage="en"
        isRTL={false}
      />
    );

    const videoEl = container.querySelector('video');
    expect(videoEl).toBeTruthy();
    expect(videoEl.getAttribute('controlsList')).toBe('nodownload noplaybackrate');
    expect(videoEl.getAttribute('controlsList')).not.toContain('nofullscreen');
  });

  it('renders fullscreen button and calls requestFullscreen on container', async () => {
    const { container } = render(
      <VideoPreviewModal
        isOpen
        onClose={onClose}
        video={video}
        videoUrl="https://cdn.example.com/videos/test.mp4"
        loading={false}
        currentLanguage="en"
        isRTL={false}
      />
    );

    const fullscreenBtn = screen.getByRole('button', { name: 'Enter fullscreen' });
    await userEvent.click(fullscreenBtn);

    expect(HTMLElement.prototype.requestFullscreen).toHaveBeenCalled();
    expect(HTMLElement.prototype.requestFullscreen.mock.instances[0]).toBe(
      container.querySelector('[data-testid="video-preview-container"]')
    );
  });

  it('does not render fullscreen button for YouTube embeds', () => {
    render(
      <VideoPreviewModal
        isOpen
        onClose={onClose}
        video={video}
        videoUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        loading={false}
        currentLanguage="en"
        isRTL={false}
      />
    );

    expect(screen.queryByRole('button', { name: 'Enter fullscreen' })).not.toBeInTheDocument();
  });
});
