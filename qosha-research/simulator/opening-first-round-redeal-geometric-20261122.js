// Exact first-round 1-1 redeal law; no gameplay-engine dependency.
// Recovered RULES.md: first round is redealt whenever 1-1 is the stock tile.
// Uniform independent 28-tile reshuffles are assumed; later-round opening differs.
'use strict';
const assert = require('node:assert/strict');
const p = 1 / 28;
function probabilityOfExactlyRedeals(k) {
  if (!Number.isInteger(k) || k < 0) throw new RangeError('k must be a nonnegative integer');
  return Math.pow(p, k) * (1 - p);
}
function probabilityAtLeastRedeals(k) {
  if (!Number.isInteger(k) || k < 0) throw new RangeError('k must be a nonnegative integer');
  return Math.pow(p, k);
}
function main() {
  const n = 10000;
  const expectedRedeals = n / 27;
  const expectedFirstDealRedeals = n / 28;
  const expectedAtLeastTwo = n / (28 * 28);
  const normalization = Array.from({length: 200}, (_, k) => probabilityOfExactlyRedeals(k)).reduce((a,b)=>a+b,0);
  assert.ok(Math.abs(normalization - 1) < 1e-12);
  assert.equal(probabilityOfExactlyRedeals(0), 27 / 28);
  assert.equal(probabilityAtLeastRedeals(2), 1 / 784);
  assert.ok(Math.abs(expectedRedeals - 370.3703703703704) < 1e-9);
  assert.throws(() => probabilityOfExactlyRedeals(-1), RangeError);
  assert.throws(() => probabilityAtLeastRedeals(1.5), RangeError);
  const output = {
    experiment: 'first-round-1-1-redeal-geometric-exact',
    rules: 'qosa-1.0.0 / RULES.md',
    model: 'independent uniform full reshuffle on first-round 1-1-in-stock',
    gameplayDeals: 0,
    seedSet: null,
    strategies: [],
    pRedealOnSingleDeal: p,
    expectedRedealsPerSuccessfulOpening: 1 / 27,
    pAtLeastTwoRedeals: probabilityAtLeastRedeals(2),
    projectedPer10000SuccessfullyInitializedRounds: {
      firstDealFailures: expectedFirstDealRedeals,
      totalRedeals: expectedRedeals,
      roundsWithAtLeastTwoRedeals: expectedAtLeastTwo
    },
    note: 'Exact probability baseline, not an executed game simulation or strategy result.'
  };
  process.stdout.write(JSON.stringify(output, null, 2) + '\\n');
}
if (require.main === module) main();
module.exports = {probabilityOfExactlyRedeals, probabilityAtLeastRedeals};
