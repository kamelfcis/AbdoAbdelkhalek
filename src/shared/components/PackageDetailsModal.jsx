import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { formatPrice } from '../lib/currency';
import { getTranslation } from '../../utils/translations';
import './package-details-modal.css';

function formatAmount(value) {
  if (value == null || value === '') return '';
  const num = Number(value);
  if (!Number.isNaN(num)) return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return String(value);
}

const LEVEL_KEYS = {
  beginner: 'level-beginner',
  intermediate: 'level-intermediate',
  advanced: 'level-advanced',
  elite: 'level-elite',
};

const TYPE_KEYS = {
  training: 'type-training',
  nutrition: 'type-nutrition',
  combined: 'type-combined',
};

function formatPackageMetaValue(rawValue, keyMap, lang) {
  if (rawValue == null || rawValue === '') return null;
  const normalized = String(rawValue).trim().toLowerCase();
  const translationKey = keyMap[normalized];
  if (translationKey) {
    return getTranslation(translationKey, lang);
  }
  return String(rawValue).trim();
}

const DURATION_OPTIONS = [
  { months: 1, labelEn: '1 Month', labelAr: 'شهر واحد' },
  { months: 3, labelEn: '3 Months', labelAr: '3 أشهر' },
  { months: 6, labelEn: '6 Months', labelAr: '6 أشهر' },
];

