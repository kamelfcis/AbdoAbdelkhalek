import React, { useRef, useState, useEffect, useCallback } from 'react';
import { isYouTubeUrl } from '../lib/resolveVideoPlayUrl';

export default function VideoPlayer({
  playUrl,
  posterUrl,
  title,
  getLabel = (key) => key,
  notAvailableLabel,
  className = '',
  showFullscreenButton = true,
}) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [needsUserPlay, setNeedsUserPlay] = useState(false);

  const isYouTube = isYouTubeUrl(playUrl);

  useEffect(() => {
    setIsLoading(!posterUrl);
    setNeedsUserPlay(false);
    const v = videoRef.current;
    if (!v || isYouTube || !playUrl) return undefined;
    const p = v.play();
    if (p !== undefined) {
      p.catch(() => setNeedsUserPlay(true));
    }
    return undefined;
  }, [playUrl, isYouTube, posterUrl]);

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
    const handleKeyDown = (e) => {
      if ((e.key === 'f' || e.key === 'F') && !isYouTube && playUrl) {
        e.preventDefault();
        toggleFullscreen();
      }
      if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isYouTube, playUrl, toggleFullscreen]);

  const fullscreenLabel = isFullscreen
    ? getLabel('video-exit-fullscreen')
    : getLabel('video-fullscreen');

  return (
    <div
      ref={containerRef}
      className={`relative bg-gray-900 overflow-hidden ${className}`}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {showFullscreenButton && !isYouTube && playUrl && (
        <button
          type="button"
          onClick={toggleFullscreen}
          className="absolute top-3 right-3 z-20 text-white/90 hover:text-white p-2 rounded-lg bg-black/40 hover:bg-black/60"
          aria-label={fullscreenLabel}
          title={fullscreenLabel}
        >
          <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'} text-lg`} aria-hidden="true" />
        </button>
      )}

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
            onPlaying={() => {
              setIsLoading(false);
              setNeedsUserPlay(false);
            }}
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
  );
}
