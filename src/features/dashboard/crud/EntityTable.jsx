import React from 'react';
import { Button } from 'components/ui/button';
import { EmptyState } from '../../../shared/ui';
import { Table } from '../../../shared/ui';
import { TableSkeleton } from '../../fitness/components/Skeletons';
import { renderCell } from './entityCellRenderers';
import { resolveColumnHeader } from './entityColumnHeaders';

export function EntityTable({
  config,
  data,
  isRTL,
  isAr,
  t,
  domain = 'fitness',
  isLoading,
  isFetching = false,
  isMutating = false,
  onEdit,
  onDelete,
  actionsExtra,
}) {
  const tr = typeof t === 'function' ? t : (key) => key;
  const columnCount = (config?.columns?.length || 3) + 1;
  const showSkeleton = isLoading && data.length === 0;
  const showFetchingOverlay = isMutating && data.length > 0;

  const columns = [
    ...(config?.columns || []).map((col) => ({
      key: col.key,
      align: 'center',
      header: resolveColumnHeader(col, { isAr, t: tr }),
      render: (row, rowIndex) => renderCell(col, row, { isAr, t: tr, domain, rowIndex }),
    })),
    {
      key: 'actions',
      align: 'center',
      header: tr('th-actions'),
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
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
      ),
    },
  ];

  if (showSkeleton) {
    return <TableSkeleton rows={5} columns={columnCount} />;
  }

  return (
    <div
      className={`relative transition-opacity ${showFetchingOverlay ? 'pointer-events-none opacity-60' : ''}`}
      aria-busy={showFetchingOverlay || isMutating}
    >
      <Table
        isRTL={isRTL}
        data={data}
        emptyState={
          <EmptyState title={tr('no-data')} description={tr('entity-no-results')} />
        }
        columns={columns}
      />
    </div>
  );
}
