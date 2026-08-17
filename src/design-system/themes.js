/**
 * Theme definitions — fitness (current brand) + squash (placeholder).
 * Maps to CSS custom properties via applyThemeVariables().
 */

import { colors, radius, shadows } from './tokens';

export const themeIds = {
  FITNESS: 'fitness',
  SQUASH: 'squash',
};

const sharedTokens = {
  '--radius-sm': radius.sm,
  '--radius-md': radius.md,
  '--radius-lg': radius.lg,
  '--radius-xl': radius.xl,
  '--radius-2xl': radius['2xl'],
  '--radius-full': radius.full,
  '--shadow-sm': '0 1px 2px 0 rgb(15 23 42 / 0.05)',
  '--shadow-md': '0 4px 14px -4px rgb(15 23 42 / 0.08), 0 2px 4px -2px rgb(15 23 42 / 0.06)',
  '--shadow-lg': '0 12px 24px -8px rgb(15 23 42 / 0.10)',
  '--shadow-xl': '0 20px 32px -10px rgb(15 23 42 / 0.12)',
  '--shadow-glass': shadows.glass,
};

/** Fitness — matches current site branding (#0074b7, #bfd7ed) */
export const fitnessTheme = {
  light: {
    ...sharedTokens,
    '--color-primary': '#0074b7',
    '--color-primary-light': '#bfd7ed',
    '--color-primary-dark': '#005a8a',
    '--color-secondary': '#10b981',
    '--color-accent': '#3b82f6',
    '--color-bg': colors.gray[100],
    '--color-bg-canvas': colors.gray[100],
    '--color-bg-elevated': colors.white,
    '--color-bg-muted': colors.gray[50],
    '--color-surface': colors.white,
    '--color-surface-raised': colors.white,
    '--color-surface-glass': 'rgba(255, 255, 255, 0.72)',
    '--color-text': colors.gray[800],
    '--color-text-muted': colors.gray[600],
    '--color-text-inverse': colors.white,
    '--color-border': '#dbe4ee',
    '--color-border-focus': '#0074b7',
    '--color-ring': '#0074b7',
    '--shadow-glow': '0 0 32px rgba(0, 116, 183, 0.08)',
    '--color-success': colors.green[500],
    '--color-warning': colors.amber[500],
    '--color-danger': colors.red[500],
    '--color-info': colors.blue[500],
    '--gradient-primary': 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #10b981 100%)',
    '--gradient-hero': 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e40af 75%, #3b82f6 100%)',
    '--gradient-brand': 'linear-gradient(to right, #bfd7ed, #0074b7)',
    '--font-display': "'Orbitron', sans-serif",
    '--sidebar-width': '16rem',
  },
  dark: {
    ...sharedTokens,
    '--color-primary': '#60a5fa',
    '--color-primary-light': '#93c5fd',
    '--color-primary-dark': '#3b82f6',
    '--color-secondary': '#34d399',
    '--color-accent': '#818cf8',
    '--color-bg': '#070b14',
    '--color-bg-canvas': '#070b14',
    '--color-bg-elevated': '#121a2b',
    '--color-bg-muted': '#0a101c',
    '--color-surface': '#0c1322',
    '--color-surface-raised': '#121a2b',
    '--color-surface-glass': 'rgba(12, 19, 34, 0.72)',
    '--color-text': '#F3F4F6',
    '--color-text-muted': '#9CA3AF',
    '--color-text-inverse': colors.white,
    '--color-border': 'rgba(96, 165, 250, 0.14)',
    '--color-border-focus': '#60a5fa',
    '--color-ring': '#60a5fa',
    '--shadow-glow': '0 0 40px rgba(0, 116, 183, 0.12)',
    '--color-success': colors.green[500],
    '--color-warning': colors.amber[500],
    '--color-danger': colors.red[500],
    '--color-info': colors.blue[400],
    '--gradient-primary': 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #10b981 100%)',
    '--gradient-hero': 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e3a8a 100%)',
    '--gradient-brand': 'linear-gradient(to right, #1e40af, #3b82f6)',
    '--font-display': "'Orbitron', sans-serif",
    '--sidebar-width': '16rem',
  },
};

