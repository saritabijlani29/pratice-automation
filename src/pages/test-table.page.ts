import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';
import { TableComponent} from '../components/table.component';
import { test, expect } from '../fixtures/base.fixture';

export class TestTablePage extends BasePage {
  
  readonly path = '/practice-test-table/';

  // Filters
  readonly languageGroup = this.page.getByRole('group', { name: 'Language' });
  readonly levelGroup = this.page.getByRole('group', { name: 'Level' });
  readonly minEnrollmentsGroup = this.page.getByRole('group', { name: 'Min enrollments' });
  
  readonly minEnrollmentDropdownLabel = this.minEnrollmentsGroup.locator('.dropdown-label');
  readonly sortSelect = this.page.getByLabel(/sort by/i).first();
  readonly resetButton = this.page.getByRole('button', { name: /reset/i });

  // Table & empty state
  readonly tableRows = this.page.locator('#courses_table tbody tr:visible')
  readonly noMatchingMessage = this.page.getByText('No matching courses.', { exact: true });

  readonly table = this.page.locator('table');
  readonly tableComponent: TableComponent;

  constructor(page: Page) {
    super(page);
    this.tableComponent = new TableComponent(page, this.table);
  }

  async selectLanguage(language: string) {
    await this.languageGroup.getByRole('radio', { name: language }).check();
  }

  async verifySelectedLanguage(language: string) {
    await expect(this.languageGroup.getByRole('radio', { name: language })).toBeChecked();

  }

  async selectLevel(value: string): Promise<void> {
    await this.levelGroup.getByLabel(value).check();
  }

  async verifySelectedLevel(value: string) {
    await expect(this.levelGroup.getByLabel(value)).toBeChecked();
  }
  
  async unselectLevel(value: string): Promise<void> {
    await this.levelGroup.getByLabel(value).uncheck();
  }
  
  async selectMinEnrollments(dataValue: string) {
    await this.minEnrollmentsGroup.locator('[role="button"]').click();
    await this.minEnrollmentsGroup.getByText(dataValue).click();
  }

  async unselectAllLevel(): Promise<void> {
    const checkboxes = this.levelGroup.getByRole('checkbox');
    const count = await checkboxes.count();

    for (let i = 0; i < count; i++) {
      await checkboxes.nth(i).uncheck();
    }
  }

  async setSortBy(value:string): Promise<void> {
    await this.sortSelect.selectOption({ label: value });
  }

  async clickReset(): Promise<void> {
    await this.resetButton.click();
  }

  async isResetVisible(): Promise<boolean> {
    return this.resetButton.isVisible();
  }

  async isNoMatchingVisible(): Promise<boolean> {
    return this.noMatchingMessage.isVisible();
  }

  async getCourseRowsCount(): Promise<number> {
    return this.tableRows.count();
  }

  async getColumnValues(column: string): Promise<string[]> {
    const cells = this.page.locator(
      `#courses_table tbody tr:visible td[data-col="${column}"]`
    );

    return (await cells.allTextContents()).map(t => t.trim());
  }

  /** Change any filter to make Reset appear (e.g. change language). */
  async changeAnyFilter(): Promise<void> {
    await this.selectLanguage("Java");
  }

  /** Set filters to a combination that yields no matches (e.g. Python + Advanced only - no such course). */
  async setFiltersToNoResults(): Promise<void> {
    await this.selectLanguage('Python');
    await this.unselectLevel("Beginner");
    await this.unselectLevel("Intermediate");
    await this.selectLevel("Advanced");
  }

  /** Set combined filters: Python + Beginner + 10,000+. */
  async setFiltersPythonBeginner10k(): Promise<void> {
    await this.selectLanguage('Python');
    await this.unselectAllLevel();
    await this.selectLevel("Beginner")
    await this.selectMinEnrollments('10,000+');
  }

  async verifyByDefaultSelectedFilters(){
    await this.verifySelectedLanguage("Any")
    await this.verifySelectedLevel("Beginner")
    await this.verifySelectedLevel("Advanced")
    await this.verifySelectedLevel("Intermediate")    
    expect(this.minEnrollmentDropdownLabel).toHaveText('Any');

  }

}
