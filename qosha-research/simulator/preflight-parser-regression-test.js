'use strict';
// Standalone regression for the research checkout preflight's CommonJS parse contract.
// Run: node qosha-research/simulator/preflight-parser-regression-test.js
const assert = require('node:assert/strict');
const vm = require('node:vm');
const Module = require('node:module');
const cases = [
  { name: 'ordinary CommonJS', source: "'use strict';\nmodule.exports = 1;", valid: true },
  { name: 'LF hashbang', source: '#!/usr/bin/env node\nmodule.exports = 1;', valid: true },
  { name: 'CRLF hashbang', source: '#!/usr/bin/env node\r\nmodule.exports = 1;', valid: true },
  { name: 'hashbang only at start', source: ' // prefix\n#!/usr/bin/env node\nmodule.exports = 1;', valid: false },
  { name: 'malformed JavaScript', source: 'module.exports = ;', valid: false },
  { name: 'unclosed expression', source: 'const x = (', valid: false },
];
function preflightParses(source) {
  try {
    new vm.Script(Module.wrap(source.replace(/^#![^\r\n]*/, '')));
    return true;
  } catch (error) {
    if (error instanceof SyntaxError) return false;
    throw error;
  }
}
for (const c of cases) assert.equal(preflightParses(c.source), c.valid, c.name);
console.log(JSON.stringify({ schema: 'qosha-preflight-parser-regression/v1', passed: true, cases: cases.length, node: process.version, scope: 'isolated parser only; not the 17-suite gameplay validation gate' }));
