# Playwright UI Automation Framework

Multi-environment Playwright framework targeting [Practice Test Automation](https://practicetestautomation.com/).

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Running Tests](#running-tests)
4. [Running on Different Environments](#running-on-different-environments)
   - [Environment Settings](#environment-settings)
   - [Environment Files](#environment-files)
   - [Combining Environment with Workers](#combining-environment-with-workers)
5. [Project Structure](#project-structure)
6. [How Custom Reporting Works](#how-custom-reporting-works)
   - [Test Execution → Data Capture](#1-test-execution--data-capture)
   - [Screenshot Capture](#2-screenshot-capture)
   - [Dashboard Generation](#3-dashboard-generation)
   - [Data Flow](#4-data-flow)
7. [Key Files Explained](#key-files-explained)
8. [Sample Report](#sample-report)
9. [Future Improvements](#future-improvements)
10. [Cleanup](#cleanup)

---

## Prerequisites

- Node.js 18+
- npm

## Quick Start

**First time setup:**
```bash
npm install
npx playwright install
```

That's it! By default, tests run against the live site (no config needed).

## Running Tests

**Quick Demo (Table Page Tests):**
```bash
# Step 1: Run table tests (choose one)
npm run test:sequential   # Runs tests one-by-one
npm run test:parallel     # Runs tests simultaneously (faster)

# Step 2: Generate and view the dashboard
npm run report:view
```
> **Note:** `test:sequential` and `test:parallel` run only Table Page tests (explicitly configured because we need to check the trend of 10 test cases). Other tests (Login, Logged-In) run via `npm test`.

**Basic:**
- `npm test` — Run all tests
- `npm run test:headed` — See the browser while tests run
- `npm run test:parallel` — Run tests simultaneously (faster)
- `npm run test:sequential` — Run tests one-by-one (slower)

**Debugging:**
- `npm run test:debug` — Step through tests with debugger
- `npm run test:ui` — Interactive test explorer
- `npm run test:chrome` — Run on Chrome only

**Reports:**
- `npm run report:generate` — Build the dashboard
- `npm run report:view` — Open the dashboard in browser

## Running on Different Environments

Set `TEST_ENV` before running tests:

**PowerShell (Windows):**
```powershell
$env:TEST_ENV='local'; npm test
$env:TEST_ENV='staging'; npm test
```

**Command Prompt (Windows):**
```cmd
set TEST_ENV=staging && npm test
```

**Mac/Linux:**
```bash
TEST_ENV=staging npm test
```

### Environment Settings

| Environment | Workers | Timeout | Retries | Use Case |
|-------------|---------|---------|---------|----------|
| **local** (default) | auto | 30s | 0 | Local development |
| **staging** | 2 | 60s | 1 | Testing against staging server |

### Environment Files

Each environment loads its own `.env` file:

| Environment | File | Required |
|-------------|------|----------|
| local | `playwright.env` | No (uses defaults) |
| staging | `playwright.env.staging` | Yes |

To set up staging, copy the example file and add your credentials:
```bash
cp playwright.env.staging.example playwright.env.staging
```

Then edit it with your staging URL and credentials.

### Combining Environment with Workers

Override workers from command line:
```powershell
$env:TEST_ENV='staging'; npx playwright test --workers=4
```

## Project Structure

```
├── playwright.config.ts         # Multi-env config + dotenv
├── execution-history.json       # Test results database (auto-generated)
├── playwright.env               # Local env variables (gitignored)
├── playwright.env.staging       # Staging env variables (gitignored)
├── scripts/
│   ├── generate-dashboard.js    # Builds summary.html from history
│   ├── dashboard-template.html  # D3.js charts template
│   └── clean-history.js         # Clears all test data
├── src/
│   ├── fixtures/
│   │   └── base.fixture.ts      # Page objects + auto-screenshot
│   ├── pages/
│   │   ├── base.page.ts         # Common page methods
│   │   ├── home.page.ts         # Menu-based navigation
│   │   ├── login.page.ts        # Login page object
│   │   └── test-table.page.ts   # Table page object
│   ├── components/
│   │   ├── navbar.component.ts  # Navbar component
│   │   └── table.component.ts   # Table component
│   ├── helpers/
│   │   ├── screenshot.helper.ts # Screenshot capture utility
│   │   └── data.helper.ts       # Data utilities
│   ├── reporters/
│   │   └── history.reporter.ts  # Custom result tracker
│   ├── models/
│   │   └── test-result.model.ts # TypeScript interfaces
│   └── test-data/
│       └── users.data.ts        # Role-based credentials
├── tests/
│   ├── login.spec.ts            # Login tests
│   ├── logged-in.spec.ts        # Post-login tests
│   └── table.spec.ts            # Table interaction tests
└── reports/
    ├── summary.html             # Performance dashboard
    ├── html/                    # Playwright HTML report
    └── screenshots/             # Auto-captured evidence
```

## How Custom Reporting Works

### 1. Test Execution → Data Capture

When tests run, the **History Reporter** (`src/reporters/history.reporter.ts`) automatically:
- Captures each test's name, status, duration, and timestamp
- Detects execution mode (parallel/sequential) based on worker count
- Saves everything to `execution-history.json`

### 2. Screenshot Capture

The **Base Fixture** (`src/fixtures/base.fixture.ts`) runs after every test and uses **Screenshot Helper** to:
- Capture a full-page screenshot using Playwright's built-in method
- Save it to `reports/screenshots/YYYY-MM-DD/environment/` folder
- Name format: `testName_timestamp_pass|fail.png`

### 3. Dashboard Generation

Run `npm run report:generate` to build `reports/summary.html`:
- **generate-dashboard.js** reads `execution-history.json`
- Injects data into **dashboard-template.html** (D3.js charts)
- Outputs interactive dashboard with:
  - Pass/fail trends over time
  - Parallel vs Sequential performance comparison
  - Execution history table
  - Screenshot evidence links

### 4. Data Flow

```
Tests Run
    ↓
history.reporter.ts → execution-history.json
    ↓
screenshot.helper.ts → reports/screenshots/
    ↓
npm run report:generate
    ↓
generate-dashboard.js + dashboard-template.html
    ↓
reports/summary.html (viewable dashboard)
```

## Key Files Explained

| File | Purpose |
|------|---------|
| `playwright.config.ts` | Loads env files, sets timeouts/workers/retries per environment |
| `history.reporter.ts` | Custom Playwright reporter that saves results to JSON |
| `base.fixture.ts` | Provides page objects to tests + auto-captures screenshots |
| `screenshot.helper.ts` | Organizes screenshots by date and environment |
| `generate-dashboard.js` | Reads JSON history, generates HTML dashboard with charts |
| `dashboard-template.html` | D3.js template for performance visualizations |
| `clean-history.js` | Deletes all history, screenshots, and dashboard (fresh start) |
| `users.data.ts` | Returns different credentials based on `TEST_ENV` |

## Sample Report

A sample dashboard with execution history is available in [sample-report](sample-report/):

| File | Description |
|------|-------------|
| [summary.html](sample-report/summary.html) | Test Performance Dashboard |
| [execution-history.json](sample-report/execution-history.json) | Sample test execution data |

To view the sample dashboard, open `sample-report/summary.html` in your browser.

## Future Improvements

Planned enhancements for the framework:

### 1. Constants File

**Current:** Hardcoded strings scattered across page objects and tests.

**Improvement:** Create centralized constants:

```typescript
// src/constants/messages.constants.ts
export const ERROR_MESSAGES = {
  INVALID_USERNAME: 'Your username is invalid!',
  INVALID_PASSWORD: 'Your password is invalid!',
  NO_MATCHING_COURSES: 'No matching courses.',
} as const;

// src/constants/urls.constants.ts
export const URLS = {
  LOGIN: '/practice-test-login/',
  LOGGED_IN: '/logged-in-successfully/',
  TABLE: '/practice-test-table/',
  EXCEPTIONS: '/practice-test-exceptions/',
} as const;

// src/constants/test-data.constants.ts
export const FILTER_OPTIONS = {
  LANGUAGES: ['Java', 'Python', 'JavaScript'] as const,
  LEVELS: ['Beginner', 'Intermediate', 'Advanced'] as const,
  MIN_ENROLLMENTS: ['Any', '1,000+', '10,000+', '100,000+'] as const,
} as const;
```

### 2. Smaller Page Components

**Current:** `TestTablePage` has all filter logic in one file.

**Improvement:** Break into reusable components:

```typescript
// src/components/filter-group.component.ts
export class FilterGroupComponent {
  constructor(private group: Locator) {}
  
  async selectRadio(value: string): Promise<void> {
    await this.group.getByRole('radio', { name: value }).check();
  }
  
  async selectCheckbox(value: string): Promise<void> {
    await this.group.getByRole('checkbox', { name: value }).check();
  }
}

// src/components/dropdown.component.ts
export class DropdownComponent {
  constructor(private dropdown: Locator) {}
  
  async select(value: string): Promise<void> {
    await this.dropdown.click();
    await this.dropdown.getByText(value).click();
  }
}
```

### 3. Tagging & Selective Test Execution

```typescript
// Tag tests for selective runs
test('login validation @smoke @critical', async ({ loginPage }) => {
  // ...
});

test('filter by language @regression', async ({ testTablePage }) => {
  // ...
});
```

```bash
# Run only smoke tests
npx playwright test --grep @smoke

# Run everything except slow tests
npx playwright test --grep-invert @slow
```

## Cleanup

To start fresh (delete all test history and screenshots):
```bash
npm run clean:history
```

<div id=r><style>@import"https://use.typekit.net/kmj5qkr.css";:root{--h:polygon(50% 0,100% 24%,100% 76%,50% 100%,0 76%,0 24%)}.h{display:inline-block;background:#25a9ef;padding:6px;clip-path:var(--h)}.a{width:200px;padding:24px 0 40px;display:flex;flex-direction:column;align-items:center;gap:8px;color:#204ecf;text-align:center;background:radial-gradient(circle at 20% -10%,#00c3ff -80%,#fff 30%),radial-gradient(circle at -20% 20%,#00c3ff -80%,#fff 30%),radial-gradient(circle at 70% 100%,#00c3ff -80%,#fff 30%),radial-gradient(circle at 120% 80%,#00c3ff -80%,#fff 30%);background-blend-mode:multiply;clip-path:var(--h);box-shadow:0 28px 50px rgba(6,30,96,.35)}#r{font-family:proxima-nova,Arial,sans-serif}.b{margin:0;font-size:19px;font-weight:700;line-height:1}.c{width:120px;height:1px;background:#25a9ef}.d{font-size:16px;margin-bottom:-6px}.f{display:inline-flex;align-items:center;justify-content:center;padding:4px 20px;border-radius:6px;background:#296bff;color:#fff;font-size:16px;font-weight:500;text-decoration-thickness:.5px;text-underline-offset:2px}</style><div class=h><div class=a><svg width=64 viewBox="0 0 60 17" xmlns="http://www.w3.org/2000/svg"><path d="m20.85 6.38 6.06-.89 2.72-5.49 2.71 5.49 6.06.89-4.39 4.28 1.04 6.03-5.42-2.85-5.43 2.85 1.04-6.03zm33.06 7.17 1.85-.27.82-1.67.83 1.67 1.84.27-1.33 1.31.31 1.83-1.65-.87-1.66.87.32-1.83zm-3.38-3.01-3.61-.52-1.61-3.26-1.62 3.26-3.6.52 2.6 2.55-.61 3.59 3.23-1.69 3.21 1.69-.61-3.59zm-45.19 3.01-1.85-.27-.82-1.67-.83 1.67-1.84.27 1.33 1.31-.31 1.83 1.65-.87 1.65.87-.31-1.83zm3.38-3.01 3.61-.52 1.61-3.26 1.61 3.26 3.61.52-2.6 2.55.61 3.59-3.23-1.69-3.22 1.69.62-3.59z" fill="#00c3ff"/></svg><h3 class=b>TOP 3% TALENT</h3><div class=c></div><span class=d>Vetted by</span><svg style="width:100px;" viewBox="0 0 108 30" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.11 0L14.82 6.7C14.87 6.75 14.91 6.8 14.97 6.85L20.82 12.7L11.31 22.16L15.66 26.52L12.75 29.41L6.09 22.75C6.01 22.68 5.93 22.6 5.85 22.52L0 16.68L9.48 7.25L5.16 2.94L8.11 0ZM12.36 10.5C12.27 10.48 12.18 10.48 12.1 10.5C12.01 10.53 11.94 10.57 11.78 10.72L6.37 16.11C6.21 16.27 6.17 16.34 6.15 16.42C6.12 16.51 6.12 16.6 6.15 16.68C6.17 16.77 6.22 16.85 6.37 17L8.09 18.72C8.24 18.87 8.31 18.91 8.4 18.94C8.49 18.96 8.57 18.96 8.66 18.94C8.75 18.91 8.82 18.87 8.97 18.72L14.38 13.33C14.54 13.18 14.58 13.1 14.61 13.02C14.63 12.93 14.63 12.85 14.61 12.76C14.59 12.67 14.54 12.6 14.39 12.45L12.67 10.73C12.52 10.57 12.44 10.53 12.36 10.5Z" fill="#204ecf"/><path fill-rule="evenodd" clip-rule="evenodd" d="M62.65 7.76C64.76 7.76 66.56 8.58 67.99 10.16C69.45 11.69 70.18 13.8 70.17 16.42C70.17 18.98 69.42 21.22 67.93 22.8C66.46 24.37 64.59 25.17 62.35 25.17C60.42 25.16 58.67 24.47 57.51 23.28L57.35 23.11L57.34 29.86L53.52 29.85V29.57L53.56 7.96L57.36 7.96L57.35 10.6C58.6 9.19 60.61 7.76 62.65 7.76ZM87.1 7.82C89.28 7.82 90.78 8.31 91.94 9.26C93.05 10.18 93.64 11.82 93.69 13.55L93.69 13.81L93.67 24.95H89.8L89.8 24.49C89.8 24.01 89.8 23.52 89.8 23.02C88.68 24.57 87.12 25.32 85.04 25.32C83.39 25.32 81.99 24.82 80.97 23.9C79.94 22.95 79.39 21.66 79.39 20.16C79.41 17.33 81.41 15.37 84.91 14.76L85.18 14.71L89.82 13.98V13.61C89.82 12.83 89.59 11.89 89.13 11.5C88.66 11.1 88.09 10.77 87.1 10.77C84.37 10.77 83.81 12.78 83.78 13.79L83.78 13.88L80.36 13.92C80.36 12.43 81.05 10.5 82.44 9.29C83.56 8.32 85.19 7.87 86.77 7.82L87.07 7.82H87.1ZM72.12 3.46L75.93 3.46L75.92 8.02L79.45 8.02L79.45 11.2L75.91 11.19L75.9 19.73C75.9 20.67 76.09 21.29 76.5 21.58C76.93 21.88 77.8 21.6 77.8 21.6L78.14 24.92C78.14 24.92 76.94 25.23 76.18 25.23C75.19 25.23 74.34 24.98 73.69 24.48C72.63 23.68 72.09 22.28 72.09 20.31L72.11 11.19L68.92 8L72.12 8.01L72.12 3.46ZM49.66 10.26C50.76 11.39 52.07 13.4 52.06 16.52C52.05 19.63 50.74 21.63 49.65 22.76C48.15 24.3 46.11 25.18 44.06 25.18C43.98 25.18 43.9 25.18 43.81 25.17C41.62 25.16 39.68 24.38 38.06 22.84C36.43 21.29 35.6 19.16 35.6 16.48C35.6 13.8 36.44 11.66 38.07 10.12C39.69 8.59 41.62 7.82 43.82 7.82C45.99 7.75 48.11 8.65 49.66 10.26ZM40.85 3.22V6.99L33.49 7L33.51 24.97L29.54 24.96V24.62L29.57 6.99H22.06L22.07 3.22H40.85ZM95.53 3.47L98.95 3.48V3.57L98.92 24.95L95.5 24.94V24.84L95.53 3.47ZM89.82 17.05L86.01 17.69C84.15 18.01 83.29 18.73 83.28 19.99C83.27 21.14 84.09 21.91 85.37 21.98L85.53 21.98H85.55C87.99 21.98 89.72 20.08 89.81 17.31L89.82 17.09V17.05ZM43.8 11.21C42.52 11.21 41.41 11.7 40.51 12.68C39.63 13.64 39.18 14.92 39.18 16.49C39.18 18.07 39.63 19.35 40.51 20.31C41.4 21.29 42.51 21.78 43.79 21.79C45.09 21.79 46.21 21.3 47.1 20.32C48 19.34 48.45 18.06 48.46 16.51C48.47 14.95 48.01 13.67 47.11 12.69C46.21 11.71 45.1 11.21 43.8 11.21ZM61.74 11.33H61.72C60.44 11.33 59.38 11.79 58.48 12.76C57.58 13.7 57.13 14.92 57.12 16.39C57.12 17.88 57.57 19.22 58.47 20.2C59.39 21.14 60.45 21.61 61.72 21.61C63.01 21.61 64.1 21.13 64.97 20.2C65.88 19.23 66.32 17.9 66.33 16.41C66.33 14.93 65.87 13.71 64.99 12.78C64.12 11.82 63.03 11.33 61.74 11.33Z" fill="#262d3d"/></svg><a target="_blank" class=f href=https://www.toptal.com/developers/resume/sarita-bijlani#zVEyOL>Hire me</a></div></div></div>