const PackageDetailsModal = ({
  isOpen,
  onClose,
  pkg,
  packageName,
  description,
  features = [],
  packageColor,
  domain = 'fitness',
  language = 'en',
  isRTL = false,
  confirmingSubscription = false,
  subscribing = false,
  onConfirm,
  selectedDurationMonths = 1,
  onDurationChange,
}) => {
  const isAr = language === 'ar';
  const lang = isAr ? 'ar' : 'en';

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && !subscribing) {
        onClose?.();
      }
    },
    [onClose, subscribing]
  );

  useEffect(() => {
    if (!isOpen) return undefined;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !pkg) return null;

  const modalTitle = confirmingSubscription
    ? isAr
      ? 'تأكيد الاشتراك'
      : 'Confirm Subscription'
    : getTranslation('package-details-title', lang);

  const heroStyle = packageColor
    ? {
        background: `linear-gradient(135deg, ${packageColor.gradientFrom}, ${packageColor.gradientTo})`,
      }
    : undefined;

  const heroTextClass = packageColor?.text === 'text-gray-900' ? 'text-gray-900' : 'text-white';
  const levelValue = formatPackageMetaValue(pkg.level, LEVEL_KEYS, lang);
  const typeValue = formatPackageMetaValue(pkg.type, TYPE_KEYS, lang);
  const showMetaGrid = Boolean(levelValue || typeValue);

  return createPortal(
    <div
      className="package-details-modal"
      data-domain={domain}
      dir={isRTL ? 'rtl' : 'ltr'}
      role="presentation"
    >
      <div
        className="package-details-modal__backdrop"
        onClick={subscribing ? undefined : onClose}
      >
        <div
          className="package-details-modal__dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="package-modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={`package-details-modal__hero ${heroTextClass}`}
            style={heroStyle}
          >
            <div className="package-details-modal__hero-top">
              <div>
                <p className="package-details-modal__eyebrow">{modalTitle}</p>
                <h2 id="package-modal-title" className="package-details-modal__title">
                  {packageName}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={subscribing}
                className="package-details-modal__close"
                aria-label={isAr ? 'إغلاق' : 'Close'}
              >
                <i className="fas fa-times" aria-hidden="true" />
              </button>
            </div>
            <div className="package-details-modal__price-row">
              <div
                className="package-details-modal__price"
                dangerouslySetInnerHTML={{
                  __html: formatPrice(pkg.price_egp, pkg.price_usd),
                }}
              />
              {pkg.duration_days != null && (
                <span className="package-details-modal__duration-badge">
                  <i className="fas fa-calendar-alt" aria-hidden="true" />
                  {pkg.duration_days} {getTranslation('days-label', lang)}
                </span>
              )}
            </div>
          </div>

          <div className="package-details-modal__body">
            {confirmingSubscription && (
              <div className="package-details-modal__duration-picker">
                <p className="package-details-modal__duration-label">
                  {isAr ? 'اختر مدة الاشتراك' : 'Choose subscription duration'}
                </p>
                <div className="package-details-modal__duration-options">
                  {DURATION_OPTIONS.map(({ months, labelEn, labelAr }) => {
                    const multiplier = months;
                    const totalEgp = pkg.price_egp != null ? Number(pkg.price_egp) * multiplier : null;
                    const totalUsd = pkg.price_usd != null ? Number(pkg.price_usd) * multiplier : null;
                    const isSelected = selectedDurationMonths === months;
                    return (
                      <button
                        key={months}
                        type="button"
                        className={`package-details-modal__duration-card${isSelected ? ' package-details-modal__duration-card--selected' : ''}`}
                        onClick={() => onDurationChange?.(months)}
                        disabled={subscribing}
                        aria-pressed={isSelected}
                      >
                        <span className="package-details-modal__duration-card-title">
                          {isAr ? labelAr : labelEn}
                        </span>
                        <span
                          className="package-details-modal__duration-card-price"
                          dangerouslySetInnerHTML={{ __html: formatPrice(totalEgp, totalUsd) }}
                        />
                        {months > 1 && (
                          <span className="package-details-modal__duration-card-rate">
                            {isAr
                              ? `${formatAmount(pkg.price_egp)} EGP / شهر`
                              : `${formatAmount(pkg.price_egp)} EGP / mo`}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {showMetaGrid && (
              <div className="package-details-modal__meta-grid">
                {levelValue && (
                  <div className="package-details-modal__meta-card">
                    <span className="package-details-modal__meta-label">
                      {getTranslation('level-label', lang)}
                    </span>
                    <span className="package-details-modal__meta-value">{levelValue}</span>
                  </div>
                )}
                {typeValue && (
                  <div className="package-details-modal__meta-card">
                    <span className="package-details-modal__meta-label">
                      {getTranslation('type-label', lang)}
                    </span>
                    <span className="package-details-modal__meta-value">{typeValue}</span>
                  </div>
                )}
              </div>
            )}

            {description && (
              <p className="package-details-modal__description">{description}</p>
            )}

            {features.length > 0 && (
              <>
                <h3 className="package-details-modal__section-title">
                  {isAr ? 'المميزات' : 'Features'}
                </h3>
                <ul className="package-details-modal__features">
                  {features.map((feature, idx) => (
                    <li key={idx} className="package-details-modal__feature">
                      <i className="fas fa-check-circle" aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="package-details-modal__perks">
              <div className="package-details-modal__perk">
                <i className="fas fa-video" aria-hidden="true" />
                <span>{getTranslation('includes-video-feedback', lang)}</span>
                <span
                  className={`package-details-modal__perk-value ${
                    pkg.includes_video_feedback
                      ? 'package-details-modal__perk-value--yes'
                      : 'package-details-modal__perk-value--no'
                  }`}
                >
                  {pkg.includes_video_feedback ? (isAr ? 'نعم' : 'Yes') : isAr ? 'لا' : 'No'}
                </span>
              </div>
              <div className="package-details-modal__perk">
                <i className="fas fa-headset" aria-hidden="true" />
                <span>{getTranslation('daily-support', lang)}</span>
                <span
                  className={`package-details-modal__perk-value ${
                    pkg.daily_support
                      ? 'package-details-modal__perk-value--yes'
                      : 'package-details-modal__perk-value--no'
                  }`}
                >
                  {pkg.daily_support ? (isAr ? 'نعم' : 'Yes') : isAr ? 'لا' : 'No'}
                </span>
              </div>
            </div>
          </div>

          <div className="package-details-modal__footer">
            {confirmingSubscription ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={subscribing}
                  className="package-details-modal__btn package-details-modal__btn--cancel"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={subscribing}
                  className="package-details-modal__btn package-details-modal__btn--confirm"
                >
                  {subscribing ? (
                    <>
                      <i className="fas fa-spinner fa-spin" aria-hidden="true" />
                      {isAr ? 'جاري الاشتراك...' : 'Subscribing...'}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check" aria-hidden="true" />
                      {isAr ? 'تأكيد الاشتراك' : 'Confirm Subscription'}
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="package-details-modal__btn package-details-modal__btn--close-only"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

PackageDetailsModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  pkg: PropTypes.object,
  packageName: PropTypes.string,
  description: PropTypes.string,
  features: PropTypes.arrayOf(PropTypes.string),
  packageColor: PropTypes.shape({
    gradientFrom: PropTypes.string,
    gradientTo: PropTypes.string,
    solid: PropTypes.string,
    text: PropTypes.string,
  }),
  domain: PropTypes.oneOf(['fitness', 'squash']),
  language: PropTypes.oneOf(['en', 'ar']),
  isRTL: PropTypes.bool,
  confirmingSubscription: PropTypes.bool,
  subscribing: PropTypes.bool,
  onConfirm: PropTypes.func,
  selectedDurationMonths: PropTypes.oneOf([1, 3, 6]),
  onDurationChange: PropTypes.func,
};

export default PackageDetailsModal;
