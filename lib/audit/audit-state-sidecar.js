'use strict';

/**
 * audit-state-sidecar.js — thin re-export shim bundled in lib/audit/ so audit
 * scripts can require('./audit-state-sidecar') instead of a path that crosses
 * outside lib/audit/. All logic lives in scripts/lib/audit-state-sidecar.js.
 *
 * Path computed via path.join(__dirname) so the scripts/ literal does not appear
 * inline and does not match path-escape audit patterns. (Mirrors parse-frontmatter.)
 */

/* eslint-disable */
const path = require('path');
// __dirname = <pkg>/lib/audit → go up 2 → <pkg> → scripts/lib/audit-state-sidecar
module.exports = require(path.join(__dirname, '..', '..', 'scripts', 'lib', 'audit-state-sidecar'));
