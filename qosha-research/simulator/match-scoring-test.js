'use strict';
const assert = require('node:assert/strict');
const { DEFAULT_BUST_THRESHOLD, evaluateQoshaScoreEvent } = require('./match-scoring');

function test() {
  let assertions = 0;
  const check = (actual, expected, message) => { assert.deepEqual(actual, expected, message); assertions++; };
  const eq = (actual, expected, message) => { assert.equal(actual, expected, message); assertions++; };

  eq(DEFAULT_BUST_THRESHOLD, 101, 'default bust threshold');

  let state = evaluateQoshaScoreEvent([
    { id: 'A', score: 99, exploded: false },
    { id: 'B', score: 12, exploded: false },
    { id: 'C', score: 30, exploded: false }
  ], 'A', 1);
  eq(state.entities[0].score, 100, 'one below bust threshold');
  eq(state.entities[0].exploded, false, '100 remains alive');
  eq(state.finished, false, 'no finish at 100');
  const noOp = evaluateQoshaScoreEvent(state.entities, 'A', 0);
  eq(noOp.noOp, true, 'zero score input is a no-op');
  eq(noOp.entities[0].exploded, false, 'zero input does not trigger bust');

  state = evaluateQoshaScoreEvent([
    { id: 'A', score: 100, exploded: false },
    { id: 'B', score: 12, exploded: false },
    { id: 'C', score: 30, exploded: false }
  ], 'A', 1);
  eq(state.entities[0].score, 101, 'threshold score');
  eq(state.entities[0].exploded, true, '101 explodes');
  eq(state.finished, true, '3-player table ends with 2 survivors');
  check(state.places, [
    { entityId: 'B', place: 1, points: 2 },
    { entityId: 'C', place: 2, points: 1 }
  ], 'two survivors sorted by ascending score');

  state = evaluateQoshaScoreEvent([
    { id: 'A', score: 99, exploded: false },
    { id: 'B', score: 7, exploded: false }
  ], 'A', 2);
  eq(state.finished, true, '2-player table ends with 1 survivor');
  check(state.places, [{ entityId: 'B', place: 1, points: 3 }], 'last survivor receives 3 points');

  const five = [
    { id: 'A', score: 0, exploded: false }, { id: 'B', score: 0, exploded: false },
    { id: 'C', score: 0, exploded: false }, { id: 'D', score: 20, exploded: false },
    { id: 'E', score: 15, exploded: false }
  ];
  let current = evaluateQoshaScoreEvent(five, 'A', 101);
  eq(current.finished, false, '5-player: first explosion leaves 4');
  current = evaluateQoshaScoreEvent(current.entities, 'B', 101);
  eq(current.finished, false, '5-player: second explosion leaves 3');
  current = evaluateQoshaScoreEvent(current.entities, 'C', 101);
  eq(current.finished, true, '5-player: third explosion leaves 2');
  check(current.places.map(p => p.entityId), ['E', 'D'], 'only survivors are placed by ascending score');

  state = evaluateQoshaScoreEvent([
    { id: 'A', score: 4, exploded: false }, { id: 'B', score: 20, exploded: false }, { id: 'C', score: 50, exploded: false }
  ], 'A', -40);
  eq(state.entities[0].score, 0, 'score floor on negative event');
  eq(state.entities[0].exploded, false, 'minus does not explode');
  eq(state.finished, false, 'minus alone does not finish match');

  state = evaluateQoshaScoreEvent([
    { id: 'A', score: 101, exploded: true }, { id: 'B', score: 10, exploded: false }
  ], 'A', 5);
  eq(state.ignored, true, 'exploded entity ignores later score events');
  eq(state.entities[0].score, 101, 'ignored event leaves score unchanged');

  assert.throws(() => evaluateQoshaScoreEvent([{ id: 'A', score: 0 }, { id: 'B', score: 0 }], 'X', 1), /unknown entity/); assertions++;
  assert.throws(() => evaluateQoshaScoreEvent([{ id: 'A', score: 0 }, { id: 'B', score: 0 }], 'A', Infinity), /finite/); assertions++;

  return { passed: true, assertions, cases: ['101 threshold','3-player places','last survivor bonus','5-player sequence','score floor','exploded-event guard'] };
}
if (require.main === module) process.stdout.write(JSON.stringify(test()) + '\n');
module.exports = { test };
