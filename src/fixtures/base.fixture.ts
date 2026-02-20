import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { LoggedInSuccessPage } from '../pages/logged-in-success.page';
import { TestTablePage } from '../pages/test-table.page';
import { users, type UserRoles } from '../test-data/users.data';
import { ScreenshotHelper } from '../helpers/screenshot.helper';

type fixture = {
  loginPage: LoginPage;
  loggedInSuccessPage: LoggedInSuccessPage;
  testTablePage: TestTablePage;
  testUsers: UserRoles;
}

export const test = base.extend<fixture>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  loggedInSuccessPage: async ({ page }, use) => {
    await use(new LoggedInSuccessPage(page));
  },
  testTablePage: async ({ page }, use) => {
    await use(new TestTablePage(page));
  },
  testUsers: async ({}, use) => {
    await use(users);
  },
});

// Automatically capture screenshots on test completion
test.afterEach(async ({ page }, testInfo) => {
  try {
    const status = testInfo.status === 'passed' ? 'pass' : 
                   testInfo.status === 'failed' ? 'fail' : 'skip';
    
    const screenshotPath = await ScreenshotHelper.captureScreenshot(
      page,
      testInfo.title,
      status,
      process.env.TEST_ENV || 'local'
    );

    if (screenshotPath) {
      // Attach the screenshot path for the reporter
      testInfo.attach('screenshot-path', {
        body: screenshotPath,
        contentType: 'text/plain',
      });
    }
  } catch (error) {
    console.warn('Failed to capture screenshot after test:', error);
  }
});

export { expect } from '@playwright/test';
