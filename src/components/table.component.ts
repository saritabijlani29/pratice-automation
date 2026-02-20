import { Page, Locator, expect } from '@playwright/test';

export class TableComponent {
  private readonly page: Page;
  private readonly table: Locator;

  constructor(page: Page, tableLocator?: Locator) {
    this.page = page;

    // Default to accessible table role if not provided
    this.table = tableLocator ?? page.getByRole('table');
  }

  private normalizeKey(header: string): string {
    return header.trim().toLowerCase().replace(/\s+/g, '');
  }

  // ===== LOCATORS USING ROLES =====

  private get headerLocator(): Locator {
    return this.table.getByRole('columnheader');
  }

  private get allRows(): Locator {
    return this.table.getByRole('row');
  }

  // Skip header row (index 0)
  private async getDataRows(): Promise<Locator[]> {
    const rows = this.allRows;
    const count = await rows.count();

    const dataRows: Locator[] = [];

    for (let i = 1; i < count; i++) {
      const row = rows.nth(i);
      if (await row.isVisible()) {
        dataRows.push(row);
      }
    }

    return dataRows;
  }

  // ===== CORE METHODS =====

  async getVisibleRowCount(): Promise<number> {
    const rows = await this.getDataRows();
    return rows.length;
  }

  async getTableData(): Promise<Record<string, any>[]> {
    const headers = await this.headerLocator.allTextContents();
    const normalizedHeaders = headers.map(h => this.normalizeKey(h));

    const rows = await this.getDataRows();
    const tableData: Record<string, any>[] = [];

    for (const row of rows) {
      const cells = await row.getByRole('cell').allTextContents();

      const rowObject: Record<string, any> = {};

      normalizedHeaders.forEach((header, index) => {
        rowObject[header] = cells[index]?.trim();
      });

      tableData.push(rowObject);
    }

    return tableData;
  }

  // ===== COLUMN VALIDATION HELPERS =====

  async validateColumnEquals(column: string, expectedValue: string) {
    const data = await this.getTableData();
    const key = this.normalizeKey(column);

    for (const row of data) {
      expect(row[key]).toBe(expectedValue);
    }
  }

  async validateColumnContains(column: string, expectedValue: string) {
    const data = await this.getTableData();
    const key = this.normalizeKey(column);

    for (const row of data) {
      expect(row[key]).toContain(expectedValue);
    }
  }

  async validateColumnNumericGreaterOrEqual(
    column: string,
    minValue: number
  ) {
    const data = await this.getTableData();
    const key = this.normalizeKey(column);

    for (const row of data) {
      const numericValue = Number(
        String(row[key]).replace(/,/g, '').trim()
      );

      expect(numericValue).toBeGreaterThanOrEqual(minValue);
    }
  }
}