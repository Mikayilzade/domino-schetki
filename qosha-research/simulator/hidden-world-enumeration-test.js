'use strict';
const assert = require('assert');
const e = require('./engine');
const { countAllocations, enumerateAllocations, allocationFingerprint, hashRankedSubset } = require('./hidden-world-enumeration');

const deck = e.createDoubleSixDeck();
const pool = deck.slice(0, 10);
const spec = { pool, hiddenHandSizes: [3, 3, 3], stockSize: 1 };
const before = JSON.stringify(spec);
const expected = 10n * 9n * 8n * 7n * 6n * 5n * 4n * 3n * 2n / (6n * 6n * 6n); // 10!/(3!3!3!1!) = 16,800
assert.strictEqual(countAllocations(spec), expected);
const worlds = enumerateAllocations(spec, { maxWorlds: 20000 });
assert.strictEqual(worlds.length, Number(expected));
assert.strictEqual(new Set(worlds.map(allocationFingerprint)).size, worlds.length, 'every enumerated allocation must be unique');
for (const world of worlds) {
  const all = [...world.hiddenHands.flat(), ...world.stock].map(e.tileKey);
  assert.strictEqual(all.length, 10);
  assert.strictEqual(new Set(all).size, 10, 'allocation must partition pool without repeats');
  assert.deepStrictEqual(all.slice().sort(), pool.map(e.tileKey).sort(), 'allocation must conserve exact pool');
  assert.deepStrictEqual(world.hiddenHands.map(x => x.length), [3, 3, 3]);
  assert.strictEqual(world.stock.length, 1);
}
assert.strictEqual(JSON.stringify(spec), before, 'input spec must not be mutated');
const first = hashRankedSubset(worlds, 128, 'qosha-finite-world-v1');
const second = hashRankedSubset(worlds, 128, 'qosha-finite-world-v1');
assert.deepStrictEqual(first, second, 'hash-ranked subset must be reproducible');
assert.strictEqual(new Set(first.map(allocationFingerprint)).size, 128);
assert.throws(() => enumerateAllocations(spec, { maxWorlds: 100 }), /exceeds maxWorlds/);
assert.throws(() => countAllocations({ pool: [[0, 0], [0, 0]], hiddenHandSizes: [1], stockSize: 1 }), /duplicate tiles/);
assert.throws(() => countAllocations({ pool: [[0, 0]], hiddenHandSizes: [1], stockSize: 1 }), /pool size mismatch/);
console.log(JSON.stringify({ passed: true, assertions: 10, exactAllocations: worlds.length, hashRankedSubset: first.length, seedlessReproducible: true }));
