import React from 'react';
import { ToggleGroup, ToggleGroupItem } from 'components/ui/toggle-group';
import { cn } from 'lib/utils';

const MODES = [
  { id: 'cards', icon: 'fa-th-large', labelKey: 'view-cards' },
  { id: 'table', icon: 'fa-table', labelKey: 'view-table' },
];

export function ViewModeToggle({ value, onChange, t, isRTL }) {
  const tr = typeof t === 'function' ? t : (key) => key;

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(next) => next && onChange(next)}
      variant="outline"
      size="sm"
      className="shadow-sm"
      aria-label={tr('view-mode-label')}
    >
      {MODES.map(({ id, icon, labelKey }) => (
        <ToggleGroupItem
          key={id}
          value={id}
          aria-label={tr(labelKey)}
          title={tr(labelKey)}
          className={cn(
            'gap-2 px-3.5 data-[state=on]:border-primary/30 data-[state=on]:bg-card data-[state=on]:text-primary-dark data-[state=on]:shadow-sm',
            isRTL && 'font-medium'
          )}
        >
          <i className={cn('fas', icon)} aria-hidden="true" />
          <span className="hidden sm:inline">{tr(labelKey)}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
