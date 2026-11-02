'use strict';
const assert = require('node:assert/strict');
const { evaluateQoshaScoreEvent } = require('./match-scoring');
function test() {
  let assertions = 0, scoreDeltaCases = 0, survivorRankCases = 0, sequentialFiveCases = 0;
  const eq = (a, b, m) => { assert.equal(a, b, m); assertions++; };
  const deep = (a, b, m) => { assert.deepEqual(a, b, m); assertions++; };
  for (let score = 0; score <= 100; score++) {
    for (let delta = -40; delta <= 40; delta++) {
      if (delta === 0) continue;
      const expectedScore = Math.max(0, score + delta);
      const expectedExploded = expectedScore >= 101;
      const result = evaluateQoshaScoreEvent([
        { id: 'A', score, exploded: false },
        { id: 'B', score: 5, exploded: false },
        { id: 'C', score: 9, exploded: false }
      ], 'A', delta);
      eq(result.entities[0].score, expectedScore, 'score=' + score + ', delta=' + delta);
      eq(result.entities[0].exploded, expectedExploded, 'bust=' + score + ', delta=' + delta);
      eq(result.finished, expectedExploded, 'finish=' + score + ', delta=' + delta);
      eq(result.places.length, expectedExploded ? 2 : 0, 'places=' + score + ', delta=' + delta);
      scoreDeltaCases++;
    }
  }
  for (let score = 0; score <= 100; score++) {
    const result = evaluateQoshaScoreEvent([
      { id: 'A', score, exploded: false }, { id: 'B', score: 2, exploded: false }
    ], 'A', 0);
    eq(result.noOp, true, 'zero no-op ' + score);
    eq(result.entities[0].score, score, 'zero score ' + score);
    eq(result.entities[0].exploded, false, 'zero bust ' + score);
  }
  for (let b = 0; b <= 100; b++) {
    for (let c = 0; c <= 100; c++) {
      const result = evaluateQoshaScoreEvent([
        { id: 'A', score: 100, exploded: false },
        { id: 'B', score: b, exploded: false },
        { id: 'C', score: c, exploded: false }
      ], 'A', 1);
      const expected = b <= c ? ['B', 'C'] : ['C', 'B'];
      eq(result.finished, true, 'rank finish ' + b + '/' + c);
      deep(result.places.map(x => x.entityId), expected, 'rank ' + b + '/' + c);
      deep(result.places.map(x => [x.place, x.points]), [[1, 2], [2, 1]], 'points ' + b + '/' + c);
      survivorRankCases++;
    }
  }
  const permute = (xs) => xs.length ? xs.flatMap((x, i) => permute(xs.filter((_, j) => j !== i)).map(rest => [x, ...rest])) : [[]];
  for (const order of permute(['A', 'B', 'C', 'D', 'E'])) {
    let state = ['A', 'B', 'C', 'D', 'E'].map((id, i) => ({ id, score: i * 10, exploded: false }));
    for (let i = 0; i < 3; i++) {
      const result = evaluateQoshaScoreEvent(state, order[i], 101);
      eq(result.finished, i === 2, '5-player order=' + order.join('') + ' step=' + i);
      if (i < 2) eq(result.places.length, 0, 'premature place ' + order.join('') + ' step=' + i);
      state = result.entities;
      sequentialFiveCases++;
    }
    const survivors = state.filter(x => !x.exploded).sort((a, b) => a.score - b.score);
    const result = evaluateQoshaScoreEvent(state, order[3], 0);
    eq(result.noOp, true, 'post-result zero ' + order.join(''));
    deep(result.entities.filter(x => !x.exploded).map(x => x.id), survivors.map(x => x.id), 'survivors ' + order.join(''));
  }
  return { passed: true, assertions, scoreDeltaCases, zeroEventCases: 101, survivorRankCases, fivePlayerExplosionSteps: sequentialFiveCases, fivePlayerOrders: 120 };
}
if (require.main === module) console.log(JSON.stringify(test(), null, 2));
module.exports = { test };
