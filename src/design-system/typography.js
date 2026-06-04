/**
 * Typography scale — font families, sizes, weights, preset text styles.
 */

export const fontFamily = {
  sans: "'Open Sans', system-ui, sans-serif",
  display: "'Orbitron', 'Open Sans', sans-serif",
  dashboard: "'Open Sans', system-ui, sans-serif",
  login: "'Rajdhani', 'Open Sans', sans-serif",
  arabic: "'Tajawal', 'Open Sans', sans-serif",
  mono: "'Courier New', monospace",
};

export const fontSize = {
  xs: ['0.75rem', { lineHeight: '1rem' }],
  sm: ['0.875rem', { lineHeight: '1.25rem' }],
  base: ['1rem', { lineHeight: '1.5rem' }],
  lg: ['1.125rem', { lineHeight: '1.75rem' }],
  xl: ['1.25rem', { lineHeight: '1.75rem' }],
  '2xl': ['1.5rem', { lineHeight: '2rem' }],
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
};

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const lineHeight = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
};

/** Preset text styles for common UI patterns */
export const textStyles = {
  h1: 'text-3xl md:text-4xl font-bold tracking-tight',
  h2: 'text-2xl md:text-3xl font-bold tracking-tight',
  h3: 'text-xl font-semibold',
  h4: 'text-lg font-semibold',
  body: 'text-base font-normal',
  bodySm: 'text-sm font-normal',
  label: 'text-sm font-medium',
  caption: 'text-xs text-[var(--color-text-muted)]',
  overline: 'text-xs font-semibold uppercase tracking-wider',
};

export default {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  textStyles,
};
