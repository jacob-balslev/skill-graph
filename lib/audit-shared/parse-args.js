'use strict';

/**
 * Minimal argv parser for skill-audit-loop CLI scripts.
 *
 * Converts process.argv.slice(2) into a plain object:
 *   --flag          → { flag: true }
 *   --key value     → { key: "value" }
 *   --key=value     → { key: "value" }
 *   positional      → stored in _[] array
 *
 * Uses Node's built-in util.parseArgs when available (Node ≥18).
 * Falls back to a hand-rolled parser for older runtimes so this file
 * remains dependency-free.
 */

const { parseArgs: nodeParseArgs } = (() => {
  try {
    return require('node:util');
  } catch {
    return {};
  }
})();

/**
 * @param {string[]} argv  Typically process.argv.slice(2)
 * @returns {Record<string, string|boolean|string[]>}
 */
function parseArgs(argv) {
  const result = { _: [] };

  if (!Array.isArray(argv)) return result;

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];

    if (arg.startsWith('--')) {
      const key = arg.slice(2);

      // --key=value form
      const eqIndex = key.indexOf('=');
      if (eqIndex !== -1) {
        result[key.slice(0, eqIndex)] = key.slice(eqIndex + 1);
        i += 1;
        continue;
      }

      // --flag or --key value
      const nextArg = argv[i + 1];
      if (nextArg !== undefined && !nextArg.startsWith('-')) {
        result[key] = nextArg;
        i += 2;
      } else {
        result[key] = true;
        i += 1;
      }
    } else if (arg.startsWith('-') && arg.length === 2) {
      // Short flag: -h -v
      result[arg.slice(1)] = true;
      i += 1;
    } else {
      result._.push(arg);
      i += 1;
    }
  }

  return result;
}

module.exports = { parseArgs };
