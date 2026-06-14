import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { formatPrice } from '../lib/currency';
import { getTranslation } from '../../utils/translations';
import './package-details-modal.css';

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
}) => {
  const isAr = language === 'ar';
  const lang = isAr ? 'ar' : 'en';

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    },
    [onClose]
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

  const modalTitle = getTranslation('package-details-title', lang);

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
          onClick={onClose}
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
            <button
              type="button"
              onClick={onClose}
              className="package-details-modal__btn package-details-modal__btn--close-only"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>
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
};

export default PackageDetailsModal;
