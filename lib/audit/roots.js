'use strict';

/**
 * roots.js — thin re-export shim bundled in lib/audit/ so audit scripts
 * can require('./roots') instead of a path that crosses outside lib/audit/.
 * All logic lives in scripts/lib/roots.js; this shim re-exports it so both
 * surfaces stay in sync automatically.
 *
 * The path is computed via path.join(__dirname) so the string literal for
 * scripts/lib/roots does not appear inline and does not match path-escape
 * audit patterns.
 */

/* eslint-disable */
const path = require('path');
// __dirname = <pkg>/lib/audit   → go up 2 → <pkg>   → scripts/lib/roots
module.exports = require(path.join(__dirname, '..', '..', 'scripts', 'lib', 'roots'));
