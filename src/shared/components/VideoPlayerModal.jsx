import React, { useEffect } from 'react';
import VideoPlayer from './VideoPlayer';

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
  useEffect(() => {
    if (!isOpen) return undefined;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, playUrl, posterUrl]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !document.fullscreenElement) {
        e.preventDefault();
        onClose();
        return;
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
          <button
            type="button"
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
            aria-label={getLabel('video-close') || 'Close'}
          >
            <i className="fas fa-times text-2xl" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col flex-1 min-h-0 px-0 sm:px-6 sm:pb-6 overflow-hidden">
          <VideoPlayer
            playUrl={playUrl}
            posterUrl={posterUrl}
            title={title}
            getLabel={getLabel}
            notAvailableLabel={notAvailableLabel}
            className="aspect-video flex-1 min-h-[68dvh] sm:min-h-0 w-full rounded-none sm:rounded-lg sm:max-h-none mb-0 sm:mb-4"
          />

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
