'use strict';
// Exact finite-support allocator for late-game hidden-world analysis.
// pool contains every tile not fixed by the visible state. Slot sizes are
// hidden opponent hand sizes followed by stockSize. Each hand/stock is an
// unordered set; seat identity is preserved. This module does not infer known
// tiles from branch ends or pass history.
const e = require('./engine');

function check(ok, message) { if (!ok) throw new Error(message || 'invalid allocation spec'); }
function tileKey(tile) { return Array.isArray(tile) ? e.tileKey(tile) : String(tile); }
function factorial(n) { let x = 1n; for (let i = 2; i <= n; i++) x *= BigInt(i); return x; }
function multinomial(total, sizes) {
  check(Number.isInteger(total) && total >= 0, 'total must be a nonnegative integer');
  check(Array.isArray(sizes) && sizes.every(x => Number.isInteger(x) && x >= 0), 'slot sizes must be nonnegative integers');
  check(sizes.reduce((a, b) => a + b, 0) === total, 'slot sizes must sum to pool length');
  return factorial(total) / sizes.reduce((den, size) => den * factorial(size), 1n);
}
function normalize(spec) {
  check(spec && Array.isArray(spec.pool), 'pool required');
  check(Array.isArray(spec.hiddenHandSizes), 'hiddenHandSizes required');
  const stockSize = spec.stockSize ?? 0;
  check(Number.isInteger(stockSize) && stockSize >= 0, 'stockSize must be nonnegative integer');
  const sizes = [...spec.hiddenHandSizes, stockSize];
  check(sizes.every(x => Number.isInteger(x) && x >= 0), 'hand sizes must be nonnegative integers');
  const pool = spec.pool.map(x => Array.isArray(x) ? x.slice() : x);
  const keys = pool.map(tileKey);
  check(new Set(keys).size === keys.length, 'pool contains duplicate tiles');
  check(sizes.reduce((a, b) => a + b, 0) === pool.length, 'unknown pool size mismatch');
  pool.sort((a, b) => tileKey(a).localeCompare(tileKey(b)));
  return { pool, sizes, hiddenHandSizes: [...spec.hiddenHandSizes], stockSize };
}
function* combinations(items, k, from = 0, picked = []) {
  if (picked.length === k) { yield picked.slice(); return; }
  const need = k - picked.length;
  for (let i = from; i <= items.length - need; i++) {
    picked.push(i);
    yield* combinations(items, k, i + 1, picked);
    picked.pop();
  }
}
function* allocateSlots(items, sizes, slot = 0, assigned = []) {
  if (slot === sizes.length - 1) {
    check(items.length === sizes[slot], 'terminal slot size mismatch');
    yield [...assigned, items.slice()];
    return;
  }
  for (const indices of combinations(items, sizes[slot])) {
    const selected = new Set(indices);
    const chosen = indices.map(i => items[i]);
    const rest = items.filter((_, i) => !selected.has(i));
    yield* allocateSlots(rest, sizes, slot + 1, [...assigned, chosen]);
  }
}
function allocationFingerprint(world) {
  const parts = world.hiddenHands.map(hand => hand.map(tileKey).sort().join(',')).concat([world.stock.map(tileKey).sort().join(',')]);
  return parts.join('|');
}
function countAllocations(spec) {
  const n = normalize(spec);
  return multinomial(n.pool.length, n.sizes);
}
function* iterateAllocations(spec) {
  const n = normalize(spec);
  for (const slots of allocateSlots(n.pool, n.sizes)) {
    yield { hiddenHands: slots.slice(0, n.hiddenHandSizes.length), stock: slots[slots.length - 1] };
  }
}
function enumerateAllocations(spec, { maxWorlds = 100000 } = {}) {
  check(Number.isInteger(maxWorlds) && maxWorlds >= 0, 'maxWorlds must be a nonnegative integer');
  const total = countAllocations(spec);
  check(total <= BigInt(maxWorlds), 'finite support ' + total + ' exceeds maxWorlds=' + maxWorlds);
  return [...iterateAllocations(spec)];
}
function hashRankedSubset(worlds, count, salt = '') {
  check(Array.isArray(worlds), 'worlds array required');
  check(Number.isInteger(count) && count >= 0 && count <= worlds.length, 'subset count out of range');
  const crypto = require('crypto');
  const fingerprints = worlds.map(allocationFingerprint);
  check(new Set(fingerprints).size === fingerprints.length, 'input worlds contain duplicate allocations');
  const ranked = worlds.map(world => {
    const fp = allocationFingerprint(world);
    const rank = crypto.createHash('sha256').update(String(salt) + '\0' + fp).digest('hex');
    return { rank, fp, world };
  }).sort((a, b) => a.rank.localeCompare(b.rank) || a.fp.localeCompare(b.fp));
  return ranked.slice(0, count).map(x => x.world);
}
module.exports = { multinomial, countAllocations, iterateAllocations, enumerateAllocations, allocationFingerprint, hashRankedSubset };
