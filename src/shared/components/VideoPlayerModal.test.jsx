import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VideoPlayerModal from './VideoPlayerModal';

describe('VideoPlayerModal', () => {
  const onClose = vi.fn();

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

  it('does not include nofullscreen in controlsList for MP4', () => {
    const { container } = render(
      <VideoPlayerModal
        isOpen
        onClose={onClose}
        title="Test Video"
        playUrl="https://cdn.example.com/videos/test.mp4"
        getLabel={(key) => key}
      />
    );

    const video = container.querySelector('video');
    expect(video).toBeTruthy();
    expect(video.getAttribute('controlsList')).toBe('nodownload noplaybackrate');
    expect(video.getAttribute('controlsList')).not.toContain('nofullscreen');
    expect(video.getAttribute('preload')).toBe('auto');
  });

  it('renders fullscreen button and calls requestFullscreen on wrapper', async () => {
    const { container } = render(
      <VideoPlayerModal
        isOpen
        onClose={onClose}
        title="Test Video"
        playUrl="https://cdn.example.com/videos/test.mp4"
        getLabel={(key) => key}
      />
    );

    const fullscreenBtn = screen.getByRole('button', { name: 'video-fullscreen' });
    await userEvent.click(fullscreenBtn);

    const wrapper = container.querySelector('.aspect-video');
    expect(HTMLElement.prototype.requestFullscreen).toHaveBeenCalled();
    expect(HTMLElement.prototype.requestFullscreen.mock.instances[0]).toBe(wrapper);
  });

  it('does not render when closed', () => {
    render(
      <VideoPlayerModal
        isOpen={false}
        onClose={onClose}
        title="Hidden"
        playUrl="https://cdn.example.com/videos/test.mp4"
      />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
