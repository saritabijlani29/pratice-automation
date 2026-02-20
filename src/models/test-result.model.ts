/**
 * Data models for persistent test result tracking
 */

export type TestStatus = 'passed' | 'failed' | 'skipped';

export interface TestResult {
  testName: string;
  status: TestStatus;
  duration: number; // milliseconds
  timestamp: string; // ISO 8601
  retries: number;
  projectName: string; // chromium, firefox, webkit
  environment: string; // local, staging, ci
  screenshotPath?: string; // relative path to screenshot
}

export interface ExecutionRecord {
  executionId: string; // unique identifier UUID + timestamp
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  totalDuration: number; // milliseconds
  environment: string;
  executionMode: 'sequential' | 'parallel'; // NEW: Track how tests were executed
  workers?: number; // Number of workers used
  results: TestResult[];
  summary: {
    passed: number;
    failed: number;
    skipped: number;
    total: number;
  };
}

export interface HistoryData {
  executions: ExecutionRecord[];
  lastUpdated: string; // ISO 8601
  totalRuns: number;
}
