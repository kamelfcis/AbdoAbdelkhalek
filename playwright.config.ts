import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const apiURL = process.env.PLAYWRIGHT_API_URL || 'http://localhost:4000';
const useDevServer = process.env.PLAYWRIGHT_DEV_SERVER === '1';

const frontendBuildEnv = {
  BROWSER: 'none',
  DISABLE_ESLINT_PLUGIN: 'true',
  REACT_APP_API_URL: `${apiURL}/api`,
  REACT_APP_DOMAIN: process.env.REACT_APP_DOMAIN || 'fitness',
};

const frontendCommand = useDevServer
  ? 'npm start'
  : 'npm run build && npx --yes serve@14.2.4 -s build -l 3000';

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  timeout: 120_000,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  expect: { timeout: 30_000 },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    navigationTimeout: 60_000,
    actionTimeout: 30_000,
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/coach.json',
      },
      dependencies: ['setup'],
      testIgnore: [/auth\.setup\.ts/, /landing-squash\.spec\.ts/],
    },
    {
      name: 'squash-landing',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.PLAYWRIGHT_SQUASH_BASE_URL || 'http://localhost:3000',
      },
      testMatch: /landing-squash\.spec\.ts/,
    },
  ],
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : [
        {
          command: 'npm run backend:dev',
          url: `${apiURL}/api/health`,
          reuseExistingServer: true,
          timeout: 120_000,
          cwd: '.',
        },
        {
          command: frontendCommand,
          url: baseURL,
          reuseExistingServer: false,
          timeout: useDevServer ? 180_000 : 360_000,
          stdout: useDevServer ? /Compiled successfully/i : /Accepting connections/i,
          env: frontendBuildEnv,
        },
      ],
});
