import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getContentService } from '../../../shared/lib/getContentService';
import { getDashboardTranslation } from '../../../shared/i18n/dashboard';
import { Modal, Input, Textarea, Select, toastWarning, toastSuccess, toastError } from '../../../shared/ui';
import { ModalFormFooter, CheckboxField } from './modalHelpers';

const EMPTY_PACKAGE_FORM = {
  name_en: '',
  name_ar: '',
  description_en: '',
  description_ar: '',
  price_egp: '',
  price_usd: '',
  price_egp_3m: '',
  price_usd_3m: '',
  price_egp_6m: '',
  price_usd_6m: '',
  duration_days: '',
  level: 'beginner',
  type: 'training',
  features_en: '',
  features_ar: '',
  includes_video_feedback: false,
  daily_support: false,
  allow_1_month: true,
  allow_3_months: true,
  allow_6_months: true,
  is_active: true,
};

function splitFeaturesLines(value) {
  if (!value) return [];
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

const PackageFormModal = ({ isOpen, onClose, pack, onSaved, currentLanguage = 'en', domain = 'fitness', t }) => {
  const tr = t || ((key) => getDashboardTranslation(domain, currentLanguage, key));
  const contentService = getContentService(domain);
  const isSquash = domain === 'squash';
  const [formData, setFormData] = useState(EMPTY_PACKAGE_FORM);
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
        price_egp_3m: pack.price_egp_3m ?? pack.priceEgp3m ?? '',
        price_usd_3m: pack.price_usd_3m ?? pack.priceUsd3m ?? '',
        price_egp_6m: pack.price_egp_6m ?? pack.priceEgp6m ?? '',
        price_usd_6m: pack.price_usd_6m ?? pack.priceUsd6m ?? '',
        duration_days: pack.duration_days ?? '',
        level: pack.level || 'beginner',
        type: pack.type || 'training',
        features_en: Array.isArray(pack.features_en) ? pack.features_en.join('\n') : (pack.features_en || ''),
        features_ar: Array.isArray(pack.features_ar) ? pack.features_ar.join('\n') : (pack.features_ar || ''),
        includes_video_feedback: Boolean(pack.includes_video_feedback),
        daily_support: Boolean(pack.daily_support),
        allow_1_month: (pack.allow_1_month ?? pack.allow1Month) !== false,
        allow_3_months: (pack.allow_3_months ?? pack.allow3Months) !== false,
        allow_6_months: (pack.allow_6_months ?? pack.allow6Months) !== false,
        is_active: (pack.is_active ?? pack.isActive) !== false,
      });
    } else {
      setFormData(EMPTY_PACKAGE_FORM);
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

    if (!formData.allow_1_month && !formData.allow_3_months && !formData.allow_6_months) {
      toastWarning(currentLanguage === 'ar' ? 'يجب تفعيل مدة اشتراك واحدة على الأقل' : 'At least one subscription duration must be enabled');
      return;
    }

    if (formData.allow_3_months && (!formData.price_egp_3m || !formData.price_usd_3m)) {
      toastWarning(
        currentLanguage === 'ar'
          ? 'يرجى إدخال سعر 3 أشهر بالجنيه والدولار'
          : 'Please enter both EGP and USD prices for the 3-month tier'
      );
      return;
    }

    if (formData.allow_6_months && (!formData.price_egp_6m || !formData.price_usd_6m)) {
      toastWarning(
        currentLanguage === 'ar'
          ? 'يرجى إدخال سعر 6 أشهر بالجنيه والدولار'
          : 'Please enter both EGP and USD prices for the 6-month tier'
      );
      return;
    }

    const payload = {
      name_en: formData.name_en,
      name_ar: formData.name_ar,
      description_en: formData.description_en,
      description_ar: formData.description_ar,
      price_egp: formData.price_egp ? Number(formData.price_egp) : null,
      price_usd: formData.price_usd ? Number(formData.price_usd) : null,
      priceEgp3m: formData.price_egp_3m ? Number(formData.price_egp_3m) : null,
      priceUsd3m: formData.price_usd_3m ? Number(formData.price_usd_3m) : null,
      priceEgp6m: formData.price_egp_6m ? Number(formData.price_egp_6m) : null,
      priceUsd6m: formData.price_usd_6m ? Number(formData.price_usd_6m) : null,
      duration_days: Number(formData.duration_days),
      level: formData.level,
      type: formData.type,
      features_en: splitFeaturesLines(formData.features_en),
      features_ar: splitFeaturesLines(formData.features_ar),
      includes_video_feedback: formData.includes_video_feedback,
      daily_support: formData.daily_support,
      allow1Month: formData.allow_1_month,
      allow3Months: formData.allow_3_months,
      allow6Months: formData.allow_6_months,
      ...(isSquash ? { is_active: formData.is_active } : {}),
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
      onSaved?.(saved ?? { ...payload, id: pack?.id }, { isCreate: !pack });
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

  const priceLabel = (tier) =>
    currentLanguage === 'ar' ? `السعر — ${tier}` : `Price — ${tier}`;

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
        <Input label={tr('package-form-duration')} type="number" min="1" name="duration_days" value={formData.duration_days} onChange={handleInputChange} required />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label={tr('package-form-level')} name="level" value={formData.level} onChange={handleInputChange} options={levelOptions} />
          <Select label={tr('package-form-type')} name="type" value={formData.type} onChange={handleInputChange} options={typeOptions} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            {currentLanguage === 'ar' ? 'مدد الاشتراك المتاحة' : 'Available Subscription Durations'}
          </p>
          <div className="flex flex-wrap gap-4 mb-4">
            <CheckboxField
              label={currentLanguage === 'ar' ? 'شهر واحد' : '1 Month'}
              name="allow_1_month"
              checked={formData.allow_1_month}
              onChange={handleInputChange}
            />
            <CheckboxField
              label={currentLanguage === 'ar' ? '3 أشهر' : '3 Months'}
              name="allow_3_months"
              checked={formData.allow_3_months}
              onChange={handleInputChange}
            />
            <CheckboxField
              label={currentLanguage === 'ar' ? '6 أشهر' : '6 Months'}
              name="allow_6_months"
              checked={formData.allow_6_months}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="space-y-4 rounded-lg border border-border/60 p-4">
          <p className="text-sm font-semibold text-gray-800">
            {currentLanguage === 'ar' ? 'الأسعار حسب المدة' : 'Pricing by Duration'}
          </p>
          {(formData.allow_1_month || (!formData.allow_3_months && !formData.allow_6_months)) && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">{priceLabel(currentLanguage === 'ar' ? 'شهر واحد' : '1 Month')}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label={tr('package-form-price-egp')} type="number" min="0" step="0.01" name="price_egp" value={formData.price_egp} onChange={handleInputChange} />
                <Input label={tr('package-form-price-usd')} type="number" min="0" step="0.01" name="price_usd" value={formData.price_usd} onChange={handleInputChange} />
              </div>
            </div>
          )}
          {formData.allow_3_months && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">{priceLabel(currentLanguage === 'ar' ? '3 أشهر' : '3 Months')}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label={tr('package-form-price-egp')} type="number" min="0" step="0.01" name="price_egp_3m" value={formData.price_egp_3m} onChange={handleInputChange} />
                <Input label={tr('package-form-price-usd')} type="number" min="0" step="0.01" name="price_usd_3m" value={formData.price_usd_3m} onChange={handleInputChange} />
              </div>
            </div>
          )}
          {formData.allow_6_months && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">{priceLabel(currentLanguage === 'ar' ? '6 أشهر' : '6 Months')}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label={tr('package-form-price-egp')} type="number" min="0" step="0.01" name="price_egp_6m" value={formData.price_egp_6m} onChange={handleInputChange} />
                <Input label={tr('package-form-price-usd')} type="number" min="0" step="0.01" name="price_usd_6m" value={formData.price_usd_6m} onChange={handleInputChange} />
              </div>
            </div>
          )}
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
        {isSquash && (
          <CheckboxField
            label={currentLanguage === 'ar' ? 'نشط' : 'Active'}
            name="is_active"
            checked={formData.is_active}
            onChange={handleInputChange}
          />
        )}
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
