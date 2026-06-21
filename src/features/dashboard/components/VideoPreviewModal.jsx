import React, { useEffect, useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getDashboardTranslation } from '../../../shared/i18n/dashboard';
import { isYouTubeUrl, toYouTubeEmbed } from '../../../shared/lib/resolveVideoPlayUrl';
import Modal from '../../../shared/ui/Modal';
import Spinner from '../../../shared/ui/Spinner';

const VideoPreviewModal = ({
  isOpen,
  onClose,
  video,
  videoUrl,
  loading,
  error,
  currentLanguage,
  isRTL,
  domain = 'fitness',
  t,
}) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [isBuffering, setIsBuffering] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setIsBuffering(true);
  }, [videoUrl, isOpen]);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    const videoEl = videoRef.current;
    if (!el) return;

    if (document.fullscreenElement) {
      document.exitFullscreen?.();
      return;
    }

    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if (videoEl?.webkitEnterFullscreen) {
      videoEl.webkitEnterFullscreen();
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
      if (e.key === 'Escape' && document.fullscreenElement) {
        e.stopPropagation();
        return;
      }
      if ((e.key === 'f' || e.key === 'F') && videoUrl && !isYouTubeUrl(videoUrl) && !loading && !error) {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, videoUrl, loading, error, toggleFullscreen]);

  if (!video) return null;

  const tr = t || ((key) => getDashboardTranslation(domain, currentLanguage, key));
  const title = isRTL ? video.title_ar || video.title_en : video.title_en || video.title_ar;
  const isYouTube = isYouTubeUrl(videoUrl);
  const showNativeVideo = videoUrl && !isYouTube && !loading && !error;
  const fullscreenLabel = isFullscreen ? tr('video-exit-fullscreen') : tr('video-fullscreen');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="full"
      overlayClassName="p-1 sm:p-4"
      className="w-[calc(100vw-0.5rem)] sm:max-w-4xl max-h-[98dvh] sm:max-h-[90vh] rounded-lg sm:rounded-xl"
      headerClassName="px-3 py-3 sm:px-6 sm:py-4"
      contentClassName="px-2 py-2 sm:px-6 sm:py-4"
      closeButtonClassName="shrink-0"
    >
      <div
        ref={containerRef}
        className="relative w-full bg-black rounded-lg sm:rounded-xl overflow-hidden aspect-video max-h-[min(72dvh,calc(100vw*9/16))] sm:max-h-none"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
      >
        {showNativeVideo && (
          <button
            type="button"
            onClick={toggleFullscreen}
            className={`absolute top-2 z-20 p-2.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors ${
              isRTL ? 'left-2' : 'right-2'
            }`}
            aria-label={fullscreenLabel}
            title={fullscreenLabel}
          >
            <i
              className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'} text-lg`}
              aria-hidden="true"
            />
          </button>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center text-white py-16 gap-3 min-h-[40dvh] sm:min-h-0">
            <Spinner size="lg" className="border-white border-t-transparent" />
            <p>{tr('video-loading')}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center text-red-100 bg-red-600/20 py-12 gap-3 min-h-[40dvh] sm:min-h-0">
            <i className="fas fa-exclamation-triangle text-3xl text-red-200" aria-hidden="true" />
            <p className="text-red-100 text-center px-4">{error}</p>
          </div>
        ) : videoUrl && isYouTube ? (
          <iframe
            key={videoUrl}
            src={toYouTubeEmbed(videoUrl)}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title || 'video'}
          />
        ) : videoUrl ? (
          <>
            {isBuffering && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70 text-white gap-3 pointer-events-none">
                <Spinner size="lg" className="border-white border-t-transparent" />
                <p className="text-sm">{tr('video-loading')}</p>
              </div>
            )}
            <video
              ref={videoRef}
              key={videoUrl}
              src={videoUrl}
              controls
              controlsList="nodownload noplaybackrate"
              disablePictureInPicture
              autoPlay
              playsInline
              preload="auto"
              fetchPriority="high"
              className="absolute inset-0 w-full h-full object-contain"
              onCanPlay={() => setIsBuffering(false)}
              onPlaying={() => setIsBuffering(false)}
              onWaiting={() => setIsBuffering(true)}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
              style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-white py-16 gap-3 min-h-[40dvh] sm:min-h-0">
            <i className="fas fa-video-slash text-4xl" aria-hidden="true" />
            <p>{tr('video-unavailable')}</p>
          </div>
        )}
      </div>
      {(video.description_ar || video.description_en) && (
        <p className={`mt-3 sm:mt-4 text-sm sm:text-base text-[var(--color-text-muted)] ${isRTL ? 'text-end' : 'text-start'}`}>
          {isRTL ? video.description_ar : video.description_en}
        </p>
      )}
    </Modal>
  );
};

VideoPreviewModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  video: PropTypes.object,
  videoUrl: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.string,
  currentLanguage: PropTypes.string,
  isRTL: PropTypes.bool,
  domain: PropTypes.string,
  t: PropTypes.func,
};

export default VideoPreviewModal;
