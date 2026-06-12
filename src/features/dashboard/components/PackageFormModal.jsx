import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { contentService } from '../../../shared/api/contentService';
import { getDashboardTranslation } from '../../../shared/i18n/dashboard';
import { Modal, Input, Textarea, Select, toastWarning, toastSuccess, toastError } from '../../../shared/ui';
import { ModalFormFooter, CheckboxField } from './modalHelpers';

const PackageFormModal = ({ isOpen, onClose, pack, onSaved, currentLanguage = 'en', domain = 'fitness', t }) => {
  const tr = t || ((key) => getDashboardTranslation(domain, currentLanguage, key));
  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    price_egp: '',
    price_usd: '',
    duration_days: '',
    level: 'beginner',
    type: 'training',
    features_en: '',
    features_ar: '',
    includes_video_feedback: false,
    daily_support: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (pack) {
      setFormData({
        name_en: pack.name_en || '',
        name_ar: pack.name_ar || '',
        description_en: pack.description_en || '',
        description_ar: pack.description_ar || '',
        price_egp: pack.price_egp ?? '',
        price_usd: pack.price_usd ?? '',
        duration_days: pack.duration_days ?? '',
        level: pack.level || 'beginner',
        type: pack.type || 'training',
        features_en: Array.isArray(pack.features_en) ? pack.features_en.join('\n') : (pack.features_en || ''),
        features_ar: Array.isArray(pack.features_ar) ? pack.features_ar.join('\n') : (pack.features_ar || ''),
        includes_video_feedback: Boolean(pack.includes_video_feedback),
        daily_support: Boolean(pack.daily_support),
      });
    } else {
      setFormData({
        name_en: '',
        name_ar: '',
        description_en: '',
        description_ar: '',
        price_egp: '',
        price_usd: '',
        duration_days: '',
        level: 'beginner',
        type: 'training',
        features_en: '',
        features_ar: '',
        includes_video_feedback: false,
        daily_support: false,
      });
    }
  }, [pack, isOpen]);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name_en.trim() || !formData.name_ar.trim()) {
      toastWarning(tr('package-name-required'));
      return;
    }

    if (!formData.duration_days) {
      toastWarning(tr('package-duration-required'));
      return;
    }

    const payload = {
      name_en: formData.name_en,
      name_ar: formData.name_ar,
      description_en: formData.description_en,
      description_ar: formData.description_ar,
      price_egp: formData.price_egp ? Number(formData.price_egp) : null,
      price_usd: formData.price_usd ? Number(formData.price_usd) : null,
      duration_days: Number(formData.duration_days),
      level: formData.level,
      type: formData.type,
      features_en: formData.features_en
        ? formData.features_en.split('\n').map((item) => item.trim()).filter(Boolean)
        : [],
      features_ar: formData.features_ar
        ? formData.features_ar.split('\n').map((item) => item.trim()).filter(Boolean)
        : [],
      includes_video_feedback: formData.includes_video_feedback,
      daily_support: formData.daily_support,
    };

    setIsSubmitting(true);
    try {
      let saved;
      if (pack) {
        saved = await contentService.updatePackage(pack.id, payload);
        toastSuccess(tr('package-updated'));
      } else {
        saved = await contentService.createPackage(payload);
        toastSuccess(tr('package-added'));
      }
      onSaved?.(saved ?? { ...payload, id: pack?.id });
      onClose?.();
    } catch (error) {
      toastError(error.message || 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = pack ? tr('edit-package-modal') : tr('add-package');

  const levelOptions = [
    { value: 'beginner', label: tr('level-beginner') },
    { value: 'intermediate', label: tr('level-intermediate') },
    { value: 'advanced', label: tr('level-advanced') },
    { value: 'elite', label: tr('level-elite') },
  ];

  const typeOptions = [
    { value: 'training', label: tr('type-training') },
    { value: 'nutrition', label: tr('type-nutrition') },
    { value: 'combined', label: tr('type-combined') },
  ];

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
          formId="package-form"
          cancelLabel={tr('btn-cancel')}
          savingLabel={tr('saving')}
          submitLabel={pack ? tr('btn-update') : tr('btn-add')}
        />
      }
    >
      <form id="package-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label={tr('package-form-name-en')} name="name_en" value={formData.name_en} onChange={handleInputChange} required />
          <Input label={tr('package-form-name-ar')} name="name_ar" value={formData.name_ar} onChange={handleInputChange} required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Textarea label={tr('package-form-desc-en')} name="description_en" value={formData.description_en} onChange={handleInputChange} rows={4} />
          <Textarea label={tr('package-form-desc-ar')} name="description_ar" value={formData.description_ar} onChange={handleInputChange} rows={4} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label={tr('package-form-price-egp')} type="number" min="0" step="0.01" name="price_egp" value={formData.price_egp} onChange={handleInputChange} />
          <Input label={tr('package-form-price-usd')} type="number" min="0" step="0.01" name="price_usd" value={formData.price_usd} onChange={handleInputChange} />
          <Input label={tr('package-form-duration')} type="number" min="1" name="duration_days" value={formData.duration_days} onChange={handleInputChange} required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label={tr('package-form-level')} name="level" value={formData.level} onChange={handleInputChange} options={levelOptions} />
          <Select label={tr('package-form-type')} name="type" value={formData.type} onChange={handleInputChange} options={typeOptions} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Textarea
            label={tr('package-form-features-en')}
            name="features_en"
            value={formData.features_en}
            onChange={handleInputChange}
            rows={4}
          />
          <Textarea
            label={tr('package-form-features-ar')}
            name="features_ar"
            value={formData.features_ar}
            onChange={handleInputChange}
            rows={4}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CheckboxField
            label={tr('package-form-video-feedback')}
            name="includes_video_feedback"
            checked={formData.includes_video_feedback}
            onChange={handleInputChange}
          />
          <CheckboxField
            label={tr('package-form-daily-support')}
            name="daily_support"
            checked={formData.daily_support}
            onChange={handleInputChange}
          />
        </div>
      </form>
    </Modal>
  );
};

PackageFormModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  pack: PropTypes.object,
  onSaved: PropTypes.func,
  currentLanguage: PropTypes.string,
  domain: PropTypes.string,
  t: PropTypes.func,
};

export default PackageFormModal;
