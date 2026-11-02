'use strict';
const assert = require('node:assert/strict');
const e = require('./engine');
function test() {
  let assertions = 0;
  for (let score = 0; score <= 101; score++) {
    for (let delta = -40; delta <= 40; delta++) {
      const actual = e.applyScoreDelta(score, delta);
      assert.equal(actual, Math.max(0, score + delta), `score=${score}, delta=${delta}`); assertions++;
      assert.ok(actual >= 0, `floor violated: score=${score}, delta=${delta}`); assertions++;
      assert.equal(e.applyScoreDelta(actual, 0), actual, `zero-delta idempotence: ${score}, ${delta}`); assertions++;
      if (score + delta < 0) {
        assert.equal(actual, 0, `underflow must floor at zero: ${score}, ${delta}`); assertions++;
      } else {
        assert.equal(actual, score + delta, `non-underflow must be exact: ${score}, ${delta}`); assertions++;
      }
    }
  }
  for (let delta = -40; delta <= 40; delta++) {
    for (let score = 0; score < 101; score++) {
      assert.ok(e.applyScoreDelta(score + 1, delta) >= e.applyScoreDelta(score, delta),
        `monotonicity failed: score=${score}, delta=${delta}`); assertions++;
    }
  }
  for (let n = 1; n <= 4; n++) {
    assert.equal(e.finishMinus(Array.from({ length: n }, (_, i) => [i, i])), -10 * n); assertions++;
  }
  for (const invalid of [[], [[0, 1]], [[1, 1], [2, 3]], Array.from({ length: 5 }, (_, i) => [i, i])]) {
    assert.equal(e.finishMinus(invalid), 0); assertions++;
  }
  return { passed: true, assertions, scoreStates: 102, deltas: 81,
    scoreDeltaPairs: 102 * 81, monotonicityPairs: 81 * 101,
    finishMinusValidCases: 4, invalidFinishMinusCases: 4 };
}
if (require.main === module) process.stdout.write(JSON.stringify(test()) + '\n');
module.exports = { test };
