import { test, expect } from '../src/fixtures/base.fixture';

test.describe('Login', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
    await homePage.goToTestLoginPage();
  });

  test('successful login with valid credentials redirects to success page', async ({
    loginPage, loggedInSuccessPage, testUsers, page
  }) => {
    await loginPage.login(testUsers.valid.username, testUsers.valid.password);
    await expect(page).toHaveURL(/logged-in-successfully/);
    const successText = await loggedInSuccessPage.getSuccessMessage();
    expect(successText).toContain('Congratulations');
    expect(successText).toContain('successfully logged in');
  });

  test('invalid username shows error message', async ({
    loginPage, testUsers }) => {
    await loginPage.login(testUsers.invalidUsername.username, testUsers.invalidUsername.password);
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toBe('Your username is invalid!');
  });

  test('invalid password shows error message', async ({
    loginPage, testUsers }) => {
    await loginPage.login(testUsers.invalidPassword.username, testUsers.invalidPassword.password);
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toBe('Your password is invalid!');
  });

  test('empty credentials shows error message', async ({ loginPage }) => {
    await loginPage.submitWithEmptyCredentials();
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage.trim()).not.toBe('');
  });
});
