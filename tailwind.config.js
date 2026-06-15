/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        border: 'var(--color-border, #e5e7eb)',
        input: 'var(--color-border, #e5e7eb)',
        ring: 'var(--color-primary, #0074b7)',
        background: 'var(--color-bg, #f3f4f6)',
        foreground: 'var(--color-text, #1f2937)',
        primary: {
          light: 'var(--color-primary-light, #bfd7ed)',
          DEFAULT: 'var(--color-primary, #0074b7)',
          dark: 'var(--color-primary-dark, #005a8a)',
          foreground: 'var(--color-text-inverse, #ffffff)',
        },
        secondary: {
          DEFAULT: 'var(--color-bg-muted, #f9fafb)',
          foreground: 'var(--color-text, #1f2937)',
        },
        destructive: {
          DEFAULT: 'var(--color-danger, #ef4444)',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: 'var(--color-bg-muted, #f9fafb)',
          foreground: 'var(--color-text-muted, #6b7280)',
        },
        accent: {
          DEFAULT: 'var(--color-primary-light, #bfd7ed)',
          foreground: 'var(--color-primary-dark, #005a8a)',
        },
        card: {
          DEFAULT: 'var(--color-surface, #ffffff)',
          foreground: 'var(--color-text, #1f2937)',
        },
        surface: 'var(--color-surface, #ffffff)',
      },
      borderRadius: {
        lg: 'var(--radius, 0.5rem)',
        md: 'calc(var(--radius, 0.5rem) - 2px)',
        sm: 'calc(var(--radius, 0.5rem) - 4px)',
      },
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
        arabic: ['Tajawal', 'sans-serif'],
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: true,
  },
};
