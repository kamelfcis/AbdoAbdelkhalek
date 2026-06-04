import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { transform } from 'esbuild';

const root = path.dirname(fileURLToPath(import.meta.url));

/** CRA ships JSX in .js files — pre-transform for Vite import analysis. */
function jsxInJsPlugin() {
  return {
    name: 'jsx-in-js',
    enforce: 'pre',
    async transform(code, id) {
      if (!id.includes('/src/') || !id.endsWith('.js')) return null;
      if (!/<[A-Za-z]/.test(code)) return null;
      const result = await transform(code, {
        loader: 'jsx',
        jsx: 'automatic',
        format: 'esm',
        sourcefile: id,
      });
      return { code: result.code, map: result.map };
    },
  };
}

export default defineConfig({
  plugins: [jsxInJsPlugin(), react({ include: /\.(jsx|js|tsx|ts)$/ })],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
    exclude: ['src/App.test.js', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: './coverage-frontend',
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/**/*.test.{js,jsx}',
        'src/index.js',
        'src/reportWebVitals.js',
        'src/setupTests.js',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(root, 'src'),
    },
  },
});
