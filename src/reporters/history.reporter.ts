/**
 * Custom Playwright Reporter - Captures test results to persistent JSON file
 */

import {
  Reporter,
  FullResult,
  FullConfig,
  TestCase,
  TestResult as PlaywrightTestResult,
} from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';
import {
  HistoryData,
  ExecutionRecord,
  TestResult,
  TestStatus,
} from '../models/test-result.model';

export default class HistoryReporter implements Reporter {
  private historyFilePath: string;
  private executionStartTime: Date;
  private testResults: TestResult[] = [];
  private passCount = 0;
  private failCount = 0;
  private skipCount = 0;
  private totalTests = 0;
  private workerCount = 2;  // Default: parallel

  constructor() {
    this.historyFilePath = path.resolve(__dirname, '../../execution-history.json');
    this.executionStartTime = new Date();
  }

  onBegin(config: FullConfig): void {
    // Get workers count directly from Playwright's full config
    this.workerCount = config.workers ?? 2;  // Default: parallel if undefined
    console.log(`[HistoryReporter] Test execution started (workers: ${this.workerCount})`);
  }

  onTestEnd(test: TestCase, result: PlaywrightTestResult): void {
    const status = this.getTestStatus(result);
    const testName = this.formatTestName(test.parent?.title || '', test.title);

    // Count results
    if (status === 'passed') this.passCount++;
    else if (status === 'failed') this.failCount++;
    else if (status === 'skipped') this.skipCount++;
    this.totalTests++;

    const testResult: TestResult = {
      testName,
      status,
      duration: result.duration,
      timestamp: new Date(result.startTime!).toISOString(),
      retries: result.retry,
      projectName: test.parent?.project()?.name || 'unknown',
      environment: process.env.TEST_ENV || 'local',
      screenshotPath: this.extractScreenshotPath(result),
    };

    this.testResults.push(testResult);
  }

  onEnd(result: FullResult): void {
    const endTime = new Date();
    const startTime = this.executionStartTime;
    const totalDuration = endTime.getTime() - startTime.getTime();

    // Detect execution mode based on workers
    const executionMode = this.getExecutionMode();
    const workers = this.getWorkerCount();

    const executionRecord: ExecutionRecord = {
      executionId: this.generateExecutionId(),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      totalDuration,
      environment: process.env.TEST_ENV || 'local',
      executionMode,
      workers,
      results: this.testResults,
      summary: {
        passed: this.passCount,
        failed: this.failCount,
        skipped: this.skipCount,
        total: this.totalTests,
      },
    };

    this.appendToHistory(executionRecord);
    console.log(`[HistoryReporter] Test results saved to execution-history.json (Mode: ${executionMode})`);
  }

  /**
   * Get test status from Playwright result
   */
  private getTestStatus(result: PlaywrightTestResult): TestStatus {
    if (result.status === 'skipped') return 'skipped';
    if (result.status === 'passed') return 'passed';
    return 'failed';
  }

  /**
   * Format full test name from suite and test title
   */
  private formatTestName(suiteName: string, testName: string): string {
    return suiteName ? `${suiteName} > ${testName}` : testName;
  }

  /**
   * Extract screenshot path from test attachments
   */
  private extractScreenshotPath(result: PlaywrightTestResult): string | undefined {
    if (!result.attachments) return undefined;

    // Look for screenshot-path attachment from ScreenshotHelper
    const screenshotPathAttachment = result.attachments.find(
      (attachment) => attachment.name === 'screenshot-path'
    );

    if (screenshotPathAttachment?.body) {
      return screenshotPathAttachment.body.toString();
    }

    // Fallback to standard Playwright screenshot attachments
    const screenshotAttachment = result.attachments.find(
      (attachment) =>
        attachment.name === 'screenshot' ||
        attachment.contentType?.includes('image')
    );

    return screenshotAttachment?.path;
  }

  /**
   * Generate unique execution ID with UUID and timestamp
   */
  private generateExecutionId(): string {
    const timestamp = Math.floor(Date.now() / 1000);
    // Using a simple unique ID since crypto.randomUUID might not be available
    const uuid = this.simpleUuid();
    return `exec-${timestamp}-${uuid}`;
  }

  /**
   * Generate simple UUID-like string
   */
  private simpleUuid(): string {
    return 'xxxxxxxx'.replace(/x/g, () =>
      Math.floor(Math.random() * 16).toString(16)
    );
  }

  /**
   * Add after the simpleUuid method:
   */

  /**
   * Detect execution mode based on worker count
   */
  private getExecutionMode(): 'sequential' | 'parallel' {
    const workers = this.getWorkerCount();
    return workers === 1 ? 'sequential' : 'parallel';
  }

  /**
   * Get worker count (already captured in onBegin from config)
   */
  private getWorkerCount(): number {
    return this.workerCount;
  }

  /**
   * Load existing history data from JSON file
   */
  private loadExistingHistory(): HistoryData {
    try {
      if (fs.existsSync(this.historyFilePath)) {
        const data = fs.readFileSync(this.historyFilePath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn('Failed to load existing history:', error);
    }

    return {
      executions: [],
      lastUpdated: new Date().toISOString(),
      totalRuns: 0,
    };
  }

  /**
   * Append new execution record to history
   */
  private appendToHistory(executionRecord: ExecutionRecord): void {
    try {
      const history = this.loadExistingHistory();
      history.executions.push(executionRecord);
      history.lastUpdated = new Date().toISOString();
      history.totalRuns = history.executions.length;

      // Ensure directory exists
      const dir = path.dirname(this.historyFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(this.historyFilePath, JSON.stringify(history, null, 2));
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  }
}
