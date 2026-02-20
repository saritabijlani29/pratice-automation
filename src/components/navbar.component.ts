import { Locator, Page } from '@playwright/test';

export class NavbarComponent {
  readonly logoutLink: Locator;

  constructor(page: Page, root?: Locator) {
    const container = root ?? page;
    this.logoutLink = container.getByRole('link', { name: 'Log out' });
  }

  async clickLogout(): Promise<void> {
    await this.logoutLink.click();
  }

  async isLogoutVisible(): Promise<boolean> {
    return this.logoutLink.isVisible();
  }
}
