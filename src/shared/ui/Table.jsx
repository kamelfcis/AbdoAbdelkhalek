import React from 'react';
import PropTypes from 'prop-types';
import {
  Table as ShadcnTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'components/ui/table';
import { cn } from 'lib/utils';
import EmptyState from './EmptyState';

const ALIGN_CLASS = {
  start: 'text-start',
  center: 'text-center',
  end: 'text-end',
};

const Table = ({
  columns = [],
  data = [],
  keyField = 'id',
  sortKey,
  sortDirection = 'asc',
  onSort,
  emptyState,
  className,
  isRTL = false,
  defaultAlign = 'center',
}) => {
  if (!data.length) {
    return emptyState || <EmptyState title="No data" description="Nothing to display yet." />;
  }

  return (
    <div
      className={cn(
        'dashboard-table overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-sm',
        className
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <ShadcnTable>
        <TableHeader className="sticky top-0 z-10 bg-[var(--color-bg-muted)]/80 backdrop-blur-sm">
          <TableRow className="border-primary/20 hover:bg-transparent">
            {columns.map((col) => {
              const isSortable = col.sortable && onSort;
              const isActive = sortKey === col.key;
              const alignClass = ALIGN_CLASS[col.align ?? defaultAlign] ?? ALIGN_CLASS.center;

              return (
                <TableHead
                  key={col.key}
                  scope="col"
                  className={cn(
                    alignClass,
                    isActive && 'text-primary-dark',
                    isSortable &&
                      'cursor-pointer select-none transition-colors hover:bg-accent/40 hover:text-primary'
                  )}
                  onClick={isSortable ? () => onSort(col.key) : undefined}
                  aria-sort={
                    isActive ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined
                  }
                >
                  <span
                    className={cn(
                      'inline-flex items-center gap-1',
                      alignClass === 'text-center' && 'w-full justify-center'
                    )}
                  >
                    {col.header ?? col.title ?? col.label ?? col.key ?? ''}
                    {isSortable && isActive && (
                      <i
                        className={cn(
                          'fas text-xs text-primary',
                          sortDirection === 'asc' ? 'fa-arrow-up' : 'fa-arrow-down'
                        )}
                        aria-hidden="true"
                      />
                    )}
                  </span>
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={row[keyField] ?? rowIndex}>
              {columns.map((col) => {
                const alignClass = ALIGN_CLASS[col.align ?? defaultAlign] ?? ALIGN_CLASS.center;
                return (
                  <TableCell key={col.key} className={alignClass}>
                    {col.render ? col.render(row, rowIndex) : row[col.key]}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </ShadcnTable>
    </div>
  );
};

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      header: PropTypes.node,
      title: PropTypes.node,
      label: PropTypes.node,
      sortable: PropTypes.bool,
      align: PropTypes.oneOf(['start', 'center', 'end']),
      render: PropTypes.func,
    })
  ),
  data: PropTypes.array,
  keyField: PropTypes.string,
  sortKey: PropTypes.string,
  sortDirection: PropTypes.oneOf(['asc', 'desc']),
  onSort: PropTypes.func,
  emptyState: PropTypes.node,
  className: PropTypes.string,
  isRTL: PropTypes.bool,
  defaultAlign: PropTypes.oneOf(['start', 'center', 'end']),
};

export default Table;
