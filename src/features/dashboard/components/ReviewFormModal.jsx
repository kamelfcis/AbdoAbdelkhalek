import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { contentService } from '../../../shared/api/contentService';
import { uploadService } from '../../../shared/api/uploadService';
import { Modal, Input, toastWarning, toastSuccess, toastError } from '../../../shared/ui';
import { ModalFormFooter, CheckboxField, FileField } from './modalHelpers';

const ReviewFormModal = ({ isOpen, onClose, review, onSaved, currentLanguage = 'en' }) => {
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isPublic, setIsPublic] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAr = currentLanguage === 'ar';

  useEffect(() => {
    if (review) {
      setDisplayOrder(review.display_order ?? 0);
      setIsPublic(Boolean(review.is_public));
      setImageFile(null);
    } else {
      setDisplayOrder(0);
      setIsPublic(true);
      setImageFile(null);
    }
  }, [review, isOpen]);

  const uploadImage = async (options = {}) => {
    if (!imageFile) return null;
    const extension = imageFile.name.split('.').pop();
    const baseName = imageFile.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-_]/g, '');
    const timestamp = Date.now();
    const identifier = options.reviewId ? `review-${options.reviewId}` : 'review';
    const filePath = `${identifier}-${timestamp}-${baseName || `image.${extension}`}`;

    const { publicUrl, path } = await uploadService.uploadFile({
      bucket: 'reviews',
      path: filePath,
      file: imageFile,
    });
    if (!publicUrl) {
      throw new Error(isAr ? 'تعذر الحصول على رابط الصورة.' : 'Unable to retrieve image URL.');
    }
    return { filePath: path || filePath, publicUrl };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!review && !imageFile) {
      toastWarning(isAr ? 'يرجى اختيار صورة التقييم' : 'Please choose a review image');
      return;
    }

    setIsSubmitting(true);
    try {
      if (review) {
        let imageData = {};
        if (imageFile) {
          const uploadResult = await uploadImage({ reviewId: review.id });
          imageData = { image_url: uploadResult.publicUrl, image_path: uploadResult.filePath };
        }
        await contentService.updateReview(review.id, {
          displayOrder: Number(displayOrder) || 0,
          isPublic,
          imageUrl: imageData.image_url,
          imagePath: imageData.image_path,
        });
        toastSuccess(isAr ? 'تم تحديث التقييم بنجاح' : 'Review updated successfully');
      } else {
        const uploadResult = await uploadImage();
        await contentService.createReview({
          displayOrder: Number(displayOrder) || 0,
          isPublic,
          imageUrl: uploadResult?.publicUrl,
          imagePath: uploadResult?.filePath,
        });
        toastSuccess(isAr ? 'تم إضافة التقييم بنجاح' : 'Review added successfully');
      }
      onSaved?.();
      onClose?.();
    } catch (error) {
      toastError(error.message || 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = review
    ? isAr ? 'تعديل رأي' : 'Edit Review'
    : isAr ? 'إضافة رأي' : 'Add Review';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
      footer={
        <ModalFormFooter
          onClose={onClose}
          isSubmitting={isSubmitting}
          formId="review-form"
          cancelLabel={isAr ? 'إلغاء' : 'Cancel'}
          savingLabel={isAr ? 'جاري الحفظ...' : 'Saving...'}
          submitLabel={review ? (isAr ? 'تحديث' : 'Update') : (isAr ? 'إضافة' : 'Add')}
        />
      }
    >
      <form id="review-form" onSubmit={handleSubmit} className="space-y-4">
        <FileField
          label={isAr ? 'صورة التقييم (لقطة شاشة)' : 'Review Image (Screenshot)'}
          accept="image/*"
          onChange={(event) => setImageFile(event.target.files?.[0] || null)}
          preview={
            review?.image_url && !imageFile ? (
              <div className="mt-3">
                <p className="text-xs text-[var(--color-text-muted)] mb-2">
                  {isAr ? 'الصورة الحالية:' : 'Current image:'}
                </p>
                <img src={review.image_url} alt="Review" className="w-32 h-32 object-contain rounded-lg border border-[var(--color-border)]" />
              </div>
            ) : null
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <Input
            label={isAr ? 'ترتيب العرض' : 'Display Order'}
            type="number"
            value={displayOrder}
            onChange={(event) => setDisplayOrder(event.target.value)}
          />
          <CheckboxField
            label={isAr ? 'عرض التقييم للجميع' : 'Display review publicly'}
            checked={isPublic}
            onChange={(event) => setIsPublic(event.target.checked)}
          />
        </div>
      </form>
    </Modal>
  );
};

ReviewFormModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  review: PropTypes.object,
  onSaved: PropTypes.func,
  currentLanguage: PropTypes.string,
};

export default ReviewFormModal;