/** Squash — light green public + dashboard (mirrors fitness structure, green brand) */
const squashBrandBase = {
  ...sharedTokens,
  '--squash-primary': '#9BEA00',
  '--squash-primary-light': '#D7FF3F',
  '--squash-primary-dark': '#6BB800',
  '--font-display': "'Orbitron', sans-serif",
  '--font-body': "'Open Sans', sans-serif",
  '--sidebar-width': '16rem',
};

export const squashTheme = {
  light: {
    ...squashBrandBase,
    '--color-primary': '#6BB800',
    '--color-primary-light': '#D7FF3F',
    '--color-primary-dark': '#4D8A00',
    '--color-secondary': '#9BEA00',
    '--color-accent': '#D7FF3F',
    '--color-bg': colors.gray[100],
    '--color-bg-canvas': colors.gray[100],
    '--color-bg-elevated': colors.white,
    '--color-bg-muted': colors.gray[50],
    '--color-surface': colors.white,
    '--color-surface-raised': colors.white,
    '--color-surface-glass': 'rgba(255, 255, 255, 0.85)',
    '--color-text': colors.gray[800],
    '--color-text-muted': colors.gray[600],
    '--color-text-inverse': colors.gray[900],
    '--color-border': '#dce6d4',
    '--color-border-focus': '#9BEA00',
    '--color-ring': '#6BB800',
    '--shadow-glow': '0 0 32px rgba(155, 234, 0, 0.12)',
    '--color-success': '#9BEA00',
    '--color-warning': colors.amber[500],
    '--color-danger': colors.red[500],
    '--color-info': colors.blue[500],
    '--gradient-primary': 'linear-gradient(135deg, #D7FF3F 0%, #9BEA00 50%, #6BB800 100%)',
    '--gradient-hero': 'linear-gradient(135deg, #f0fdf4 0%, #ecfccb 35%, #d9f99d 70%, #9BEA00 100%)',
    '--gradient-brand': 'linear-gradient(to right, #D7FF3F, #9BEA00)',
  },
  dark: {
    ...squashBrandBase,
    '--color-primary': '#D7FF3F',
    '--color-primary-light': '#DFFF4A',
    '--color-primary-dark': '#9BEA00',
    '--color-secondary': '#9BEA00',
    '--color-accent': '#D7FF3F',
    '--color-bg': '#0B1220',
    '--color-bg-canvas': '#0B1220',
    '--color-bg-elevated': '#162033',
    '--color-bg-muted': '#080d18',
    '--color-surface': '#111827',
    '--color-surface-raised': '#162033',
    '--color-surface-glass': 'rgba(17, 24, 39, 0.72)',
    '--color-text': '#F4FCE8',
    '--color-text-muted': '#9CA89A',
    '--color-text-inverse': '#050816',
    '--color-border': 'rgba(155, 234, 0, 0.12)',
    '--color-border-focus': '#D7FF3F',
    '--color-ring': '#D7FF3F',
    '--shadow-glow': '0 0 36px rgba(155, 234, 0, 0.08)',
    '--color-success': '#9BEA00',
    '--color-warning': colors.amber[500],
    '--color-danger': colors.red[400],
    '--color-info': colors.blue[400],
    '--gradient-primary': 'linear-gradient(135deg, #D7FF3F 0%, #9BEA00 50%, #0B1220 100%)',
    '--gradient-hero': 'linear-gradient(180deg, #ecfccb 0%, #0B1220 85%)',
    '--gradient-brand': 'linear-gradient(to right, #DFFF4A, #9BEA00)',
  },
};

export const themes = {
  [themeIds.FITNESS]: fitnessTheme,
  [themeIds.SQUASH]: squashTheme,
};

/**
 * Apply theme CSS variables to document root.
 * @param {'fitness'|'squash'} themeId
 * @param {'light'|'dark'} mode
 * @param {HTMLElement} [el=document.documentElement]
 */
export function applyThemeVariables(themeId = themeIds.FITNESS, mode = 'light', el = typeof document !== 'undefined' ? document.documentElement : null) {
  if (!el) return;

  const theme = themes[themeId]?.[mode] || themes[themeIds.FITNESS].light;
  el.setAttribute('data-theme', themeId);
  el.setAttribute('data-mode', mode);

  Object.entries(theme).forEach(([key, value]) => {
    el.style.setProperty(key, value);
  });
}

export function getThemeVariables(themeId = themeIds.FITNESS, mode = 'light') {
  return themes[themeId]?.[mode] || themes[themeIds.FITNESS].light;
}

export default themes;
