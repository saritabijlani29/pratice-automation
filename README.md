# Playwright UI Automation Framework

Multi-environment Playwright framework targeting [Practice Test Automation](https://practicetestautomation.com/).

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
npm install
cp playwright.env.example playwright.env
# Edit playwright.env with your values (defaults work for local)
npx playwright install   # Downloads browsers - required before first run
```

## Running Tests

| Script | Description |
|--------|-------------|
| `npm test` | Run all tests (local env) |
| `npm run test:headed` | Run with browser visible |
| `npm run test:chrome` | Run on Chromium only |
| `npm run test:debug` | Run in debug mode |
| `npm run test:ui` | Open Playwright UI |
| `npm run test:staging` | Run with `TEST_ENV=staging` |
| `npm run report` | Open HTML report |

## Environments and env files

Each environment can have its own BASE_URL and credentials via separate env files:

| File | Used when | Purpose |
|------|-----------|---------|
| `playwright.env` | local (default) | Local dev BASE_URL and credentials |
| `playwright.env.ci` | `TEST_ENV=ci` | CI server BASE_URL and credentials |
| `playwright.env.staging` | `TEST_ENV=staging` | Staging BASE_URL and credentials |

Config loads `playwright.env` first, then overrides with `playwright.env.ci` or `playwright.env.staging` when `TEST_ENV` is set. All three files are gitignored; use the `.example` files as templates.

- **local** (default): Uses `playwright.env` only. 30s timeout, no retries.
- **ci**: Uses `playwright.env` then `playwright.env.ci`. 45s timeout, 2 retries, 2 workers.
- **staging**: Uses `playwright.env` then `playwright.env.staging`. 60s timeout, 1 retry.

### Run for CI

**Option 1 – env file (e.g. on your machine):**
```bash
cp playwright.env.ci.example playwright.env.ci
# Edit playwright.env.ci and set BASE_URL and credentials for CI
TEST_ENV=ci npx playwright test
```

**Option 2 – set vars in the pipeline (no file in repo):**  
In your CI config (GitHub Actions, Jenkins, etc.), set `TEST_ENV=ci` and `BASE_URL`, `STANDARD_USER`, etc. The config will use those; no `playwright.env.ci` file needed.

## Project Structure

```
├── playwright.config.ts    # Multi-env config + dotenv
├── playwright.env          # Local defaults (gitignored)
├── src/
│   ├── fixtures/           # Custom test fixtures
│   ├── pages/              # Page objects
│   ├── components/         # Reusable components
│   ├── helpers/            # Utilities
│   └── test-data/          # Role-based user data
└── tests/                  # Test specs
```

## Test Data

Tests use role-based abstractions (`testUsers.valid`, `testUsers.invalidUsername`, etc.) — no hardcoded credentials.
