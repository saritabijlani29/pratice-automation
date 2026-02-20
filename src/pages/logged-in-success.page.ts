import {type Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LoggedInSuccessPage extends BasePage {
  readonly path = '/logged-in-successfully/';
  readonly successMessage = this.page.getByText(/Congratulations.*successfully logged in/, { exact: false });
  readonly logoutLink = this.page.getByRole('link', { name: 'Log out' });

  constructor(page: Page) {
    super(page);
  }

  async getSuccessMessage(): Promise<string> {
    return this.getText(this.successMessage);
  }

  async clickLogout(): Promise<void> {
    await this.clickElement(this.logoutLink);
  }

  async isLogoutLinkVisible(): Promise<boolean> {
    return this.isVisible(this.logoutLink);
  }
}
