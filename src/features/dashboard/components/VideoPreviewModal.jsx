import React from 'react';
import PropTypes from 'prop-types';
import { getDashboardTranslation } from '../../../shared/i18n/dashboard';
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
  if (!video) return null;

  const tr = t || ((key) => getDashboardTranslation(domain, currentLanguage, key));
  const title = isRTL ? video.title_ar || video.title_en : video.title_en || video.title_ar;

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
        ) : videoUrl ? (
          <video
            key={videoUrl}
            src={videoUrl}
            controls
            controlsList="nodownload noplaybackrate nofullscreen"
            disablePictureInPicture
            autoPlay
            playsInline
            className="w-full h-full"
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          />
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
