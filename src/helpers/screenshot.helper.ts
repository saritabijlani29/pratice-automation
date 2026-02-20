/**
 * Screenshot Helper - Utility for capturing and organizing test evidence
 */

import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export class ScreenshotHelper {
  private static readonly SCREENSHOT_DIR = path.resolve(__dirname, '../../reports/screenshots');

  /**
   * Capture a screenshot and save it to organized directory structure
   * @param page Playwright page object
   * @param testName Name of the test
   * @param status Pass/fail/skip status
   * @param environment local/staging/ci
   * @returns Relative path to screenshot
   */
  static async captureScreenshot(
    page: Page,
    testName: string,
    status: 'pass' | 'fail' | 'skip',
    environment: string = 'local'
  ): Promise<string> {
    try {
      // Create directory structure: screenshots/YYYY-MM-DD/environment/
      const dateFolder = this.getDateFolder();
      const envFolder = environment.toLowerCase();
      const screenshotDir = path.join(this.SCREENSHOT_DIR, dateFolder, envFolder);

      this.ensureDirectoryExists(screenshotDir);

      // Generate filename: testName_timestamp_status.png
      const timestamp = Date.now();
      const sanitizedTestName = this.sanitizeTestName(testName);
      const filename = `${sanitizedTestName}_${timestamp}_${status}.png`;
      const filePath = path.join(screenshotDir, filename);

      // Capture screenshot
      await page.screenshot({ path: filePath });

      // Return relative path for embedding in reports
      const relativePath = `screenshots/${dateFolder}/${envFolder}/${filename}`;
      return relativePath;
    } catch (error) {
      console.error(`Failed to capture screenshot for test "${testName}":`, error);
      return '';
    }
  }

  /**
   * Get current date in YYYY-MM-DD format
   */
  private static getDateFolder(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Sanitize test name for use in filename
   */
  private static sanitizeTestName(testName: string): string {
    return testName
      .toLowerCase()
      .replace(/[^\w\s-]+/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 100); // Limit length
  }

  /**
   * Ensure directory exists, create if necessary
   */
  private static ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Get screenshot path for a given test
   */
  static getScreenshotPath(
    environment: string,
    testName: string,
    timestamp: number,
    status: string
  ): string {
    const dateFolder = new Date(timestamp).toISOString().split('T')[0];
    const sanitizedTestName = this.sanitizeTestName(testName);
    return `screenshots/${dateFolder}/${environment.toLowerCase()}/${sanitizedTestName}_${timestamp}_${status}.png`;
  }

  /**
   * Clean old screenshots (optional maintenance)
   * @param daysToKeep Number of days to retain (default: 30)
   */
  static cleanOldScreenshots(daysToKeep: number = 30): void {
    try {
      if (!fs.existsSync(this.SCREENSHOT_DIR)) {
        return;
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const dateFolders = fs.readdirSync(this.SCREENSHOT_DIR);
      for (const dateFolder of dateFolders) {
        const folderPath = path.join(this.SCREENSHOT_DIR, dateFolder);
        const folderDate = new Date(`${dateFolder}T00:00:00Z`);

        if (folderDate < cutoffDate) {
          fs.rmSync(folderPath, { recursive: true, force: true });
          console.log(`Cleaned up screenshots from ${dateFolder}`);
        }
      }
    } catch (error) {
      console.error('Failed to clean old screenshots:', error);
    }
  }

  /**
   * Convert image file to base64 for embedding
   */
  static imageToBase64(imagePath: string): string {
    try {
      const buffer = fs.readFileSync(imagePath);
      return buffer.toString('base64');
    } catch (error) {
      console.error(`Failed to read image at ${imagePath}:`, error);
      return '';
    }
  }
}
