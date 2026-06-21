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
  const [needsUserPlay, setNeedsUserPlay] = useState(false);

  const isYouTube = isYouTubeUrl(playUrl);

  useEffect(() => {
    if (!isOpen) return undefined;
    setIsLoading(!posterUrl);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, playUrl, posterUrl]);

  useEffect(() => {
    setNeedsUserPlay(false);
    const v = videoRef.current;
    if (!v || isYouTube || !playUrl) return undefined;
    const p = v.play();
    if (p !== undefined) {
      p.catch(() => setNeedsUserPlay(true));
    }
    return undefined;
  }, [playUrl, isYouTube]);

  useEffect(() => {
    if (!isOpen) setNeedsUserPlay(false);
  }, [isOpen]);

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
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`bg-white flex flex-col w-full sm:max-w-4xl h-[95dvh] sm:h-auto max-h-[95dvh] sm:max-h-[90vh] rounded-t-2xl sm:rounded-xl rounded-b-none sm:rounded-b-xl shadow-[0_-12px_40px_rgba(0,0,0,0.35)] sm:shadow-xl pb-[env(safe-area-inset-bottom,0px)] animate-slide-up sm:animate-none overflow-hidden sm:overflow-y-auto ${isRTL ? 'text-right' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex shrink-0 justify-between items-center px-4 py-2.5 sm:p-6 sm:pb-0 gap-2 sm:gap-4 border-b sm:border-b-0 border-gray-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h3 className="text-base sm:text-2xl font-bold flex-1 truncate">{title}</h3>
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

        <div className="flex flex-col flex-1 min-h-0 px-0 sm:px-6 sm:pb-6 overflow-hidden">
        <div
          ref={containerRef}
          className="relative bg-gray-900 flex-1 min-h-[68dvh] sm:min-h-0 sm:aspect-video w-full overflow-hidden rounded-none sm:rounded-lg sm:max-h-none mb-0 sm:mb-4"
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
                className="absolute inset-0 w-full h-full object-contain"
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
                onPlaying={() => { setIsLoading(false); setNeedsUserPlay(false); }}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                style={{ userSelect: 'none', WebkitUserSelect: 'none', pointerEvents: 'auto' }}
              >
                <source src={playUrl} />
                Your browser does not support the video tag.
              </video>
              {needsUserPlay && (
                <button
                  type="button"
                  aria-label="Tap to play"
                  onClick={() => {
                    const v = videoRef.current;
                    if (v) v.play().then(() => setNeedsUserPlay(false)).catch(() => {});
                  }}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 z-10"
                  style={{ cursor: 'pointer' }}
                >
                  <span className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                    <i className="fas fa-play text-3xl text-gray-800" aria-hidden="true" style={{ marginLeft: '4px' }} />
                  </span>
                </button>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              {notAvailableLabel || getLabel('video-not-available')}
            </div>
          )}
        </div>

        {(categoryLabel || description) && (
          <div className="shrink-0 px-4 py-3 sm:px-0 sm:py-0 max-h-[18dvh] sm:max-h-none overflow-y-auto">
            {categoryLabel && <p className="text-gray-600 mb-2 text-sm sm:text-base">{categoryLabel}</p>}
            {description && <p className="text-gray-700 text-sm sm:text-base">{description}</p>}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
