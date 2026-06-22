import React from 'react';
import { getPackageDurationPrice } from '../lib/packageDurationPricing';

const CARD_SHADOW = '0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06)';
const CARD_SHADOW_HOVER = '0 20px 48px rgba(0, 0, 0, 0.14), 0 8px 16px rgba(0, 0, 0, 0.08)';

export function LandingPackageGrid({ children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
      {children}
    </div>
  );
}

export function LandingPackageCard({ children, isRTL, onMouseEnter, onMouseLeave }) {
  return (
    <article
      className="flex flex-col bg-[var(--color-surface)] rounded-2xl overflow-hidden border border-[var(--color-border)]/60 transition-all duration-300 hover:-translate-y-1.5"
      style={{ boxShadow: CARD_SHADOW }}
      dir={isRTL ? 'rtl' : 'ltr'}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = CARD_SHADOW_HOVER;
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = CARD_SHADOW;
        onMouseLeave?.(e);
      }}
    >
      {children}
    </article>
  );
}

export function LandingPackageHeader({ packageColor, isPlatinum, title, priceHtml, durationLabel }) {
  return (
    <header
      className={`relative ${packageColor.text} px-6 py-7 text-center overflow-hidden`}
      style={{
        background: `linear-gradient(135deg, ${packageColor.gradientFrom} 0%, ${packageColor.gradientTo} 100%)`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.06) 100%)',
        }}
        aria-hidden="true"
      />
      <div className="relative">
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-3 leading-snug">{title}</h3>
        <div
          className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 ${isPlatinum ? 'text-white' : ''}`}
          dangerouslySetInnerHTML={{ __html: priceHtml }}
        />
        {durationLabel && (
          <p className="text-sm font-medium opacity-90 tracking-wide">{durationLabel}</p>
        )}
      </div>
    </header>
  );
}

export function LandingPackageDescription({ children }) {
  if (!children) return null;
  return (
    <p className="text-[var(--color-text-muted)] text-sm leading-relaxed mb-4 line-clamp-3">
      {children}
    </p>
  );
}

export function LandingPackageFeatures({
  features,
  expanded,
  onToggle,
  isRTL,
  isAr,
  packageColor,
  maxCollapsed = 4,
}) {
  if (!features?.length) return null;

  const visible = expanded ? features : features.slice(0, maxCollapsed);
  const canExpand = features.length > maxCollapsed;

  return (
    <div className="px-6 pt-5 pb-1">
      <ul className="space-y-2.5">
        {visible.map((feature, idx) => (
          <li
            key={idx}
            className={`flex items-start gap-2.5 ${isRTL ? 'flex-row-reverse text-right' : ''}`}
          >
            <span className="text-[var(--color-text)] text-sm leading-relaxed flex-1">{feature}</span>
            <div className="flex-shrink-0 mt-0.5" style={{ color: packageColor.solid }}>
              <i className="fas fa-check-circle text-base" aria-hidden="true" />
            </div>
          </li>
        ))}
      </ul>
      {canExpand && (
        <button
          type="button"
          onClick={onToggle}
          className="mt-3 inline-flex items-center text-sm font-semibold transition-colors hover:opacity-80"
          style={{ color: packageColor.solid }}
          aria-expanded={expanded}
          aria-label={
            expanded
              ? isAr
                ? 'عرض أقل'
                : 'See Less'
              : isAr
                ? 'عرض المزيد'
                : 'See More'
          }
        >
          {expanded ? (isAr ? 'عرض أقل' : 'See Less') : isAr ? 'عرض المزيد' : 'See More'}
          <i
            className={`fas fa-chevron-${expanded ? 'up' : 'down'} ${isRTL ? 'mr-1.5' : 'ml-1.5'} text-xs`}
            aria-hidden="true"
          />
        </button>
      )}
    </div>
  );
}

export function LandingPackageDuration({
  isAr,
  pkg,
  availableDurations,
  selectedMonths,
  onSelect,
  packageColor,
  displayEgp,
  displayUsd,
  disabled,
}) {
  return (
    <div className="px-6 pt-4 pb-2 border-t border-[var(--color-border)]/80">
      <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-3">
        {isAr ? 'مدة الاشتراك' : 'Duration'}
      </p>
      {availableDurations.length > 1 ? (
        <div
          className="grid gap-2 mb-3"
          style={{ gridTemplateColumns: `repeat(${availableDurations.length}, minmax(0, 1fr))` }}
        >
          {availableDurations.map(({ months, labelEn, labelAr }) => {
            const isSelected = selectedMonths === months;
            const tierPrice = getPackageDurationPrice(pkg, months);
            const priceHint = tierPrice.egp
              ? `${tierPrice.egp.toLocaleString()} EGP`
              : tierPrice.usd
                ? `$${tierPrice.usd}`
                : null;
            return (
              <DurationTierButton
                key={months}
                months={months}
                label={isAr ? labelAr : labelEn}
                isSelected={isSelected}
                packageColor={packageColor}
                onSelect={onSelect}
                disabled={disabled}
                priceHint={priceHint}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-sm font-semibold mb-3" style={{ color: packageColor.solid }}>
          {isAr ? availableDurations[0]?.labelAr ?? 'شهر' : availableDurations[0]?.labelEn ?? '1 Mo'}
        </p>
      )}
      {(displayEgp || displayUsd) && (
        <p className="text-center text-xs font-semibold text-[var(--color-text-muted)]">
          {[displayEgp ? `${displayEgp.toLocaleString()} EGP` : null, displayUsd ? `${displayUsd} USD` : null]
            .filter(Boolean)
            .join(' / ')}
        </p>
      )}
    </div>
  );
}

export function DurationTierButton({
  months,
  label,
  priceHint,
  isSelected,
  packageColor,
  onSelect,
  disabled,
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(months)}
      disabled={disabled}
      aria-pressed={isSelected}
      style={
        isSelected
          ? {
              background: `linear-gradient(135deg, ${packageColor.gradientFrom}, ${packageColor.gradientTo})`,
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.15)',
              transform: 'scale(1.03)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }
          : {
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(0,0,0,0.1)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }
      }
      className={`py-2.5 rounded-xl text-xs font-bold leading-tight min-h-[44px] flex flex-col items-center justify-center gap-0.5 ${
        isSelected
          ? packageColor.text
          : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary-light)]'
      }`}
    >
      <span>{label}</span>
      {priceHint && (
        <span className={`text-[10px] font-semibold ${isSelected ? 'opacity-90' : 'opacity-70'}`}>
          {priceHint}
        </span>
      )}
    </button>
  );
}

export function LandingPackageSubscribeButton({
  packageColor,
  isSubscribed,
  loading,
  loadingLabel,
  label,
  onClick,
  disabled,
  'data-package-id': dataPackageId,
}) {
  return (
    <div className="px-6 pb-5 pt-3 mt-auto">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || loading}
        data-package-id={dataPackageId}
        className={`w-full ${packageColor.text} font-bold text-base transition-all duration-200 rounded-xl flex items-center justify-center gap-2 ${
          isSubscribed ? 'opacity-80' : ''
        }`}
        style={{
          minHeight: '48px',
          background: `linear-gradient(135deg, ${packageColor.gradientFrom}, ${packageColor.gradientTo})`,
          boxShadow: loading ? 'none' : '0 4px 14px rgba(0,0,0,0.15)',
          transform: 'translateY(0)',
        }}
        onMouseEnter={(e) => {
          if (!loading && !disabled) {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.22)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 14px rgba(0,0,0,0.15)';
        }}
      >
        {loading ? (
          <>
            <i className="fas fa-spinner fa-spin text-sm" aria-hidden="true" />
            {loadingLabel}
          </>
        ) : (
          label
        )}
      </button>
    </div>
  );
}

export const DURATION_OPTIONS = [
  { months: 1, labelEn: '1 Mo', labelAr: 'شهر' },
  { months: 3, labelEn: '3 Mo', labelAr: '3 أشهر' },
  { months: 6, labelEn: '6 Mo', labelAr: '6 أشهر' },
];

export function filterAvailableDurations(pkg) {
  return DURATION_OPTIONS.filter(({ months }) => {
    if (months === 1) return (pkg.allow_1_month ?? pkg.allow1Month) !== false;
    if (months === 3) return (pkg.allow_3_months ?? pkg.allow3Months) !== false;
    return (pkg.allow_6_months ?? pkg.allow6Months) !== false;
  });
}
