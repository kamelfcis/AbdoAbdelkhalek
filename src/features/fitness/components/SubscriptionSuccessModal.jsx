import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../shared/ui/Modal';

const COACH_WHATSAPP = '201123903411';

const SubscriptionSuccessModal = ({
  isOpen,
  onClose,
  packageName,
  durationMonths,
  coachWhatsapp = COACH_WHATSAPP,
  coachEmail,
  currentLanguage = 'en',
}) => {
  const isAr = currentLanguage === 'ar';
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => setAnimate(true), 80);
      return () => clearTimeout(t);
    } else {
      setAnimate(false);
    }
  }, [isOpen]);

  const durationLabel = isAr
    ? durationMonths === 1
      ? 'شهر واحد'
      : `${durationMonths} أشهر`
    : durationMonths === 1
    ? '1 Month'
    : `${durationMonths} Months`;

  const headline = isAr ? 'تم الاشتراك بنجاح! 🎉' : 'Successfully Subscribed! 🎉';
  const subText = isAr
    ? `أنت مشترك الآن في ${packageName} لمدة ${durationLabel}. سيتواصل معك مدربك قريبًا.`
    : `You're now subscribed to ${packageName} for ${durationLabel}. Your coach will be in touch with you soon.`;
  const contactTitle = isAr ? 'تواصل مع مدربك' : 'Contact Your Coach';
  const whatsappLabel = isAr ? 'واتساب' : 'WhatsApp';
  const emailLabel = isAr ? 'البريد الإلكتروني' : 'Email';
  const doneLabel = isAr ? 'تم' : 'Done';

  const CIRCUMFERENCE = 2 * Math.PI * 38;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeOnOverlay
      className="border border-white/10 !bg-[#0d1f14] overflow-visible"
      contentClassName="!p-0"
    >
      <div
        className="flex flex-col items-center text-center px-6 pt-8 pb-6"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Animated checkmark */}
        <div className="relative mb-6">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(22,163,74,0.25) 0%, transparent 70%)',
              transform: 'scale(1.6)',
            }}
          />
          <svg
            width="96"
            height="96"
            viewBox="0 0 96 96"
            fill="none"
            aria-hidden="true"
            className="relative z-10"
          >
            {/* Background circle */}
            <circle cx="48" cy="48" r="44" fill="rgba(22,163,74,0.12)" stroke="rgba(22,163,74,0.3)" strokeWidth="1.5" />
            {/* Animated track circle */}
            <circle
              cx="48"
              cy="48"
              r="38"
              fill="none"
              stroke="#16a34a"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={animate ? 0 : CIRCUMFERENCE}
              style={{
                transformOrigin: '48px 48px',
                transform: 'rotate(-90deg)',
                transition: animate
                  ? 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                  : 'none',
              }}
            />
            {/* Checkmark */}
            <polyline
              points="28,50 42,64 68,34"
              fill="none"
              stroke="#4ade80"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="60"
              strokeDashoffset={animate ? 0 : 60}
              style={{
                transition: animate
                  ? 'stroke-dashoffset 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.45s'
                  : 'none',
              }}
            />
          </svg>
        </div>

        {/* Headline */}
        <h2
          className="text-2xl font-bold mb-3 leading-tight"
          style={{ color: '#dcfce7' }}
        >
          {headline}
        </h2>

        {/* Sub-text */}
        <p className="text-sm leading-relaxed mb-6" style={{ color: '#86efac' }}>
          {subText}
        </p>

        {/* Contact section */}
        {(coachWhatsapp || coachEmail) && (
          <div className="w-full mb-6">
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: '#4ade80' }}
            >
              {contactTitle}
            </p>
            <div className="flex flex-col gap-2">
              {coachWhatsapp && (
                <a
                  href={`https://wa.me/${coachWhatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                    color: '#fff',
                    boxShadow: '0 4px 16px rgba(22,163,74,0.3)',
                  }}
                >
                  <i className="fab fa-whatsapp text-lg" aria-hidden="true" />
                  {whatsappLabel}
                </a>
              )}
              {coachEmail && (
                <a
                  href={`mailto:${coachEmail}`}
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#86efac',
                  }}
                >
                  <i className="fas fa-envelope" aria-hidden="true" />
                  {emailLabel}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Done button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 px-6 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 hover:brightness-110"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#dcfce7',
          }}
        >
          {doneLabel}
        </button>
      </div>
    </Modal>
  );
};

SubscriptionSuccessModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  packageName: PropTypes.string,
  durationMonths: PropTypes.number,
  coachWhatsapp: PropTypes.string,
  coachEmail: PropTypes.string,
  currentLanguage: PropTypes.string,
};

export default SubscriptionSuccessModal;
