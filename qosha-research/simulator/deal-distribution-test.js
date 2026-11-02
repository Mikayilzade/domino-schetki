'use strict';
const assert = require('node:assert/strict');
const e = require('./engine');

function choose(n, k) {
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let x = 1;
  for (let i = 1; i <= k; i++) x = x * (n - k + i) / i;
  return x;
}
function hypergeom(N, K, n) {
  return Array.from({ length: Math.min(K, n) + 1 }, (_, k) =>
    choose(K, k) * choose(N - K, n - k) / choose(N, n));
}
function withinBinomialBand(observed, n, p, z = 7) {
  const expected = n * p;
  const sd = Math.sqrt(n * p * (1 - p));
  return Math.abs(observed - expected) <= z * sd + 1;
}

function test(seedStart = 0, deals = 50000) {
  assert(Number.isInteger(seedStart) && Number.isInteger(deals) && deals >= 10000);
  const handCounts = Array.from({ length: 3 }, () => Array(7).fill(0));
  const handSums = [0, 0, 0], oneOneSeat = [0, 0, 0];
  let oneOneStock = 0, stockDouble = 0;
  const starterDoubleCounts = Array(6).fill(0);
  let starterN = 0;
  const deck = e.createDoubleSixDeck();
  const tileIndex = new Map(deck.map((tile, i) => [e.tileKey(tile), i]));
  const tilePositionCounts = Array.from({ length: 28 }, () => [0, 0, 0, 0]);
  const expected = hypergeom(28, 7, 9); // 7 doubles among 28 tiles; sample 9
  const conditional = hypergeom(27, 6, 8); // 1-1 fixed; sample 8 of remaining 27

  for (let seed = seedStart; seed < seedStart + deals; seed++) {
    const deal = e.dealThreeByNine(seed);
    const all = [...deal.hands.flat(), ...deal.stock];
    assert.equal(all.length, 28);
    assert.equal(new Set(all.map(e.tileKey)).size, 28);
    assert.equal(deal.stock.length, 1);
    deal.hands.forEach(hand => assert.equal(hand.length, 9));

    for (let p = 0; p < 3; p++) {
      const hand = deal.hands[p];
      const doubles = hand.filter(tile => tile[0] === tile[1]).length;
      handCounts[p][Math.min(doubles, 6)]++;
      handSums[p] += doubles;
      for (const tile of hand) tilePositionCounts[tileIndex.get(e.tileKey(tile))][p]++;
      if (hand.some(tile => e.tileKey(tile) === '1-1')) {
        oneOneSeat[p]++;
        starterN++;
        starterDoubleCounts[Math.min(doubles - 1, 5)]++;
      }
    }
    if (e.tileKey(deal.stock[0]) === '1-1') oneOneStock++;
    if (deal.stock[0][0] === deal.stock[0][1]) stockDouble++;
    tilePositionCounts[tileIndex.get(e.tileKey(deal.stock[0]))][3]++;
  }

  // Bins are 0,1,2,3,4,5,6+; merge the very rare 7-double hand.
  const handProbs = [...expected.slice(0, 6), expected.slice(6).reduce((a, b) => a + b, 0)];
  for (let p = 0; p < 3; p++) {
    for (let k = 0; k < 7; k++) {
      assert(withinBinomialBand(handCounts[p][k], deals, handProbs[k]),
        'seat ' + p + ' doubles bin ' + k + ': ' + handCounts[p][k]);
    }
    assert(withinBinomialBand(oneOneSeat[p], deals, 9 / 28), '1-1 seat ' + p);
  }
  assert(withinBinomialBand(oneOneStock, deals, 1 / 28), '1-1 stock');
  assert(withinBinomialBand(stockDouble, deals, 7 / 28), 'stock double');

  // Starter total doubles = 1 plus the count among its 8 other tiles.
  const starterProbs = [...conditional.slice(0, 5), conditional.slice(5).reduce((a, b) => a + b, 0)];
  for (let k = 0; k < 6; k++) {
    assert(withinBinomialBand(starterDoubleCounts[k], starterN, starterProbs[k]),
      'starter total doubles ' + (k + 1));
  }

  for (let tile = 0; tile < 28; tile++) {
    for (let p = 0; p < 3; p++) {
      assert(withinBinomialBand(tilePositionCounts[tile][p], deals, 9 / 28),
        'tile ' + deck[tile] + ' seat ' + p);
    }
    assert(withinBinomialBand(tilePositionCounts[tile][3], deals, 1 / 28), 'tile ' + deck[tile] + ' stock');
    assert.equal(tilePositionCounts[tile].reduce((a, b) => a + b, 0), deals,
      'tile ' + deck[tile] + ' placement conservation');
  }

  return {
    passed: true,
    seedStart,
    seedEnd: seedStart + deals - 1,
    deals,
    assertions: 172,
    observed: {
      meanStartingDoublesBySeat: handSums.map(sum => sum / deals),
      doubleCountBinsBySeat: handCounts,
      oneOneSeat,
      oneOneStock,
      stockDouble,
      starterN,
      starterTotalDoubleBins: starterDoubleCounts,
      tilePositionCountRange: {
        seatMin: Math.min(...tilePositionCounts.flatMap(row => row.slice(0, 3))),
        seatMax: Math.max(...tilePositionCounts.flatMap(row => row.slice(0, 3))),
        stockMin: Math.min(...tilePositionCounts.map(row => row[3])),
        stockMax: Math.max(...tilePositionCounts.map(row => row[3]))
      }
    },
    exact: {
      marginalHandDoubleCountProbabilities: handProbs,
      oneOneInEachSeat: 9 / 28,
      oneOneInStock: 1 / 28,
      stockIsDouble: 7 / 28,
      starterTotalDoubleCountProbabilities: starterProbs
    },
    method: 'Deterministic seed-range distribution smoke test with 7-sigma binomial bands and +1 count slack. Exact references are hypergeometric. This is not a proof of PRNG uniformity or strategy evidence.'
  };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  console.log(JSON.stringify(test(Number(args[0] || 0), Number(args[1] || 50000)), null, 2));
}
module.exports = { test, choose, hypergeom };
