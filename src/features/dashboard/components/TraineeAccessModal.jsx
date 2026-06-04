import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getContentService } from '../../../shared/lib/getContentService';
import { getDashboardTranslation } from '../../../shared/i18n/dashboard';
import { Modal, Spinner, toastSuccess, toastError } from '../../../shared/ui';
import { ModalFormFooter, CheckboxField } from './modalHelpers';

const TraineeAccessModal = ({
  isOpen,
  onClose,
  trainee,
  categories = [],
  videos = [],
  onSaved,
  currentLanguage = 'en',
  domain = 'fitness',
  t,
}) => {
  const tr = t || ((key) => getDashboardTranslation(domain, currentLanguage, key));
  const contentService = getContentService(domain);
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedVideos, setSelectedVideos] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isAr = currentLanguage === 'ar';

  useEffect(() => {
    if (!isOpen || !trainee?.id) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const access = await contentService.getTraineeAccess(trainee.id);
        setSelectedCategories(new Set((access.categories || []).map((a) => a.categoryId || a.category_id)));
        setSelectedVideos(new Set((access.videos || []).map((a) => a.videoId || a.video_id)));
      } catch (e) {
        console.error(e);
        toastError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [isOpen, trainee, contentService]);

  const toggle = (set, id, setter) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setter(next);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await contentService.setTraineeAccess(trainee.id, {
        categoryIds: Array.from(selectedCategories),
        videoIds: Array.from(selectedVideos),
      });
      toastSuccess(tr('trainee-access-saved'));
      onSaved?.();
      onClose?.();
    } catch (e) {
      toastError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tr('trainee-access-title')}
      size="lg"
      footer={
        <ModalFormFooter
          onClose={onClose}
          isSubmitting={isSubmitting}
          onSubmit={handleSave}
          cancelLabel={tr('btn-cancel')}
          savingLabel="..."
          submitLabel={tr('btn-save')}
        />
      }
    >
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-[var(--color-text)] mb-3">{tr('trainee-access-categories')}</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {categories.map((cat) => (
                <CheckboxField
                  key={cat.id}
                  label={isAr ? cat.name_ar : cat.name_en}
                  checked={selectedCategories.has(cat.id)}
                  onChange={() => toggle(selectedCategories, cat.id, setSelectedCategories)}
                />
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text)] mb-3">{tr('nav-videos')}</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {videos.map((v) => (
                <CheckboxField
                  key={v.id}
                  label={isAr ? v.title_ar : v.title_en}
                  checked={selectedVideos.has(v.id)}
                  onChange={() => toggle(selectedVideos, v.id, setSelectedVideos)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

TraineeAccessModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  trainee: PropTypes.object,
  categories: PropTypes.array,
  videos: PropTypes.array,
  onSaved: PropTypes.func,
  currentLanguage: PropTypes.string,
  domain: PropTypes.string,
  t: PropTypes.func,
};

export default TraineeAccessModal;
