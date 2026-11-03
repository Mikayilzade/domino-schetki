'use strict';
const scoring = require('./match-scoring');
const ALLOWED_FINISH_MINUS = new Set([0, -10, -20, -30, -40]);
/**
 * Coded scoring convention for finish outcomes only:
 * - each seat receives its terminal hand pip sum;
 * - the finisher's hand remainder must be zero and its finish-minus is added;
 * - block outcomes are intentionally unscored because block winner/tie allocation is unresolved.
 * This maps round outcomes to score events; it does not authenticate table scoring rules.
 */
function finishOutcomeToDeltas(outcome, players = 3) {
  if (!outcome || typeof outcome !== 'object') throw new Error('round outcome required');
  if (!Number.isInteger(players) || players < 2) throw new Error('players must be >= 2');
  if (outcome.kind === 'block') return { kind: 'block-unscored', deltas: null, reason: 'block winner/tie allocation unresolved' };
  if (outcome.kind !== 'finish') throw new Error('only finish/block outcomes supported');
  const winner = outcome.playerIndex, remainders = outcome.remainders, minus = Number(outcome.minus || 0);
  if (!Number.isInteger(winner) || winner < 0 || winner >= players) throw new Error('invalid finisher index');
  if (!Array.isArray(remainders) || remainders.length !== players) throw new Error('remainder count mismatch');
  if (!ALLOWED_FINISH_MINUS.has(minus)) throw new Error('unsupported finish-minus value');
  for (const pips of remainders) if (!Number.isInteger(pips) || pips < 0) throw new Error('remainders must be nonnegative integer pips');
  if (remainders[winner] !== 0) throw new Error('finisher remainder must be zero');
  const deltas = remainders.map((pips, seat) => pips + (seat === winner ? minus : 0));
  return { kind: 'finish-scored', winnerIndex: winner, minus, deltas };
}
function validateSeatOrder(order, players) {
  if (!Array.isArray(order) || order.length !== players) throw new Error('seat order length mismatch');
  const sorted = [...order].sort((a, b) => a - b);
  if (sorted.some((seat, i) => seat !== i)) throw new Error('seat order must be a permutation');
}
/**
 * Applies mapped finish deltas as sequential PWA score events in the supplied seat order.
 * Zero deltas are skipped because the active PWA calculator returns before evaluating zero input.
 * If the PWA adapter finishes after an event, later nonzero same-round seat events remain pending.
 * The default ascending seat order is a harness convention, not a physical/table rule.
 */
function applyFinishOutcomeToMatch(entities, outcome, { seatOrder = entities.map((_, i) => i), threshold = scoring.DEFAULT_BUST_THRESHOLD } = {}) {
  const mapping = finishOutcomeToDeltas(outcome, entities.length);
  const current = entities.map(entity => ({ ...entity }));
  if (mapping.kind === 'block-unscored') return { entities: current, finished: false, unscored: true, mapping, events: [], skippedZeroSeats: [], pendingSeats: [] };
  validateSeatOrder(seatOrder, entities.length);
  const events = [], applied = new Set();
  const skippedZeroSeats = seatOrder.filter(seat => mapping.deltas[seat] === 0);
  for (const seat of skippedZeroSeats) applied.add(seat);
  let finished = false, places = [];
  for (const seat of seatOrder) {
    if (mapping.deltas[seat] === 0) continue;
    const result = scoring.evaluateQoshaScoreEvent(current, current[seat].id, mapping.deltas[seat], threshold);
    for (let i = 0; i < current.length; i++) current[i] = result.entities[i];
    events.push({ seat, entityId: current[seat].id, delta: mapping.deltas[seat], ignored: !!result.ignored, noOp: !!result.noOp });
    applied.add(seat);
    if (result.finished) { finished = true; places = result.places; break; }
  }
  return { entities: current, finished, unscored: false, mapping, events, places, skippedZeroSeats, pendingSeats: seatOrder.filter(seat => !applied.has(seat) && mapping.deltas[seat] !== 0) };
}
module.exports = { ALLOWED_FINISH_MINUS, finishOutcomeToDeltas, applyFinishOutcomeToMatch };
