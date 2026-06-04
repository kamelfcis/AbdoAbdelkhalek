import React from 'react';
import { Badge } from 'components/ui/badge';
import { Button } from 'components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from 'components/ui/card';
import { AspectRatio } from 'components/ui/aspect-ratio';
import { cn } from 'lib/utils';
import { EmptyState } from '../../../shared/ui';
import DashboardThumb from '../../../shared/ui/DashboardThumb';
import { CardGridSkeleton } from '../../fitness/components/Skeletons';
import { getBilingualName, getBilingualText } from './entityCellRenderers';
import { CARD_THUMB, getEntityThumbSrc } from './entityImageUtils';

function getCardTitle(row, config, nameCol, isAr, tr) {
  if (nameCol) return getBilingualName(row, nameCol, isAr);
  const meta = config?.cardMeta;
  if (meta?.labelKey) {
    const label = tr(meta.labelKey);
    const val = meta.field != null ? row[meta.field] : null;
    return {
      primary: val != null && val !== '' ? `${label} #${val}` : label,
      secondary: null,
    };
  }
  return { primary: row.name_en || row.title_en || '—', secondary: null };
}

function EntityCard({
  row,
  config,
  isAr,
  t,
  domain,
  onEdit,
  onDelete,
  actionsExtra,
  isMutating,
  priority = false,
}) {
  const tr = typeof t === 'function' ? t : (key) => key;
  const columns = config?.columns || [];

  const nameCol = columns.find((c) => c.type === 'bilingualName');
  const descCol = columns.find((c) => c.type === 'bilingualText');
  const imageCol = columns.find((c) => c.type === 'imageThumb');
  const badgeCols = columns.filter((c) => c.type === 'booleanBadge');

  const { primary, secondary } = getCardTitle(row, config, nameCol, isAr, tr);

  const description = descCol ? getBilingualText(row, isAr, descCol) : null;

  const { src, fallbackSrc } = imageCol
    ? getEntityThumbSrc(row, imageCol, domain, 'card')
    : { src: null, fallbackSrc: null };

  return (
    <Card
      className={cn(
        'group overflow-hidden transition-all duration-300',
        'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md'
      )}
    >
      {src && (
        <AspectRatio ratio={16 / 9} className="overflow-hidden bg-muted">
          <DashboardThumb
            src={src}
            fallbackSrc={fallbackSrc}
            alt=""
            width={CARD_THUMB.width}
            height={CARD_THUMB.height}
            priority={priority}
            className="h-full w-full"
            imgClassName="transition-transform duration-500 group-hover:scale-105"
          />
        </AspectRatio>
      )}

      <CardHeader className={cn('gap-3', src ? 'pt-4' : undefined)}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="truncate text-base">{primary}</CardTitle>
            {secondary && secondary !== primary && (
              <CardDescription className="truncate" dir="auto">
                {secondary}
              </CardDescription>
            )}
          </div>
          <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
            {badgeCols.map((col) => {
              const isTrue = Boolean(row[col.key]);
              let label;
              let variant = isTrue ? 'success' : 'destructive';
              if (col.key === 'is_public') {
                label = isTrue ? tr('filter-public') : tr('filter-private');
              } else if (col.labelEn || col.labelAr) {
                const fieldLabel = isAr ? col.labelAr || col.labelEn : col.labelEn;
                label = `${fieldLabel}: ${isTrue ? tr('yes') : tr('no')}`;
                variant = isTrue ? 'success' : 'secondary';
              } else {
                label = isTrue ? tr('yes') : tr('no');
              }
              return (
                <Badge key={col.key} variant={variant} className="text-[10px]">
                  {label}
                </Badge>
              );
            })}
          </div>
        </div>
      </CardHeader>

      {description && (
        <CardContent className="pt-0">
          <p className="line-clamp-3 text-sm text-muted-foreground">{description}</p>
        </CardContent>
      )}

      <CardFooter className="mt-auto gap-2 border-t border-border/60 pt-4">
        <div className="ml-auto flex items-center gap-2">
          {actionsExtra?.(row)}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row)}
            aria-label={tr('btn-edit')}
            disabled={isMutating}
          >
            <i className="fas fa-edit text-primary" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(row.id)}
            aria-label={tr('btn-delete')}
            disabled={isMutating}
          >
            <i className="fas fa-trash text-destructive" aria-hidden="true" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export function EntityCardGrid({
  config,
  data,
  isAr,
  t,
  domain = 'fitness',
  isLoading,
  isMutating = false,
  onEdit,
  onDelete,
  actionsExtra,
}) {
  const tr = typeof t === 'function' ? t : (key) => key;
  const showSkeleton = isLoading && data.length === 0;
  const showFetchingOverlay = isMutating && data.length > 0;

  if (showSkeleton) {
    return <CardGridSkeleton count={6} />;
  }

  if (!data.length) {
    return <EmptyState title={tr('no-data')} description={tr('entity-no-results')} />;
  }

  return (
    <div
      className={`relative transition-opacity ${showFetchingOverlay ? 'pointer-events-none opacity-60' : ''}`}
      aria-busy={showFetchingOverlay || isMutating}
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {data.map((row, index) => (
          <EntityCard
            key={row.id}
            row={row}
            config={config}
            isAr={isAr}
            t={tr}
            domain={domain}
            onEdit={onEdit}
            onDelete={onDelete}
            actionsExtra={actionsExtra}
            isMutating={isMutating}
            priority={index < 3}
          />
        ))}
      </div>
    </div>
  );
}
