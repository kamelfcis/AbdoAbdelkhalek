import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getDashboardTranslation } from '../../../shared/i18n/dashboard';
import { isYouTubeUrl, toYouTubeEmbed } from '../../../shared/lib/resolveVideoPlayUrl';
import { Modal, Spinner } from '../../../shared/ui';

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
  // Buffering overlay shown until the media has enough data to start playing.
  const [isBuffering, setIsBuffering] = useState(true);

  useEffect(() => {
    setIsBuffering(true);
  }, [videoUrl, isOpen]);

  if (!video) return null;

  const tr = t || ((key) => getDashboardTranslation(domain, currentLanguage, key));
  const title = isRTL ? video.title_ar || video.title_en : video.title_en || video.title_ar;
  const isYouTube = isYouTubeUrl(videoUrl);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
      <div className="relative w-full bg-black rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center text-white py-16 gap-3">
            <Spinner size="lg" className="border-white border-t-transparent" />
            <p>{tr('video-loading')}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center text-red-100 bg-red-600/20 py-12 gap-3">
            <i className="fas fa-exclamation-triangle text-3xl text-red-200" aria-hidden="true" />
            <p className="text-red-100 text-center px-4">{error}</p>
          </div>
        ) : videoUrl && isYouTube ? (
          <div className="relative w-full aspect-video">
            <iframe
              key={videoUrl}
              src={toYouTubeEmbed(videoUrl)}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title || 'video'}
            />
          </div>
        ) : videoUrl ? (
          <div className="relative w-full aspect-video">
            {isBuffering && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70 text-white gap-3 pointer-events-none">
                <Spinner size="lg" className="border-white border-t-transparent" />
                <p className="text-sm">{tr('video-loading')}</p>
              </div>
            )}
            <video
              key={videoUrl}
              src={videoUrl}
              controls
              controlsList="nodownload noplaybackrate nofullscreen"
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
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-white py-16 gap-3">
            <i className="fas fa-video-slash text-4xl" aria-hidden="true" />
            <p>{tr('video-unavailable')}</p>
          </div>
        )}
      </div>
      {(video.description_ar || video.description_en) && (
        <p className={`mt-4 text-[var(--color-text-muted)] ${isRTL ? 'text-end' : 'text-start'}`}>
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
