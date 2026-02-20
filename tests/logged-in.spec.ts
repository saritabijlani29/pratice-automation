import { test, expect } from '../src/fixtures/base.fixture';

test.describe('Logged In Success Page', () => {
  test.beforeEach(async ({ homePage, loginPage, testUsers, page }) => {
    await homePage.navigate();
    await homePage.goToTestLoginPage();
    await loginPage.login(testUsers.valid.username, testUsers.valid.password);
    await expect(page).toHaveURL(/logged-in-successfully/);
  });

  test('success page shows expected text after login', async ({
    loggedInSuccessPage,}) => {
    const successMessage = await loggedInSuccessPage.getSuccessMessage();
    expect(successMessage).toContain('Congratulations student. You successfully logged in!');});

  test('Log out link is displayed and returns to login page', async ({
    page, loggedInSuccessPage,}) => {
    const isVisible = await loggedInSuccessPage.isLogoutLinkVisible();
    expect(isVisible).toBe(true);
    await loggedInSuccessPage.clickLogout();
    await expect(page).toHaveURL(/practice-test-login/);
  });
});
