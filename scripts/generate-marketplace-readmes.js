#!/usr/bin/env node
/**
 * Compatibility entrypoint for the marketplace README generation step.
 *
 * The marketplace exporter owns README generation today. This wrapper keeps the
 * documented script name stable for readers and automation that still call the
 * narrower historical command.
 */

'use strict';

const { spawnSync } = require('child_process');
const path = require('path');

const exporter = path.join(__dirname, 'export-marketplace-skills.js');
const result = spawnSync(process.execPath, [exporter, ...process.argv.slice(2)], {
  cwd: process.cwd(),
  env: process.env,
  stdio: 'inherit',
});

process.exit(result.status === null ? 1 : result.status);
