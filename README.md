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
<a href="https://www.toptal.com/developers/resume/sarita-bijlani#zVEyOL">Hire me on Toptal</a>
