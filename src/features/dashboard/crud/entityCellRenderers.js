import React from 'react';
import { Badge } from 'components/ui/badge';
import DashboardThumb from '../../../shared/ui/DashboardThumb';
import { getEntityThumbSrc, getSuccessStoryThumbSrc, TABLE_THUMB } from './entityImageUtils';

export function getBilingualName(row, col, isAr) {
  const enKey = col.fields?.[0] || 'name_en';
  const arKey = col.fields?.[1] || 'name_ar';
  const en = row[enKey] || row.title_en;
  const ar = row[arKey] || row.title_ar;
  return {
    primary: isAr ? ar || en : en || ar,
    secondary: isAr ? en : ar,
  };
}

export function getBilingualText(row, isAr, col) {
  const enKey = col?.fields?.[0] || 'description_en';
  const arKey = col?.fields?.[1] || 'description_ar';
  return isAr ? row[arKey] || row.description_ar : row[enKey] || row.description_en;
}

function getPublicBadgeVariant(isPublic) {
  return isPublic ? 'success' : 'destructive';
}

function getBooleanBadgeLabel(col, row, t) {
  const isTrue = Boolean(row[col.key]);
  if (col.key === 'is_public') {
    return isTrue ? t('filter-public') : t('filter-private');
  }
  return isTrue ? t('yes') : t('no');
}

export function renderCell(col, row, { isAr, t, domain = 'fitness', rowIndex = 0 }) {
  switch (col.type) {
    case 'bilingualName': {
      const { primary } = getBilingualName(row, col, isAr);
      return <p className="font-semibold text-center">{primary || '—'}</p>;
    }

    case 'bilingualText': {
      const text = getBilingualText(row, isAr, col);
      return (
        <p className="mx-auto max-w-[260px] text-center text-sm text-muted-foreground line-clamp-2">
          {text || '—'}
        </p>
      );
    }

    case 'booleanBadge': {
      const isTrue = Boolean(row[col.key]);
      const variant = col.key === 'is_public' ? getPublicBadgeVariant(isTrue) : isTrue ? 'success' : 'destructive';
      return (
        <div className="text-center">
          <Badge variant={variant}>{getBooleanBadgeLabel(col, row, t)}</Badge>
        </div>
      );
    }

    case 'imageThumb': {
      const { src, fallbackSrc } = getEntityThumbSrc(row, col, domain, 'table');
      if (!src) {
        return <span className="text-muted-foreground">—</span>;
      }
      return (
        <DashboardThumb
          src={src}
          fallbackSrc={fallbackSrc}
          alt=""
          width={TABLE_THUMB.height}
          height={TABLE_THUMB.height}
          className="mx-auto shrink-0 rounded-md"
          priority={rowIndex < 5}
        />
      );
    }

    case 'successStoryImage': {
      const side = col.side === 'after' ? 'after' : 'before';
      const { src, fallbackSrc } = getSuccessStoryThumbSrc(row, side, domain, 'table');
      if (!src) {
        return <span className="text-muted-foreground">—</span>;
      }
      return (
        <DashboardThumb
          src={src}
          fallbackSrc={fallbackSrc}
          alt=""
          width={TABLE_THUMB.height}
          height={TABLE_THUMB.height}
          className="mx-auto shrink-0 rounded-md"
          priority={rowIndex < 5}
        />
      );
    }

    case 'text':
    default:
      return <span className="block text-center">{row[col.key] ?? '—'}</span>;
  }
}
