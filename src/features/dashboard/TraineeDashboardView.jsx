import React from 'react';
import VideoPreviewModal from './components/VideoPreviewModal';
import { TraineeDashboardContent } from './sections/TraineeDashboardContent';
import { useDashboardCoach } from './context/DashboardCoachContext';

export function TraineeDashboardView() {
  const c = useDashboardCoach();

  return (
    <>
      <TraineeDashboardContent />
      <VideoPreviewModal
        isOpen={c.showVideoModal}
        onClose={c.closeVideoPreview}
        video={c.previewVideo}
        videoUrl={c.previewVideoUrl}
        loading={c.previewVideoLoading}
        error={c.previewVideoError}
        currentLanguage={c.currentLanguage}
        isRTL={c.isRTL}
        domain={c.adminDomain}
        t={c.t}
      />
    </>
  );
}
