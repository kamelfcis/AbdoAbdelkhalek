import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { contentService } from '../../../shared/api/contentService';
import { uploadService } from '../../../shared/api/uploadService';
import { Modal, Input, Textarea, Button, toastWarning, toastSuccess, toastError } from '../../../shared/ui';

const CategoryFormModal = ({
  isOpen,
  onClose,
  category,
  onSaved,
  currentLanguage = 'en'
}) => {
  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    is_public: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name_en: category.name_en || '',
        name_ar: category.name_ar || '',
        description_en: category.description_en || '',
        description_ar: category.description_ar || '',
        is_public: Boolean(category.is_public)
      });
      setImageFile(null);
    } else {
      setFormData({
        name_en: '',
        name_ar: '',
        description_en: '',
        description_ar: '',
        is_public: true
      });
      setImageFile(null);
    }
  }, [category, isOpen]);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const uploadImageIfNeeded = async (categoryId) => {
    if (!imageFile) return null;

    const fileExt = imageFile.name.split('.').pop();
    const filePath = `categories/${categoryId}.${fileExt}`;

    const { publicUrl } = await uploadService.uploadFile({
      bucket: 'categories',
      path: filePath,
      file: imageFile,
    });

    if (publicUrl) {
      await contentService.updateCategory(categoryId, { image_path: publicUrl });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name_en.trim() || !formData.name_ar.trim()) {
      toastWarning(currentLanguage === 'ar' ? 'الرجاء تعبئة الحقول المطلوبة' : 'Please fill in the required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        nameEn: formData.name_en,
        nameAr: formData.name_ar,
        descriptionEn: formData.description_en,
        descriptionAr: formData.description_ar,
        isPublic: formData.is_public,
      };

      if (category) {
        await contentService.updateCategory(category.id, payload);
        if (imageFile) await uploadImageIfNeeded(category.id);
        toastSuccess(currentLanguage === 'ar' ? 'تم تحديث التصنيف بنجاح' : 'Category updated successfully');
      } else {
        const data = await contentService.createCategory(payload);
        if (imageFile && data?.id) await uploadImageIfNeeded(data.id);
        toastSuccess(currentLanguage === 'ar' ? 'تم إضافة التصنيف بنجاح' : 'Category added successfully');
      }

      onSaved?.();
      onClose?.();
    } catch (err) {
      toastError(err.message || (currentLanguage === 'ar' ? 'حدث خطأ' : 'Error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = category
    ? currentLanguage === 'ar' ? 'تعديل التصنيف' : 'Edit Category'
    : currentLanguage === 'ar' ? 'إضافة تصنيف' : 'Add Category';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose}>
            {currentLanguage === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
            type="submit"
            form="category-form"
          >
            {isSubmitting
              ? currentLanguage === 'ar' ? 'جاري الحفظ...' : 'Saving...'
              : currentLanguage === 'ar' ? 'حفظ' : 'Save'}
          </Button>
        </div>
      }
    >
      <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={currentLanguage === 'ar' ? 'الاسم (إنجليزي)' : 'Name (EN)'}
          type="text"
          name="name_en"
          value={formData.name_en}
          onChange={handleInputChange}
          required
        />
        <Input
          label={currentLanguage === 'ar' ? 'الاسم (عربي)' : 'Name (AR)'}
          type="text"
          name="name_ar"
          value={formData.name_ar}
          onChange={handleInputChange}
          required
        />
        <Textarea
          label={currentLanguage === 'ar' ? 'الوصف (إنجليزي)' : 'Description (EN)'}
          name="description_en"
          value={formData.description_en}
          onChange={handleInputChange}
          rows={2}
        />
        <Textarea
          label={currentLanguage === 'ar' ? 'الوصف (عربي)' : 'Description (AR)'}
          name="description_ar"
          value={formData.description_ar}
          onChange={handleInputChange}
          rows={2}
        />
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
            {currentLanguage === 'ar' ? 'صورة التصنيف' : 'Category Image'}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-[var(--color-text-muted)]"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="is_public"
            checked={formData.is_public}
            onChange={handleInputChange}
            className="rounded border-[var(--color-border)]"
          />
          <span className="text-sm text-[var(--color-text)]">
            {currentLanguage === 'ar' ? 'عام' : 'Public'}
          </span>
        </label>
      </form>
    </Modal>
  );
};

CategoryFormModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  category: PropTypes.object,
  onSaved: PropTypes.func,
  currentLanguage: PropTypes.string,
};

export default CategoryFormModal;
