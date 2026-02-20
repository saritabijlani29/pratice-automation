#!/usr/bin/env node

/**
 * Dashboard Generation Script
 * Parses execution-history.json and generates summary.html with D3.js charts
 */

const fs = require('fs');
const path = require('path');

// Paths
const HISTORY_FILE = path.resolve(__dirname, '../execution-history.json');
const TEMPLATE_FILE = path.resolve(__dirname, './dashboard-template.html');
const OUTPUT_FILE = path.resolve(__dirname, '../reports/summary.html');

/**
 * Main function
 */
function generateDashboard() {
  console.log('[Dashboard Generator] Starting dashboard generation...');

  // Check if history file exists
  if (!fs.existsSync(HISTORY_FILE)) {
    console.warn('[Dashboard Generator] execution-history.json not found. Creating empty dashboard.');
    createEmptyDashboard();
    return;
  }

  try {
    // Read history data
    const historyData = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    
    // Validate data
    if (!historyData.executions || historyData.executions.length === 0) {
      console.warn('[Dashboard Generator] No execution data found.');
      createEmptyDashboard();
      return;
    }

    // Read template
    const template = fs.readFileSync(TEMPLATE_FILE, 'utf-8');

    // Process data for dashboard
    const processedData = processHistoryData(historyData);

    // Generate dashboard HTML
    const dashboardHtml = template.replace(
      '{DASHBOARD_DATA_PLACEHOLDER}',
      JSON.stringify(processedData, null, 2)
    );

    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write output file
    fs.writeFileSync(OUTPUT_FILE, dashboardHtml);
    console.log(`[Dashboard Generator] Dashboard generated successfully: ${OUTPUT_FILE}`);
    console.log(`[Dashboard Generator] Total executions: ${historyData.executions.length}`);
    console.log(`[Dashboard Generator] Total tests: ${historyData.executions.reduce((sum, e) => sum + e.summary.total, 0)}`);
  } catch (error) {
    console.error('[Dashboard Generator] Error generating dashboard:', error.message);
    process.exit(1);
  }
}

/**
 * Process history data for dashboard
 */
function processHistoryData(historyData) {
  const processed = {
    executions: [],
    summary: {
      totalRuns: historyData.executions.length,
      totalTests: 0,
      totalPassed: 0,
      totalFailed: 0,
      totalSkipped: 0,
      overallPassRate: 0,
      environments: new Set(),
      dateRange: null
    }
  };

  // Process each execution
  historyData.executions.forEach((execution, index) => {
    const processedExecution = {
      ...execution,
      // Ensure timestamps are valid
      startTime: new Date(execution.startTime).toISOString(),
      endTime: new Date(execution.endTime).toISOString(),
      results: execution.results.map(result => ({
        ...result,
        timestamp: new Date(result.timestamp).toISOString(),
        // Convert relative screenshot paths to absolute if needed
        screenshotPath: normalizeScreenshotPath(result.screenshotPath)
      }))
    };

    processed.executions.push(processedExecution);

    // Accumulate summary
    processed.summary.totalTests += execution.summary.total;
    processed.summary.totalPassed += execution.summary.passed;
    processed.summary.totalFailed += execution.summary.failed;
    processed.summary.totalSkipped += execution.summary.skipped;
    processed.summary.environments.add(execution.environment);
  });

  // Convert Set to array for JSON serialization
  processed.summary.environments = Array.from(processed.summary.environments);

  // Calculate overall pass rate
  if (processed.summary.totalTests > 0) {
    processed.summary.overallPassRate = (
      (processed.summary.totalPassed / processed.summary.totalTests) * 100
    ).toFixed(2);
  }

  // Calculate date range
  if (processed.executions.length > 0) {
    const dates = processed.executions.map(e => new Date(e.startTime));
    processed.summary.dateRange = {
      start: new Date(Math.min(...dates.map(d => d.getTime()))).toLocaleDateString(),
      end: new Date(Math.max(...dates.map(d => d.getTime()))).toLocaleDateString()
    };
  }

  return processed;
}

/**
 * Normalize screenshot path
 */
function normalizeScreenshotPath(screenshotPath) {
  if (!screenshotPath) return '';

  // If it's already a base64 data URI, return as-is
  if (screenshotPath.startsWith('data:')) {
    return screenshotPath;
  }

  // If it's a relative path, check if file exists and return path
  const fullPath = path.resolve(__dirname, '../', screenshotPath);
  if (fs.existsSync(fullPath)) {
    // Return relative path for standalone HTML
    return `../${screenshotPath}`;
  }

  // Otherwise return the path as-is
  return screenshotPath;
}

/**
 * Create empty dashboard when no data is available
 */
function createEmptyDashboard() {
  try {
    const template = fs.readFileSync(TEMPLATE_FILE, 'utf-8');
    const emptyData = {
      executions: [],
      summary: {
        totalRuns: 0,
        totalTests: 0,
        totalPassed: 0,
        totalFailed: 0,
        totalSkipped: 0,
        overallPassRate: 0,
        environments: [],
        dateRange: null
      }
    };

    const dashboardHtml = template.replace(
      '{DASHBOARD_DATA_PLACEHOLDER}',
      JSON.stringify(emptyData, null, 2)
    );

    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, dashboardHtml);
    console.log(`[Dashboard Generator] Empty dashboard created: ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('[Dashboard Generator] Error creating empty dashboard:', error.message);
    process.exit(1);
  }
}

/**
 * Verify dashboard generation
 */
function verifyDashboard() {
  if (fs.existsSync(OUTPUT_FILE)) {
    const stats = fs.statSync(OUTPUT_FILE);
    console.log(`[Dashboard Generator] Verification: Dashboard file size: ${(stats.size / 1024).toFixed(2)} KB`);
    return true;
  }
  return false;
}

// Run the dashboard generator
if (require.main === module) {
  generateDashboard();
  
  setTimeout(() => {
    if (verifyDashboard()) {
      console.log('[Dashboard Generator] Dashboard generation completed successfully!');
      process.exit(0);
    } else {
      console.error('[Dashboard Generator] Dashboard file was not created.');
      process.exit(1);
    }
  }, 500);
}

module.exports = { generateDashboard };
