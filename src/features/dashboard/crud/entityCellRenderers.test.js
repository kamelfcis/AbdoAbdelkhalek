import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';

vi.mock('components/ui/badge', () => ({
  Badge: ({ children }) => React.createElement('span', { 'data-testid': 'badge' }, children),
}));

vi.mock('../../../shared/ui/DashboardThumb', () => ({
  default: (props) => React.createElement('img', { alt: props.alt, src: props.src }),
}));

vi.mock('./entityImageUtils', () => ({
  getEntityThumbSrc: () => ({ src: null, fallbackSrc: null }),
  getSuccessStoryThumbSrc: () => ({ src: null, fallbackSrc: null }),
  TABLE_THUMB: { height: 40 },
}));

const { renderCell } = await import('./entityCellRenderers');

const t = (key) =>
  ({ 'filter-public': 'Public', 'filter-private': 'Private', 'th-active': 'Active', yes: 'Yes', no: 'No' }[key] ?? key);

const opts = { isAr: false, t, domain: 'fitness', rowIndex: 0 };
const optsAr = { ...opts, isAr: true };

describe('durationBadge', () => {
  const col = { key: 'duration_days', type: 'durationBadge' };

  it('renders numeric days', () => {
    const { container } = render(renderCell(col, { duration_days: 30 }, opts));
    expect(container.textContent).toContain('30 days');
  });

  it('renders Decimal-like object via template literal', () => {
    const decimal = { valueOf: () => 90, toString: () => '90' };
    const { container } = render(renderCell(col, { duration_days: decimal }, opts));
    expect(container.textContent).toContain('90 days');
  });

  it('renders dash for null', () => {
    const { container } = render(renderCell(col, { duration_days: null }, opts));
    expect(container.textContent).toBe('—');
  });

  it('renders dash for empty string', () => {
    const { container } = render(renderCell(col, { duration_days: '' }, opts));
    expect(container.textContent).toBe('—');
  });
});

describe('levelBadge', () => {
  const col = { key: 'level', type: 'levelBadge' };

  it('renders known level string', () => {
    const { container } = render(renderCell(col, { level: 'beginner' }, opts));
    expect(container.textContent).toContain('beginner');
  });

  it('renders dash for null level', () => {
    const { container } = render(renderCell(col, { level: null }, opts));
    expect(container.textContent).toBe('—');
  });

  it('renders dash for empty string level', () => {
    const { container } = render(renderCell(col, { level: '' }, opts));
    expect(container.textContent).toBe('—');
  });
});

describe('packageTypeFeatures — splitFeatureLines guards', () => {
  const col = { key: 'type', type: 'packageTypeFeatures' };

  it('handles features_en as a plain string', () => {
    const row = { type: 'combined', features_en: 'Feature A\nFeature B', features_ar: null };
    expect(() => render(renderCell(col, row, opts))).not.toThrow();
    const { container } = render(renderCell(col, row, opts));
    expect(container.textContent).toContain('Feature A');
    expect(container.textContent).toContain('Feature B');
  });

  it('does NOT throw when features_en is an array', () => {
    const row = { type: 'training', features_en: ['Feature X', 'Feature Y'], features_ar: null };
    expect(() => render(renderCell(col, row, opts))).not.toThrow();
    const { container } = render(renderCell(col, row, opts));
    expect(container.textContent).toContain('Feature X');
  });

  it('does NOT throw when features_ar is an array (AR mode)', () => {
    const row = { type: 'nutrition', features_en: null, features_ar: ['ميزة أ', 'ميزة ب'] };
    expect(() => render(renderCell(col, row, optsAr))).not.toThrow();
    const { container } = render(renderCell(col, row, optsAr));
    expect(container.textContent).toContain('ميزة أ');
  });

  it('does NOT throw when features_en is null', () => {
    const row = { type: 'combined', features_en: null, features_ar: null };
    expect(() => render(renderCell(col, row, opts))).not.toThrow();
  });

  it('does NOT throw when features_en is a plain object', () => {
    const row = { type: 'combined', features_en: { raw: 'Feature A' }, features_ar: null };
    expect(() => render(renderCell(col, row, opts))).not.toThrow();
  });

  it('does NOT throw when type is null', () => {
    const row = { type: null, features_en: 'Feature A', features_ar: null };
    expect(() => render(renderCell(col, row, opts))).not.toThrow();
  });

  it('handles comma-separated features string', () => {
    const row = { type: 'combined', features_en: 'Feature A, Feature B, Feature C', features_ar: null };
    const { container } = render(renderCell(col, row, opts));
    expect(container.textContent).toContain('Feature A');
    expect(container.textContent).toContain('Feature B');
  });
});
