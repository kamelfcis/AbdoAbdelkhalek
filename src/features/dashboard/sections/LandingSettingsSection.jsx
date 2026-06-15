import React, { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDashboardCoach } from '../context/DashboardCoachContext';
import { useLandingSections } from '../../../shared/hooks/useLandingSections';
import { getLandingSectionsForDomain, isSectionVisible } from '../../../shared/config/landingSections';
import { Card, ToggleSwitch, toastSuccess, toastError, SkeletonGroup } from '../../../shared/ui';
import { loadFontAwesome } from '../../../shared/lib/fontAwesomeLoader';

export function LandingSettingsSection() {
  const { adminDomain, t, isRTL } = useDashboardCoach();
  const sectionDefs = getLandingSectionsForDomain(adminDomain);
  const { sections, isLoading, isError, toggleSectionAsync, isToggling, togglingKey } =
    useLandingSections(adminDomain, { coachMode: true });

  React.useEffect(() => {
    loadFontAwesome({ priority: 'low' }).catch(() => {});
  }, []);

  const visibleCount = useMemo(
    () => sectionDefs.filter((def) => isSectionVisible(sections, def.key)).length,
    [sectionDefs, sections]
  );

  const previewPath = adminDomain === 'squash' ? '/squash' : '/fitness';

  const handleToggle = useCallback(
    async (key, nextVisible) => {
      try {
        await toggleSectionAsync({ key, visible: nextVisible });
        toastSuccess(t('landing-settings-saved'));
      } catch (err) {
        toastError(err.message || t('landing-settings-save-error'));
      }
    },
    [toggleSectionAsync, t]
  );

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        {t('landing-settings-load-error')}
      </div>
    );
  }

  return (
    <div className="space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-primary-light)]/30 via-white to-[var(--color-primary)]/10 p-6 md:p-8 ring-1 ring-[var(--color-primary)]/20">
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text)]">{t('page-landing-settings')}</h2>
            <p className="mt-2 text-[var(--color-text-muted)] max-w-xl">{t('landing-settings-subtitle')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-[var(--color-surface)]/80 px-4 py-1.5 text-sm font-semibold text-[var(--color-primary)] shadow-sm ring-1 ring-[var(--color-primary)]/20">
              {t('landing-settings-visible-count')
                .replace('{{visible}}', String(visibleCount))
                .replace('{{total}}', String(sectionDefs.length))}
            </span>
            <Link
              to={previewPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] px-5 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-shadow"
            >
              <i className="fas fa-external-link-alt" aria-hidden="true" />
              {t('landing-settings-preview')}
            </Link>
          </div>
        </div>
      </div>

      {isLoading ? (
        <SkeletonGroup count={6} className="grid grid-cols-1 md:grid-cols-2 gap-4" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sectionDefs.map((def) => {
            const visible = isSectionVisible(sections, def.key);
            const busy = isToggling && togglingKey === def.key;
            return (
              <Card
                key={def.key}
                variant="elevated"
                className="rounded-2xl ring-1 ring-gray-100 hover:ring-[var(--color-primary)]/30 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary)] text-white shadow-md">
                      <i className={`fas fa-${def.icon}`} aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[var(--color-text)]">{t(def.labelKey)}</h3>
                      <p className="mt-1 text-sm text-[var(--color-text-muted)] leading-relaxed">{t(def.descKey)}</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={visible}
                    disabled={busy}
                    onChange={(next) => handleToggle(def.key, next)}
                    aria-label={t(def.labelKey)}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LandingSettingsSection;
