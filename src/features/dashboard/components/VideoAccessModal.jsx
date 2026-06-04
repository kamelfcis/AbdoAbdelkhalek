import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { getContentService } from '../../../shared/lib/getContentService';
import { getDashboardTranslation } from '../../../shared/i18n/dashboard';
import { Modal, Spinner, EmptyState, toastSuccess, toastError } from '../../../shared/ui';
import { ModalFormFooter } from './modalHelpers';

const VideoAccessModal = ({
  isOpen,
  onClose,
  video,
  trainees = [],
  onSaved,
  currentLanguage = 'en',
  domain = 'fitness',
  t,
}) => {
  const tr = t || ((key) => getDashboardTranslation(domain, currentLanguage, key));
  const contentService = getContentService(domain);
  const [grantedTrainees, setGrantedTrainees] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isAr = currentLanguage === 'ar';

  const sortedTrainees = useMemo(() => {
    return [...trainees].sort((a, b) => {
      const nameA = (a.full_name || a.email || '').toLowerCase();
      const nameB = (b.full_name || b.email || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [trainees]);

  useEffect(() => {
    const loadAccess = async () => {
      if (!video || !isOpen) return;
      setIsLoading(true);
      try {
        const data = await contentService.getVideoAccess(video.id);
        setGrantedTrainees(new Set(data || []));
      } catch (error) {
        toastError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadAccess();
  }, [video, isOpen, contentService]);

  const toggleTrainee = (traineeId) => {
    setGrantedTrainees((prev) => {
      const next = new Set(prev);
      if (next.has(traineeId)) next.delete(traineeId);
      else next.add(traineeId);
      return next;
    });
  };

  const handleSave = async () => {
    if (!video) return;
    setIsSaving(true);
    try {
      await contentService.setVideoAccess(video.id, Array.from(grantedTrainees));
      toastSuccess(tr('video-access-updated'));
      onSaved?.();
      onClose?.();
    } catch (error) {
      toastError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!video) return null;

  const videoTitle = isAr ? video.title_ar || video.title_en : video.title_en || video.title_ar;
  const title = `${tr('video-access-manage')}: ${videoTitle}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      footer={
        <ModalFormFooter
          onClose={onClose}
          isSubmitting={isSaving}
          onSubmit={handleSave}
          cancelLabel={tr('btn-cancel')}
          savingLabel={tr('saving')}
          submitLabel={tr('btn-save')}
        />
      }
    >
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">{tr('video-access-hint')}</p>
          {sortedTrainees.length === 0 ? (
            <EmptyState icon="fa-users" title={tr('trainees-none')} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
              {sortedTrainees.map((traineeItem) => (
                <label
                  key={traineeItem.id}
                  className="flex items-start gap-2 border border-[var(--color-border)] rounded-lg px-3 py-2 hover:border-[var(--color-primary)] transition cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="mt-1 rounded border-[var(--color-border)] text-[var(--color-primary)]"
                    checked={grantedTrainees.has(traineeItem.id)}
                    onChange={() => toggleTrainee(traineeItem.id)}
                  />
                  <div className="text-sm min-w-0">
                    <p className="font-medium text-[var(--color-text)] truncate">
                      {traineeItem.full_name || traineeItem.email}
                    </p>
                    <p className="text-[var(--color-text-muted)] text-xs truncate">{traineeItem.email}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </>
      )}
    </Modal>
  );
};

VideoAccessModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  video: PropTypes.object,
  trainees: PropTypes.array,
  onSaved: PropTypes.func,
  currentLanguage: PropTypes.string,
  domain: PropTypes.string,
  t: PropTypes.func,
};

export default VideoAccessModal;
