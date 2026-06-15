import React from 'react';
import { dashTemplate } from '../utils/dashTemplate';
import { getPaginationWindow } from './paginationWindow';

export function EntityPaginationBar({
  t,
  isRTL,
  page,
  pageCount,
  total,
  pageSize,
  onPageChange,
  emptyKey = 'videos-filter-empty',
  showingKey,
  pageOfKey = 'videos-page-of',
}) {
  if (!total) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const showingTemplateKey = showingKey || (isRTL ? 'videos-showing-ar' : 'videos-showing');

  const summary = dashTemplate(t(showingTemplateKey), { start, end, total });
  const pageLabel = dashTemplate(t(pageOfKey), { page, total: pageCount });
  const pageWindow = getPaginationWindow(page, pageCount);

  const ghostBtnClass =
    'min-w-[2.25rem] px-3 py-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-bg-muted)]';
  const activeBtnClass =
    'min-w-[2.25rem] px-3 py-1 rounded-lg border bg-[var(--color-primary)] text-white border-[var(--color-primary)]';

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 mt-4">
      <p className="text-sm text-[var(--color-text-muted)]">{summary}</p>
      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className={`px-3 py-1 rounded-lg border border-[var(--color-border)] ${page === 1 ? 'bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] cursor-not-allowed' : 'bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-bg-muted)]'}`}
        >
          {t('btn-prev')}
        </button>

        <nav className="flex items-center gap-1" aria-label={pageLabel}>
          {pageWindow.map((item, index) => {
            if (item === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-1 text-sm text-[var(--color-text-muted)] select-none"
                  aria-hidden="true"
                >
                  …
                </span>
              );
            }

            const isActive = item === page;
            const ariaLabel = isActive
              ? dashTemplate(t('pagination-current-page'), { page: item })
              : dashTemplate(t('pagination-page'), { page: item });

            return (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                disabled={isActive}
                aria-label={ariaLabel}
                aria-current={isActive ? 'page' : undefined}
                className={isActive ? activeBtnClass : ghostBtnClass}
              >
                {item}
              </button>
            );
          })}
        </nav>

        <span className="text-sm text-[var(--color-text-muted)]">{pageLabel}</span>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(pageCount, page + 1))}
          disabled={page >= pageCount}
          className={`px-3 py-1 rounded-lg border border-[var(--color-border)] ${page >= pageCount ? 'bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] cursor-not-allowed' : 'bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-bg-muted)]'}`}
        >
          {t('btn-next')}
        </button>
      </div>
    </div>
  );
}
