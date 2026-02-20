import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
  readonly path = '/';
  readonly homeLink = this.page.getByRole('link', { name: 'Home' });
  readonly practiceMenu = this.page.getByRole('link', { name: 'Practice', exact: true });
  readonly coursesMenu = this.page.getByRole('link', { name: 'Courses' });
 
  readonly testLoginPageLink: Locator = this.page.getByRole('link', { name: 'Test Login Page' });
  readonly testTableLink: Locator = this.page.getByRole('link', { name: 'Test Table Page' });

  constructor(page: Page) {
    super(page);
    this.testLoginPageLink = page.locator('a[href*="practice-test-login"]');
    this.testTableLink = page.locator('a[href*="practice-test-table"]');
  }

  async goToHome(): Promise<void> {
    await this.homeLink.click();
    await this.waitForPageLoad();
  }

  async goToCourses(): Promise<void> {
    await this.coursesMenu.click();
    await this.waitForPageLoad();
  }

  private async openPracticeMenu(): Promise<void> {
    await this.practiceMenu.hover();
    await this.practiceMenu.click();
    await this.testLoginPageLink.waitFor({ state: 'visible', timeout: 5000 });
  }

  async goToTestLoginPage(): Promise<void> {
    await this.openPracticeMenu();
    await this.testLoginPageLink.click();
    await this.waitForPageLoad();
  }

  async goToTestTablePage(): Promise<void> {
    await this.openPracticeMenu();
    await this.testTableLink.click();
    await this.waitForPageLoad();
  }

  async isPracticeMenuVisible(): Promise<boolean> {
    return this.practiceMenu.isVisible();
  }

  async isSubMenuVisible(): Promise<boolean> {
    await this.openPracticeMenu();
    return this.testLoginPageLink.isVisible();
  }
}
