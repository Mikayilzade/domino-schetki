'use strict';
const assert = require('node:assert/strict');
const cohort = require('./pass-history-current-only-cohort');
const result = cohort.test();
assert.equal(result.passed, true);
assert.ok(result.assertions >= 10);
console.log(JSON.stringify(result, null, 2));
