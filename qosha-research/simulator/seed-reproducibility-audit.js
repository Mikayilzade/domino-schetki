'use strict';
// Reproducibility and allocation sanity audit for the research engine's 3x9+stock PRNG.
// This is not a strategy experiment and does not validate branch/score rules.
const assert = require('node:assert/strict');
const e = require('./engine');

const ANCHOR_SEEDS = [0, 1, 1898414179, 3406020, 4294967295];
const ANCHOR_HASHES = {
  0: 'c9e028a8',
  1: 'b12125a0',
  1898414179: 'e6cf8c18',
  3406020: 'f9524f00',
  4294967295: '6df34b08'
};
function orderedSignature(deal) {
  return deal.hands.map(hand => hand.map(e.tileKey).join(',')).join('|') + '#' + e.tileKey(deal.stock[0]);
}
function allocationSignature(deal) {
  return deal.hands.map(hand => hand.map(e.tileKey).sort().join(',')).join('|') + '#' + e.tileKey(deal.stock[0]);
}
function fnv1a32(text) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
function logGamma(z) {
  const p = [
    676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012,
    9.9843695780195716e-6, 1.5056327351493116e-7
  ];
  if (z < 0.5) return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z);
  z -= 1;
  let x = 0.99999999999980993;
  for (let i = 0; i < p.length; i++) x += p[i] / (z + i + 1);
  const t = z + p.length - 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}
function gammaQ(a, x) {
  if (!(a > 0) || x < 0) throw new Error('gammaQ domain');
  if (x === 0) return 1;
  const gln = logGamma(a), eps = 3e-14, fpmin = 1e-300, maxIter = 10000;
  if (x < a + 1) {
    let ap = a, del = 1 / a, sum = del;
    for (let n = 1; n <= maxIter; n++) {
      ap += 1; del *= x / ap; sum += del;
      if (Math.abs(del) < Math.abs(sum) * eps) break;
    }
    const p = sum * Math.exp(-x + a * Math.log(x) - gln);
    return 1 - p;
  }
  let b = x + 1 - a, c = 1 / fpmin, d = 1 / b, h = d;
  for (let i = 1; i <= maxIter; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b; if (Math.abs(d) < fpmin) d = fpmin;
    c = b + an / c; if (Math.abs(c) < fpmin) c = fpmin;
    d = 1 / d;
    const delta = d * c; h *= delta;
    if (Math.abs(delta - 1) < eps) break;
  }
  return Math.exp(-x + a * Math.log(x) - gln) * h;
}
function timestampBaku() {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Baku', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  }).format(new Date()) + ' +04';
}
function run(startSeed = 0, deals = 100000) {
  assert(Number.isInteger(startSeed) && startSeed >= 0 && Number.isInteger(deals) && deals > 0 && deals <= 1000000);
  const deckKeys = e.createDoubleSixDeck().map(e.tileKey);
  const stockCounts = Object.fromEntries(deckKeys.map(k => [k, 0]));
  const positionCounts = Array.from({ length: 28 }, () => Object.fromEntries(deckKeys.map(k => [k, 0])));
  const seen = new Map();
  const duplicateExamples = [];
  let conservationFailures = 0;
  for (let offset = 0; offset < deals; offset++) {
    const seed = startSeed + offset;
    const deal = e.dealThreeByNine(seed);
    const tiles = [...deal.hands.flat(), ...deal.stock].map(e.tileKey);
    if (deal.hands.length !== 3 || deal.hands.some(h => h.length !== 9) || deal.stock.length !== 1 ||
        tiles.length !== 28 || new Set(tiles).size !== 28 || deckKeys.some(k => !tiles.includes(k))) conservationFailures++;
    stockCounts[e.tileKey(deal.stock[0])]++;
    [...deal.hands.flat(), ...deal.stock].forEach((tile, position) => positionCounts[position][e.tileKey(tile)]++);
    const sig = allocationSignature(deal);
    if (seen.has(sig)) {
      if (duplicateExamples.length < 20) duplicateExamples.push({ seed, firstSeed: seen.get(sig) });
    } else seen.set(sig, seed);
  }
  const expected = deals / 28;
  const chiSquare = Object.values(stockCounts).reduce((sum, count) => sum + (count - expected) ** 2 / expected, 0);
  const positionChiSquares = positionCounts.map(counts => Object.values(counts).reduce((sum, count) => sum + (count - expected) ** 2 / expected, 0));
  const fingerprints = Object.fromEntries(ANCHOR_SEEDS.map(seed => [seed, fnv1a32(orderedSignature(e.dealThreeByNine(seed)))]));
  for (const seed of ANCHOR_SEEDS) assert.equal(fingerprints[seed], ANCHOR_HASHES[seed], 'anchor deal fingerprint ' + seed);
  for (let seed = startSeed; seed < Math.min(startSeed + deals, startSeed + 256); seed++) {
    assert.equal(orderedSignature(e.dealThreeByNine(seed)), orderedSignature(e.dealThreeByNine(seed)), 'same-seed replay ' + seed);
  }
  assert.equal(conservationFailures, 0, 'tile conservation');
  if (startSeed === 0 && deals === 100000) assert.equal(duplicateExamples.length, 0, 'duplicate allocations in preregistered 0..99999 cohort');
  return {
    schema: 'qosha-seed-reproducibility-audit/v1', timestampAsiaBaku: timestampBaku(),
    engine: 'qosa-research-0.5.3 / engine.js mixSeed32+xorshift32+Fisher-Yates',
    mode: '3 players x 9 tiles + 1 stock', startSeed, endSeed: startSeed + deals - 1,
    seedDraws: deals, uniqueAllocations: seen.size, duplicateAllocationCount: deals - seen.size,
    duplicateExamples, conservationFailures, stockTileCounts: stockCounts,
    stockCountMin: Math.min(...Object.values(stockCounts)), stockCountMax: Math.max(...Object.values(stockCounts)),
    stockCountExpected: expected, stockChiSquare: chiSquare, stockChiSquareDf: 27,
    stockChiSquareUpperTailP: gammaQ(27 / 2, chiSquare / 2),
    all28PositionsChiSquareMin: Math.min(...positionChiSquares),
    all28PositionsChiSquareMax: Math.max(...positionChiSquares),
    all28PositionsChiSquareUpperTailPMin: Math.min(...positionChiSquares.map(x => gammaQ(27 / 2, x / 2))),
    all28PositionsChiSquareUpperTailPMax: Math.max(...positionChiSquares.map(x => gammaQ(27 / 2, x / 2))),
    perPositionChiSquare: positionChiSquares, anchorFingerprints: fingerprints,
    strategyDeals: 0, fullRounds: 0, hiddenWorlds: 0,
    limitation: 'Fixed seed sweep is a reproducibility/allocation sanity check, not a proof of PRNG uniformity, independence, cryptographic quality, or game-rule correctness.'
  };
}
if (require.main === module) {
  const [start, count] = process.argv.slice(2).map(Number);
  console.log(JSON.stringify(run(Number.isFinite(start) ? start : 0, Number.isFinite(count) ? count : 100000), null, 2));
}
module.exports = { run, orderedSignature, allocationSignature, fnv1a32, gammaQ };
