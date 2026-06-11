import React from 'react';

import { Button, Input, Select } from '../../../shared/ui';

export function EntityToolbar({
  t,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  featuredFilter,
  onFeaturedFilterChange,
  showStatusFilter,
  showFeaturedFilter,
  addLabel,
  onAdd,
  bulkDelete = false,
  selectedCount = 0,
  onDeleteSelected,
  isMutating = false,
}) {
  const tr = typeof t === 'function' ? t : (key) => key;
  const showBulkDelete = bulkDelete && selectedCount > 0;

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex justify-end gap-2">
        {showBulkDelete && (
          <Button
            variant="danger"
            leftIcon={<i className="fas fa-trash" aria-hidden="true" />}
            onClick={onDeleteSelected}
            disabled={isMutating}
          >
            {tr('btn-delete-selected')} ({selectedCount})
          </Button>
        )}
        <Button variant="primary" leftIcon={<i className="fas fa-plus" aria-hidden="true" />} onClick={onAdd}>
          {addLabel}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Input
          className="md:col-span-2 lg:col-span-2"
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={tr('search-placeholder')}
        />

        {showStatusFilter && (
          <Select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            options={[
              { value: 'all', label: tr('filter-all-statuses') },
              { value: 'public', label: tr('filter-public') },
              { value: 'private', label: tr('filter-private') },
            ]}
          />
        )}

        {showFeaturedFilter && (
          <Select
            value={featuredFilter}
            onChange={(e) => onFeaturedFilterChange(e.target.value)}
            options={[
              { value: 'all', label: tr('filter-all') },
              { value: 'featured', label: tr('filter-featured') },
              { value: 'regular', label: tr('filter-regular') },
            ]}
          />
        )}
      </div>
    </div>
  );
}
