import React from 'react';

export const VideosTableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-3">
      <div className="flex flex-col items-center gap-2">
        <div className="w-20 h-12 rounded-lg bg-[var(--color-bg-muted)]" />
        <div className="h-4 bg-[var(--color-bg-muted)] rounded w-32" />
        <div className="h-3 bg-[var(--color-bg-muted)] rounded w-40" />
      </div>
    </td>
    <td className="px-4 py-3">
      <div className="h-4 bg-[var(--color-bg-muted)] rounded w-16 mx-auto" />
    </td>
    <td className="px-4 py-3">
      <div className="h-4 bg-[var(--color-bg-muted)] rounded w-10 mx-auto" />
    </td>
    <td className="px-4 py-3">
      <div className="h-6 bg-[var(--color-bg-muted)] rounded-full w-12 mx-auto" />
    </td>
    <td className="px-4 py-3">
      <div className="flex items-center justify-center gap-3">
        <div className="h-8 w-8 bg-[var(--color-bg-muted)] rounded" />
        <div className="h-8 w-8 bg-[var(--color-bg-muted)] rounded" />
        <div className="h-8 w-8 bg-[var(--color-bg-muted)] rounded" />
      </div>
    </td>
  </tr>
);

export const VideosTableSkeleton = ({ rows = 5 }) => (
  <div className="bg-[var(--color-surface)] rounded-lg shadow overflow-hidden">
    <table className="min-w-full divide-y divide-[var(--color-border)]">
      <thead className="bg-[var(--color-bg-muted)]">
        <tr>
          {Array.from({ length: 5 }).map((_, index) => (
            <th key={index} className="px-4 py-3">
              <div className="h-4 bg-[var(--color-border)] rounded w-20 mx-auto" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-[var(--color-surface)] divide-y divide-[var(--color-border)]">
        {Array.from({ length: rows }).map((_, index) => (
          <VideosTableRowSkeleton key={index} />
        ))}
      </tbody>
    </table>
  </div>
);
