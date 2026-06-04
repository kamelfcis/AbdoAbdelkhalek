import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { getContentService } from '../../../shared/lib/getContentService';
import { uploadService } from '../../../shared/api/uploadService';
import { getMediaBuckets } from '../../../shared/lib/mediaBuckets';
import {
  Modal,
  Input,
  Textarea,
  toastWarning,
  toastSuccess,
  toastError,
} from '../../../shared/ui';
import { ModalFormFooter, CheckboxField, FileField } from './modalHelpers';

const SuccessStoryFormModal = ({
  isOpen,
  onClose,
  story,
  onSaved,
  currentLanguage = 'en',
  domain = 'fitness',
}) => {
  const contentService = getContentService(domain);
  const mediaBuckets = useMemo(() => getMediaBuckets(domain), [domain]);
  const [formData, setFormData] = useState({
    title_en: '',
    title_ar: '',
    content_en: '',
    content_ar: '',
    display_order: 0,
    is_public: true,
    is_featured: false,
    published_at: '',
  });
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAr = currentLanguage === 'ar';

  useEffect(() => {
    if (story) {
      setFormData({
        title_en: story.title_en || '',
        title_ar: story.title_ar || '',
        content_en: story.content_en || story.description_en || '',
        content_ar: story.content_ar || story.description_ar || '',
        display_order: story.display_order ?? 0,
        is_public: Boolean(story.is_public),
        is_featured: Boolean(story.is_featured),
        published_at: story.published_at ? new Date(story.published_at).toISOString().slice(0, 16) : '',
      });
      setBeforeImage(null);
      setAfterImage(null);
    } else {
      setFormData({
        title_en: '',
        title_ar: '',
        content_en: '',
        content_ar: '',
        display_order: 0,
        is_public: true,
        is_featured: false,
        published_at: '',
      });
      setBeforeImage(null);
      setAfterImage(null);
    }
  }, [story, isOpen]);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const uploadStoryImage = async ({ storyId, file, folder }) => {
    if (!file) return;
    const fileExt = file.name.split('.').pop();
    const filePath = `${mediaBuckets.successStories}/${folder}/${storyId}-${Date.now()}.${fileExt}`;
    const { publicUrl } = await uploadService.uploadFile({
      bucket: mediaBuckets.successStories,
      path: filePath,
      file,
    });
    const patch =
      folder === 'before'
        ? { beforeImageUrl: publicUrl, beforeImagePath: filePath }
        : { afterImageUrl: publicUrl, afterImagePath: filePath };
    await contentService.updateSuccessStory(storyId, patch);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title_en.trim() || !formData.title_ar.trim()) {
      toastWarning(isAr ? 'يرجى إدخال عنوان القصة' : 'Please enter the story title');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      title_en: formData.title_en,
      title_ar: formData.title_ar,
      content_en: formData.content_en,
      content_ar: formData.content_ar,
      description_en: formData.content_en,
      description_ar: formData.content_ar,
      display_order: Number(formData.display_order) || 0,
      is_public: formData.is_public,
      is_featured: formData.is_featured,
      published_at: formData.published_at ? new Date(formData.published_at).toISOString() : null,
    };

    try {
      if (story) {
        await contentService.updateSuccessStory(story.id, payload);
        await uploadStoryImage({ storyId: story.id, file: beforeImage, folder: 'before' });
        await uploadStoryImage({ storyId: story.id, file: afterImage, folder: 'after' });
        toastSuccess(isAr ? 'تم تحديث القصة بنجاح' : 'Success story updated successfully');
      } else {
        const data = await contentService.createSuccessStory(payload);
        if (data?.id) {
          await uploadStoryImage({ storyId: data.id, file: beforeImage, folder: 'before' });
          await uploadStoryImage({ storyId: data.id, file: afterImage, folder: 'after' });
        }
        toastSuccess(isAr ? 'تمت إضافة القصة بنجاح' : 'Success story added successfully');
      }
      onSaved?.();
      onClose?.();
    } catch (error) {
      toastError(error.message || 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = story
    ? isAr
      ? 'تعديل قصة نجاح'
      : 'Edit Success Story'
    : isAr
      ? 'إضافة قصة نجاح'
      : 'Add Success Story';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="xl"
      footer={
        <ModalFormFooter
          onClose={onClose}
          isSubmitting={isSubmitting}
          formId="story-form"
          cancelLabel={isAr ? 'إلغاء' : 'Cancel'}
          savingLabel={isAr ? 'جاري الحفظ...' : 'Saving...'}
          submitLabel={story ? (isAr ? 'تحديث' : 'Update') : (isAr ? 'إضافة' : 'Add')}
        />
      }
    >
      <form id="story-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={isAr ? 'العنوان (EN)' : 'Title (English)'}
            name="title_en"
            value={formData.title_en}
            onChange={handleInputChange}
            required
          />
          <Input
            label={isAr ? 'العنوان (AR)' : 'Title (Arabic)'}
            name="title_ar"
            value={formData.title_ar}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Textarea
            label={isAr ? 'القصة (EN)' : 'Story (English)'}
            name="content_en"
            value={formData.content_en}
            onChange={handleInputChange}
            rows={5}
          />
          <Textarea
            label={isAr ? 'القصة (AR)' : 'Story (Arabic)'}
            name="content_ar"
            value={formData.content_ar}
            onChange={handleInputChange}
            rows={5}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label={isAr ? 'ترتيب العرض' : 'Display Order'}
            type="number"
            name="display_order"
            value={formData.display_order}
            onChange={handleInputChange}
          />
          <Input
            label={isAr ? 'تاريخ النشر' : 'Published At'}
            type="datetime-local"
            name="published_at"
            value={formData.published_at}
            onChange={handleInputChange}
          />
          <div className="flex flex-col gap-2 justify-end">
            <CheckboxField
              label={isAr ? 'عرض للجميع' : 'Public story'}
              name="is_public"
              checked={formData.is_public}
              onChange={handleInputChange}
            />
            <CheckboxField
              label={isAr ? 'قصة مميزة' : 'Featured story'}
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FileField
            label={isAr ? 'صورة قبل' : 'Before Image'}
            accept="image/*"
            onChange={(event) => setBeforeImage(event.target.files?.[0] || null)}
            preview={
              story?.before_image_url && !beforeImage ? (
                <div className="mt-3">
                  <img
                    src={story.before_image_url}
                    alt="Before"
                    className="w-24 h-24 object-cover rounded-lg border border-[var(--color-border)]"
                  />
                </div>
              ) : null
            }
          />
          <FileField
            label={isAr ? 'صورة بعد' : 'After Image'}
            accept="image/*"
            onChange={(event) => setAfterImage(event.target.files?.[0] || null)}
            preview={
              story?.after_image_url && !afterImage ? (
                <div className="mt-3">
                  <img
                    src={story.after_image_url}
                    alt="After"
                    className="w-24 h-24 object-cover rounded-lg border border-[var(--color-border)]"
                  />
                </div>
              ) : null
            }
          />
        </div>
      </form>
    </Modal>
  );
};

SuccessStoryFormModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  story: PropTypes.object,
  onSaved: PropTypes.func,
  currentLanguage: PropTypes.string,
  domain: PropTypes.string,
};

export default SuccessStoryFormModal;
