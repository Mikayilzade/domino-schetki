'use strict';
const assert = require('assert');
const { test } = require('./finite-late-world-choice');
const result = test();
assert.strictEqual(result.passed, true);
assert.ok(result.assertions >= 7);
assert.ok(result.minimumGapSupport > 0);
assert.ok(result.equalPipSupport > 0);
console.log(JSON.stringify(result));
