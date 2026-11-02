'use strict';

const engine = require('./engine');

const DEFAULT_BUST_THRESHOLD = 101;

function cloneEntities(entities) {
  return entities.map(entity => ({ ...entity }));
}

function evaluateQoshaScoreEvent(entities, entityId, delta, threshold = DEFAULT_BUST_THRESHOLD) {
  if (!Array.isArray(entities) || entities.length < 2) throw new Error('at least two entities required');
  if (!Number.isFinite(delta)) throw new Error('delta must be finite');
  if (!Number.isInteger(threshold) || threshold < 1) throw new Error('threshold must be a positive integer');

  const next = cloneEntities(entities);
  const target = next.find(entity => entity.id === entityId);
  if (!target) throw new Error('unknown entity');
  if (target.exploded) return { entities: next, finished: false, ignored: true, places: [] };
  if (delta === 0) return { entities: next, finished: false, ignored: false, noOp: true, places: [] };

  target.score = engine.applyScoreDelta(Number(target.score || 0), delta);
  if (target.score >= threshold) target.exploded = true;
  if (!target.exploded) return { entities: next, finished: false, ignored: false, places: [] };

  const survivors = next.filter(entity => !entity.exploded);
  if (survivors.length > 2) return { entities: next, finished: false, ignored: false, places: [] };
  if (survivors.length === 1) {
    return {
      entities: next,
      finished: true,
      ignored: false,
      places: [{ entityId: survivors[0].id, place: 1, points: 3 }]
    };
  }
  if (survivors.length === 2) {
    const sorted = [...survivors].sort((a, b) => a.score - b.score);
    return {
      entities: next,
      finished: true,
      ignored: false,
      places: [
        { entityId: sorted[0].id, place: 1, points: 2 },
        { entityId: sorted[1].id, place: 2, points: 1 }
      ]
    };
  }

  // The observed live PWA stops when at most two remain, so a zero-survivor
  // result is outside the supported sequential flow and is deliberately not inferred.
  return { entities: next, finished: false, ignored: false, places: [], unresolved: 'zero-survivor state' };
}

module.exports = { DEFAULT_BUST_THRESHOLD, evaluateQoshaScoreEvent };
