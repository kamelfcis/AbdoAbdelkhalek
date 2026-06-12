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

const LEVEL_VARIANT = {
  beginner: 'success',
  intermediate: 'default',
  advanced: 'warning',
  elite: 'destructive',
};

const LEVEL_LABEL_AR = {
  beginner: 'مبتدئ',
  intermediate: 'متوسط',
  advanced: 'متقدم',
  elite: 'نخبة',
};

const TYPE_VARIANT = {
  combined: 'default',
  training: 'secondary',
  nutrition: 'outline',
};

const TYPE_LABEL_AR = {
  combined: 'متكامل',
  training: 'تدريب',
  nutrition: 'تغذية',
};

function splitFeatureLines(text) {
  if (!text) return [];
  return text
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function getBilingualText(row, isAr, col) {
  const enKey = col?.fields?.[0] || 'description_en';
  const arKey = col?.fields?.[1] || 'description_ar';
  return isAr ? row[arKey] || row.description_ar : row[enKey] || row.description_en;
}

function getPublicBadgeVariant(isPublic) {
  return isPublic ? 'success' : 'destructive';
}

function getBooleanBadgeLabel(col, row, t, isAr) {
  const isTrue = Boolean(row[col.key]);
  if (col.key === 'is_public') {
    return isTrue ? t('filter-public') : t('filter-private');
  }
  if (col.key === 'is_active') {
    const activeLabel = isAr ? col.labelAr || t('th-active') : col.labelEn || t('th-active');
    const inactiveLabel = isAr ? 'غير نشط' : 'Inactive';
    return isTrue ? activeLabel : inactiveLabel;
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
          <Badge variant={variant}>{getBooleanBadgeLabel(col, row, t, isAr)}</Badge>
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

    case 'packageName': {
      const { primary, secondary } = getBilingualName(row, col, isAr);
      const descKey = isAr ? 'description_ar' : 'description_en';
      const desc = row[descKey] || row.description_ar || row.description_en;
      return (
        <div className="max-w-[220px] space-y-0.5 text-start" dir={isAr ? 'rtl' : 'ltr'}>
          <p className="font-semibold leading-tight">{primary || '—'}</p>
          {secondary && (
            <p className="text-xs text-muted-foreground">{secondary}</p>
          )}
          {desc && (
            <p className="line-clamp-2 text-xs text-muted-foreground/70 mt-1">{desc}</p>
          )}
        </div>
      );
    }

    case 'durationBadge': {
      const days = row[col.key];
      if (days == null || days === '') return <span className="block text-center">—</span>;
      const label = isAr ? `${days} يوم` : `${days} days`;
      return (
        <div className="text-center">
          <Badge variant="outline">{label}</Badge>
        </div>
      );
    }

    case 'levelBadge': {
      const level = row[col.key];
      if (!level) return <span className="block text-center">—</span>;
      const variant = LEVEL_VARIANT[level] || 'secondary';
      const label = isAr ? LEVEL_LABEL_AR[level] || level : level;
      return (
        <div className="text-center">
          <Badge variant={variant} className="capitalize">
            {label}
          </Badge>
        </div>
      );
    }

    case 'packageTypeFeatures': {
      const type = row.type;
      const typeVariant = TYPE_VARIANT[type] || 'secondary';
      const typeLabel = isAr ? TYPE_LABEL_AR[type] || type : type;

      const featLines = splitFeatureLines(isAr ? row.features_ar : row.features_en);
      const extraTags = [];
      if (row.includes_video_feedback) {
        extraTags.push(isAr ? 'يشمل تغذية بالفيديو' : 'Video feedback');
      }
      if (row.daily_support) {
        extraTags.push(isAr ? 'دعم يومي' : 'Daily support');
      }
      const allTags = [...featLines, ...extraTags];

      return (
        <div className="flex flex-col items-center gap-1 max-w-[180px] mx-auto" dir={isAr ? 'rtl' : 'ltr'}>
          {type && (
            <Badge variant={typeVariant} className="capitalize shrink-0">
              {typeLabel}
            </Badge>
          )}
          {allTags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1 mt-1">
              {allTags.map((tag, i) => (
                <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      );
    }

    case 'text':
    default: {
      const value = row[col.key] ?? '—';
      if (col.key === 'question_ar') {
        return (
          <span dir="rtl" className="block text-end">
            {value}
          </span>
        );
      }
      return <span className="block text-center">{value}</span>;
    }
  }
}
