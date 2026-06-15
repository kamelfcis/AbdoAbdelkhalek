import React from 'react';

// Stats Card Skeleton
export const StatsCardSkeleton = () => {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 bg-[var(--color-bg-muted)] rounded mb-2 w-24"></div>
          <div className="h-8 bg-[var(--color-bg-muted)] rounded w-16"></div>
        </div>
        <div className="w-16 h-16 rounded-xl bg-[var(--color-bg-muted)]"></div>
      </div>
      <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
        <div className="h-3 bg-[var(--color-bg-muted)] rounded w-20"></div>
      </div>
    </div>
  );
};

export const StatsCardGrid = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <StatsCardSkeleton key={index} />
      ))}
    </div>
  );
};

// Table Row Skeleton
export const TableRowSkeleton = ({ columns = 5 }) => {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-4 py-3">
          <div className="h-4 bg-[var(--color-bg-muted)] rounded w-full"></div>
        </td>
      ))}
    </tr>
  );
};

export const TableSkeleton = ({ rows = 5, columns = 5 }) => {
  return (
    <div className="bg-[var(--color-surface)] rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-[var(--color-border)]">
        <thead className="bg-[var(--color-bg-muted)]">
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="px-4 py-3">
                <div className="h-4 bg-[var(--color-border)] rounded w-20"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-[var(--color-surface)] divide-y divide-[var(--color-border)]">
          {Array.from({ length: rows }).map((_, index) => (
            <TableRowSkeleton key={index} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Card Skeleton
export const CardSkeleton = () => {
  return (
    <div className="bg-[var(--color-surface)] rounded-lg shadow p-6 animate-pulse">
      <div className="h-6 bg-[var(--color-bg-muted)] rounded mb-4 w-3/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-[var(--color-bg-muted)] rounded w-full"></div>
        <div className="h-4 bg-[var(--color-bg-muted)] rounded w-5/6"></div>
        <div className="h-4 bg-[var(--color-bg-muted)] rounded w-4/6"></div>
      </div>
      <div className="mt-4 flex space-x-2">
        <div className="h-8 bg-[var(--color-bg-muted)] rounded w-20"></div>
        <div className="h-8 bg-[var(--color-bg-muted)] rounded w-20"></div>
      </div>
    </div>
  );
};

export const CardGridSkeleton = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
};

// List Item Skeleton
export const ListItemSkeleton = () => {
  return (
    <div className="bg-[var(--color-surface)] rounded-lg shadow p-4 mb-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-5 bg-[var(--color-bg-muted)] rounded mb-2 w-3/4"></div>
          <div className="h-4 bg-[var(--color-bg-muted)] rounded w-1/2"></div>
        </div>
        <div className="flex space-x-2">
          <div className="h-8 w-8 bg-[var(--color-bg-muted)] rounded"></div>
          <div className="h-8 w-8 bg-[var(--color-bg-muted)] rounded"></div>
        </div>
      </div>
    </div>
  );
};

export const ListSkeleton = ({ count = 5 }) => {
  return (
    <div>
      {Array.from({ length: count }).map((_, index) => (
        <ListItemSkeleton key={index} />
      ))}
    </div>
  );
};

