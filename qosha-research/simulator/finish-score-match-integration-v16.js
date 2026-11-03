'use strict';
/**
 * Versioned finish-only adapter for the ACTIVE scoreboard-v16 Qoşa tie rule.
 * Do not score blocks; terminal hand pips + finish-minus is still provisional.
 * Manual score-entry order is sequential; later nonzero events remain pending.
 */
const { finishOutcomeToDeltas } = require('./finish-score-match-integration');
const scoring = require('./match-scoring-v16');
function applyFinishOutcomeToMatch(entities, outcome, { seatOrder = entities.map((_, i) => i), threshold = scoring.DEFAULT_BUST_THRESHOLD } = {}) {
  const mapping = finishOutcomeToDeltas(outcome, entities.length);
  const current = entities.map(entity => ({ ...entity }));
  if (mapping.kind === 'block-unscored') return { entities: current, finished: false, isDraw: false, unscored: true, mapping, events: [], places: [], skippedZeroSeats: [], pendingSeats: [] };
  if (!Array.isArray(seatOrder) || seatOrder.length !== entities.length || [...seatOrder].sort((a,b)=>a-b).some((seat,i)=>seat!==i)) throw new Error('seat order must be a permutation');
  const events = [], applied = new Set();
  const skippedZeroSeats = seatOrder.filter(seat => mapping.deltas[seat] === 0);
  for (const seat of skippedZeroSeats) applied.add(seat);
  let finished = false, isDraw = false, places = [];
  for (const seat of seatOrder) {
    if (mapping.deltas[seat] === 0) continue;
    const result = scoring.evaluateQoshaScoreEvent(current, current[seat].id, mapping.deltas[seat], threshold);
    for (let i = 0; i < current.length; i++) current[i] = result.entities[i];
    events.push({ seat, entityId: current[seat].id, delta: mapping.deltas[seat], ignored: !!result.ignored, noOp: !!result.noOp });
    applied.add(seat);
    if (result.finished) { finished = true; isDraw = !!result.isDraw; places = result.places; break; }
  }
  return { entities: current, finished, isDraw, unscored: false, mapping, events, places, skippedZeroSeats, pendingSeats: seatOrder.filter(seat => !applied.has(seat) && mapping.deltas[seat] !== 0) };
}
module.exports = { applyFinishOutcomeToMatch };
