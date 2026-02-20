#!/usr/bin/env node

/**
 * Clean History Script - Remove all execution data and start fresh
 */

const fs = require('fs');
const path = require('path');

const HISTORY_FILE = path.resolve(__dirname, '../execution-history.json');
const SCREENSHOTS_DIR = path.resolve(__dirname, '../reports/screenshots');
const SUMMARY_FILE = path.resolve(__dirname, '../reports/summary.html');

function cleanHistory() {
  console.log('[Clean History] Starting cleanup...\n');

  let deleted = 0;

  // Delete execution history
  if (fs.existsSync(HISTORY_FILE)) {
    fs.unlinkSync(HISTORY_FILE);
    console.log('✅ Deleted: execution-history.json');
    deleted++;
  }

  // Delete screenshots directory
  if (fs.existsSync(SCREENSHOTS_DIR)) {
    fs.rmSync(SCREENSHOTS_DIR, { recursive: true, force: true });
    console.log('✅ Deleted: reports/screenshots/');
    deleted++;
  }

  // Delete generated dashboard
  if (fs.existsSync(SUMMARY_FILE)) {
    fs.unlinkSync(SUMMARY_FILE);
    console.log('✅ Deleted: reports/summary.html');
    deleted++;
  }

  console.log(`\n[Clean History] Cleanup completed! Deleted ${deleted} item(s)`);
  console.log('[Clean History] Ready for fresh test run!\n');
}

if (require.main === module) {
  cleanHistory();
}

module.exports = { cleanHistory };
