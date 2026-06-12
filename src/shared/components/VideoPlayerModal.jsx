import React, { useRef, useState, useEffect, useCallback } from 'react';
import { isYouTubeUrl } from '../lib/resolveVideoPlayUrl';

export default function VideoPlayerModal({
  isOpen,
  onClose,
  title,
  playUrl,
  posterUrl,
  description,
  categoryLabel,
  isRTL = false,
  getLabel = (key) => key,
  notAvailableLabel,
}) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isYouTube = isYouTubeUrl(playUrl);

  useEffect(() => {
    if (!isOpen) return undefined;
    setIsLoading(!posterUrl);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, playUrl, posterUrl]);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    const video = videoRef.current;
    if (!el) return;

    if (document.fullscreenElement) {
      document.exitFullscreen?.();
      return;
    }

    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if (video?.webkitEnterFullscreen) {
      video.webkitEnterFullscreen();
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !document.fullscreenElement) {
        e.preventDefault();
        onClose();
        return;
      }
      if ((e.key === 'f' || e.key === 'F') && !isYouTube && playUrl) {
        e.preventDefault();
        toggleFullscreen();
      }
      if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
      }
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isYouTube, playUrl, onClose, toggleFullscreen]);

  if (!isOpen) return null;

  const fullscreenLabel = isFullscreen
    ? getLabel('video-exit-fullscreen')
    : getLabel('video-fullscreen');

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`bg-white rounded-lg p-6 max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto ${isRTL ? 'text-right' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex justify-between items-center mb-4 gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h3 className="text-2xl font-bold flex-1">{title}</h3>
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {!isYouTube && playUrl && (
              <button
                type="button"
                onClick={toggleFullscreen}
                className="text-gray-600 hover:text-gray-800 p-1"
                aria-label={fullscreenLabel}
                title={fullscreenLabel}
              >
                <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'} text-xl`} aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
              aria-label={getLabel('video-close') || 'Close'}
            >
              <i className="fas fa-times text-2xl" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div
          ref={containerRef}
          className="relative bg-gray-900 mb-4 aspect-video w-full overflow-hidden rounded-lg"
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        >
          {isYouTube ? (
            <iframe
              key={playUrl}
              src={playUrl}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title || 'video'}
            />
          ) : playUrl ? (
            <>
              {isLoading && !posterUrl && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-10">
                  <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  <p className="mt-3 text-sm">{getLabel('video-loading')}</p>
                </div>
              )}
              <video
                ref={videoRef}
                key={playUrl}
                className="w-full h-full object-contain"
                controls
                controlsList="nodownload noplaybackrate"
                disablePictureInPicture
                autoPlay
                playsInline
                preload="auto"
                fetchPriority="high"
                poster={posterUrl || undefined}
                onCanPlay={() => setIsLoading(false)}
                onLoadedData={() => setIsLoading(false)}
                onPlaying={() => setIsLoading(false)}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                style={{ userSelect: 'none', WebkitUserSelect: 'none', pointerEvents: 'auto' }}
              >
                <source src={playUrl} />
                Your browser does not support the video tag.
              </video>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              {notAvailableLabel || getLabel('video-not-available')}
            </div>
          )}
        </div>

        {(categoryLabel || description) && (
          <div>
            {categoryLabel && <p className="text-gray-600 mb-2">{categoryLabel}</p>}
            {description && <p className="text-gray-700">{description}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
