'use strict';
/**
 * Active PWA scoreboard-v16.js tie overlay.
 * Keep the original match-scoring.js untouched so old cohorts remain replayable.
 * A tie is not a first-place win: both survivors receive 1.5 rating points.
 * The null place explicitly means "no unique first place" in this adapter.
 */
const legacy = require('./match-scoring');
function evaluateQoshaScoreEvent(entities, entityId, delta, threshold = legacy.DEFAULT_BUST_THRESHOLD) {
  const result = legacy.evaluateQoshaScoreEvent(entities, entityId, delta, threshold);
  if (!result.finished || result.places.length !== 2) return { ...result, isDraw: false };
  const survivors = result.entities.filter(entity => !entity.exploded);
  if (survivors.length === 2 && survivors[0].score === survivors[1].score) {
    return { ...result, isDraw: true, places: survivors.map(entity => ({ entityId: entity.id, place: null, points: 1.5 })) };
  }
  return { ...result, isDraw: false };
}
module.exports = { DEFAULT_BUST_THRESHOLD: legacy.DEFAULT_BUST_THRESHOLD, evaluateQoshaScoreEvent };
