import React from 'react';

export const VideosTableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-3">
      <div className="flex flex-col items-center gap-2">
        <div className="w-20 h-12 rounded-lg bg-gray-200" />
        <div className="h-4 bg-gray-200 rounded w-32" />
        <div className="h-3 bg-gray-200 rounded w-40" />
      </div>
    </td>
    <td className="px-4 py-3">
      <div className="h-4 bg-gray-200 rounded w-16 mx-auto" />
    </td>
    <td className="px-4 py-3">
      <div className="h-4 bg-gray-200 rounded w-10 mx-auto" />
    </td>
    <td className="px-4 py-3">
      <div className="h-6 bg-gray-200 rounded-full w-12 mx-auto" />
    </td>
    <td className="px-4 py-3">
      <div className="flex items-center justify-center gap-3">
        <div className="h-8 w-8 bg-gray-200 rounded" />
        <div className="h-8 w-8 bg-gray-200 rounded" />
        <div className="h-8 w-8 bg-gray-200 rounded" />
      </div>
    </td>
  </tr>
);

export const VideosTableSkeleton = ({ rows = 5 }) => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {Array.from({ length: 5 }).map((_, index) => (
            <th key={index} className="px-4 py-3">
              <div className="h-4 bg-gray-300 rounded w-20 mx-auto" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, index) => (
          <VideosTableRowSkeleton key={index} />
        ))}
      </tbody>
    </table>
  </div>
);
