import React from 'react';
import { dashTemplate } from '../utils/dashTemplate';

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

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 mt-4">
      <p className="text-sm text-gray-500">{summary}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className={`px-3 py-1 rounded-lg border ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
        >
          {t('btn-prev')}
        </button>
        <span className="text-sm text-gray-600">{pageLabel}</span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(pageCount, page + 1))}
          disabled={page >= pageCount}
          className={`px-3 py-1 rounded-lg border ${page >= pageCount ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
        >
          {t('btn-next')}
        </button>
      </div>
    </div>
  );
}
