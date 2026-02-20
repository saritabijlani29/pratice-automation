import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

const envDir = __dirname;
// Load base env first (local defaults)
dotenv.config({ path: path.resolve(envDir, 'playwright.env') });

// Override with env-specific file when TEST_ENV is set
const testEnv = process.env.TEST_ENV;
if (testEnv === 'ci' || testEnv === 'staging') {
  const envFile = path.resolve(envDir, `playwright.env.${testEnv}`);
  dotenv.config({ path: envFile, override: true });
}

const environment = (process.env.TEST_ENV || 'local') as 'local' | 'ci' | 'staging';

const environments = {
  local: {
    baseURL: process.env.BASE_URL || 'https://practicetestautomation.com',
    timeout: 30_000,
    workers: undefined,
    retries: 0,
  },
  ci: {
    baseURL: process.env.BASE_URL || 'https://practicetestautomation.com',
    timeout: 45_000,
    workers: 2,
    retries: 2,
  },
  staging: {
    baseURL: process.env.BASE_URL!,
    timeout: 60_000,
    workers: 2,
    retries: 1,
  },
} as const;

const envConfig = environments[environment] ?? environments.local;

// Set TEST_WORKERS environment variable for reporter to detect execution mode
// Use 1 for undefined (which means auto/parallel in Playwright, but we'll track as default parallel)
const workerCount = envConfig.workers;
process.env.TEST_WORKERS = String(workerCount);

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: envConfig.retries,
  workers: envConfig.workers,
  reporter: [
    ['html', { outputFolder: 'reports/html' }],
    ['list'],
    ['./src/reporters/history.reporter.ts'],
  ],
  use: {
    baseURL: envConfig.baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
  },
  timeout: envConfig.timeout,
  expect: {
    timeout: 10_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
