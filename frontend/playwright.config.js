// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  timeout: 120000,
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    headless: true,
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'cross-env REACT_APP_E2E_AUTH_BYPASS=true PORT=3001 npm start',
    url: 'http://localhost:3001',
    reuseExistingServer: false,
    timeout: 120000,
    env: {
      REACT_APP_E2E_AUTH_BYPASS: 'true',
      PORT: '3001',
    },
  },
});
