'use strict';
// Reproducible seed schedule for the 2026-10-14 18:23 exception holdout.
// This module does NOT implement game rules or claim to replay outcomes by itself.
// Use alongside the validated qosa-research-0.5.3 engine and recorded candidate positions.
const DISCOVERY_MIN = 4200000;
const DISCOVERY_MAX = 4299999;
const WORLD_COUNT = 100;
const POLICIES = Object.freeze(['closed-branch-control', 'min-hand-pips', 'fast-doubles']);
function worldSeed(dealSeed, worldIndex) {
  if (!Number.isInteger(dealSeed) || dealSeed < DISCOVERY_MIN || dealSeed > DISCOVERY_MAX) throw new RangeError('dealSeed outside discovery range');
  if (!Number.isInteger(worldIndex) || worldIndex < 0 || worldIndex >= WORLD_COUNT) throw new RangeError('worldIndex outside holdout');
  return (0xabc12345 + Math.imul(dealSeed, 193) + Math.imul(worldIndex + 1, 0x9e3779b9)) >>> 0;
}
function pairedWorlds(dealSeed) {
  return Array.from({ length: WORLD_COUNT }, (_, i) => ({ worldIndex: i, seed: worldSeed(dealSeed, i) }));
}
module.exports = { DISCOVERY_MIN, DISCOVERY_MAX, WORLD_COUNT, POLICIES, worldSeed, pairedWorlds };
if (require.main === module) {
  const assert = require('node:assert/strict');
  assert.equal(worldSeed(4202218, 0), worldSeed(4202218, 0));
  assert.equal(new Set(pairedWorlds(4202218).map(w => w.seed)).size, WORLD_COUNT);
  assert.throws(() => worldSeed(4202218, 100), RangeError);
  console.log('Seed schedule checks passed; outcome replay requires the validated engine and position fixtures.');
}
