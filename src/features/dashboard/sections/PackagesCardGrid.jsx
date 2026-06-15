import React from 'react';
import { Button } from 'components/ui/button';
import { Badge } from 'components/ui/badge';
import { cn } from 'lib/utils';
import { EmptyState } from '../../../shared/ui';
import { CardGridSkeleton } from '../../fitness/components/Skeletons';
import { getPackageDurationPrice } from '../../../shared/lib/packageDurationPricing';

const LEVEL_VARIANT = {
  beginner: 'secondary',
  intermediate: 'default',
  advanced: 'destructive',
  elite: 'outline',
};

function parseFeatures(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  return raw
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function getSubscriptionDurationFlags(pkg) {
  return {
    allow1Month: (pkg.allow_1_month ?? pkg.allow1Month) !== false,
    allow3Months: (pkg.allow_3_months ?? pkg.allow3Months) !== false,
    allow6Months: (pkg.allow_6_months ?? pkg.allow6Months) !== false,
  };
}

function PackageCard({ pkg, isAr, t, onEdit, onDelete, isMutating, priority = false }) {
  const tr = typeof t === 'function' ? t : (key) => key;
  const nameMain = isAr ? pkg.name_ar || pkg.name_en : pkg.name_en || pkg.name_ar;
  const nameAlt = isAr ? pkg.name_en : pkg.name_ar;
  const features = parseFeatures(isAr ? pkg.features_ar || pkg.features_en : pkg.features_en || pkg.features_ar).slice(0, 3);

  const level = pkg.level || '';
  const type = pkg.type || '';
  const durationDays = pkg.duration_days != null ? Number(pkg.duration_days) : null;
  const { allow1Month, allow3Months, allow6Months } = getSubscriptionDurationFlags(pkg);

  const tierPrices = [];
  if (allow1Month) {
    const { egp, usd } = getPackageDurationPrice(pkg, 1);
    if (egp != null && egp > 0) tierPrices.push(`1mo: ${egp.toLocaleString()} EGP`);
    else if (usd != null && usd > 0) tierPrices.push(`1mo: $${usd} USD`);
  }
  if (allow3Months) {
    const { egp, usd } = getPackageDurationPrice(pkg, 3);
    if (egp != null && egp > 0) tierPrices.push(`3mo: ${egp.toLocaleString()} EGP`);
    else if (usd != null && usd > 0) tierPrices.push(`3mo: $${usd} USD`);
  }
  if (allow6Months) {
    const { egp, usd } = getPackageDurationPrice(pkg, 6);
    if (egp != null && egp > 0) tierPrices.push(`6mo: ${egp.toLocaleString()} EGP`);
    else if (usd != null && usd > 0) tierPrices.push(`6mo: $${usd} USD`);
  }
  const priceEgp = pkg.price_egp != null ? Number(pkg.price_egp) : null;
  const priceUsd = pkg.price_usd != null ? Number(pkg.price_usd) : null;

  const typeLabel =
    type === 'training'
      ? tr('pkg-type-training') || 'Training'
      : type === 'nutrition'
      ? tr('pkg-type-nutrition') || 'Nutrition'
      : type === 'combined'
      ? tr('pkg-type-combined') || 'Combined'
      : type;

  const levelLabel =
    level === 'beginner'
      ? tr('pkg-level-beginner') || 'Beginner'
      : level === 'intermediate'
      ? tr('pkg-level-intermediate') || 'Intermediate'
      : level === 'advanced'
      ? tr('pkg-level-advanced') || 'Advanced'
      : level === 'elite'
      ? tr('pkg-level-elite') || 'Elite'
      : level;

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm',
        'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/40'
      )}
    >
      {/* Gradient header */}
      <div className="relative bg-gradient-to-br from-primary to-primary/70 px-4 py-4 text-primary-foreground">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold leading-tight" dir="auto">
              {nameMain || '—'}
            </h3>
            {nameAlt && nameAlt !== nameMain && (
              <p className="mt-0.5 truncate text-xs opacity-80" dir="auto">
                {nameAlt}
              </p>
            )}
          </div>
          {/* Duration pill */}
          {durationDays != null && (
            <span className="shrink-0 rounded-full bg-[var(--color-surface)]/20 px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap">
              {durationDays}d
            </span>
          )}
        </div>

        {/* Type + Level badges */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {type && (
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold',
                'bg-[var(--color-surface)]/20 text-white'
              )}
            >
              {typeLabel}
            </span>
          )}
          {level && (
            <Badge variant={LEVEL_VARIANT[level] || 'secondary'} className="text-[10px]">
              {levelLabel}
            </Badge>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col px-4 py-3">
        {/* Pricing row */}
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1">
          {priceEgp != null && priceEgp > 0 && (
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold text-foreground">{priceEgp.toLocaleString()} EGP</span>
            </div>
          )}
          {priceUsd != null && priceUsd > 0 && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-medium text-muted-foreground">${priceUsd} USD</span>
            </div>
          )}
        </div>

        {/* Duration line */}
        {durationDays != null && (
          <div className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
            <i className="fas fa-calendar-alt text-primary/70" aria-hidden="true" />
            <span>
              {durationDays} {tr('pkg-days') || 'days'}
            </span>
          </div>
        )}

        {/* Features */}
        {features.length > 0 && (
          <ul className="mb-4 space-y-1.5" aria-label={tr('pkg-features') || 'Features'}>
            {features.map((feat, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <i className="fas fa-check-circle mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                <span className="line-clamp-2" dir="auto">{feat}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Subscription duration badges */}
        {(allow1Month || allow3Months || allow6Months) && (
          <div className="mb-2 flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-1">
              {allow1Month && (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  1mo
                </span>
              )}
              {allow3Months && (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  3mo
                </span>
              )}
              {allow6Months && (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  6mo
                </span>
              )}
            </div>
            {tierPrices.length > 0 && (
              <p className="text-[11px] text-muted-foreground" dir="ltr">{tierPrices.join(' · ')}</p>
            )}
          </div>
        )}

        {/* Extra boolean badges */}
        <div className="mt-auto flex flex-wrap gap-1.5 pb-1">
          {pkg.includes_video_feedback && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-info)]/15 px-2 py-0.5 text-[10px] font-medium text-[var(--color-info)]">
              <i className="fas fa-video" aria-hidden="true" />
              {tr('pkg-video-feedback') || 'Video Feedback'}
            </span>
          )}
          {pkg.daily_support && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-success)]/15 px-2 py-0.5 text-[10px] font-medium text-[var(--color-success)]">
              <i className="fas fa-headset" aria-hidden="true" />
              {tr('pkg-daily-support') || 'Daily Support'}
            </span>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-2 border-t border-border/60 px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(pkg)}
          aria-label={tr('btn-edit')}
          disabled={isMutating}
          className="h-8 w-8 touch-manipulation"
        >
          <i className="fas fa-edit text-primary" aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(pkg.id)}
          aria-label={tr('btn-delete')}
          disabled={isMutating}
          className="h-8 w-8 touch-manipulation"
        >
          <i className="fas fa-trash text-destructive" aria-hidden="true" />
        </Button>
      </div>
    </article>
  );
}

export function PackagesCardGrid({
  packages,
  isAr,
  t,
  isLoading,
  isMutating = false,
  onEdit,
  onDelete,
  emptyTitle,
  emptyDescription,
}) {
  if (isLoading && packages.length === 0) {
    return <CardGridSkeleton count={6} />;
  }

  if (!packages.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div
      className={cn('relative transition-opacity', isMutating && 'pointer-events-none opacity-60')}
      aria-busy={isMutating}
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {packages.map((pkg, index) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            isAr={isAr}
            t={t}
            onEdit={onEdit}
            onDelete={onDelete}
            isMutating={isMutating}
            priority={index < 3}
          />
        ))}
      </div>
    </div>
  );
}
