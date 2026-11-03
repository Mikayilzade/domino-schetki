'use strict';
const assert = require('node:assert/strict');
const e = require('./engine');
const init = require('./initializer');

const DECK_KEYS = e.createDoubleSixDeck().map(e.tileKey).sort();
let assertions = 0;
function eq(actual, expected, label) { assert.deepStrictEqual(actual, expected, label); assertions++; }
function ok(value, label) { assert.ok(value, label); assertions++; }
function keyList(tiles) { return tiles.map(e.tileKey).sort(); }
function cloneDeal(deal) { return { hands: deal.hands.map(h => h.map(t => [...t])), stock: deal.stock.map(t => [...t]) }; }
function fingerprint(deal) {
  return deal.hands.map(keyList).map(xs => xs.join(',')).join('|') + '|stock=' + keyList(deal.stock).join(',');
}
function assertFullDeal(deal, label) {
  const all = [...deal.hands.flat(), ...deal.stock];
  eq(all.length, 28, label + ': initial 28-tile count');
  eq(new Set(all.map(e.tileKey)).size, 28, label + ': initial unique identities');
  eq(keyList(all), DECK_KEYS, label + ': initial exact deck partition');
}
function removeOnce(tiles, tile, label) {
  const key = e.tileKey(tile);
  const i = tiles.findIndex(x => e.tileKey(x) === key);
  if (i < 0) throw new Error(label + ': expected tile not present: ' + key);
  return tiles.filter((_, j) => j !== i);
}
function assertReadyConservation(state, deal, loc, previousWinner, label) {
  eq(state.kind, 'ready', label + ': initialized state');
  const starter = loc.where === 'hand' ? loc.playerIndex : previousWinner;
  eq(state.starter, starter, label + ': starter is 1-1 owner or previous winner');
  eq(state.currentPlayer, (starter + 1) % 3, label + ': next player clockwise');
  eq(state.turns, 1, label + ': opening counts one completed turn');
  eq(state.outcome, null, label + ': no premature outcome');
  eq(state.stock, [], label + ': sole stock consumed');
  eq(state.openingDraw, loc.where === 'hand' ? deal.stock[0] : null,
    label + ': only hand-owned 1-1 consumes an opening draw');
  eq(state.branchState.center, [1, 1], label + ': center is 1-1');
  eq(e.SIDES.map(side => state.branchState.branches[side].active), [true, true, true, true],
    label + ': all four branches active');
  eq([...state.openingState.openedNumbers].sort((a, b) => a - b), [1],
    label + ': opening number set');

  const expectedHands = deal.hands.map(h => h.map(t => [...t]));
  if (loc.where === 'hand') {
    expectedHands[starter] = removeOnce(expectedHands[starter], [1, 1], label + ': remove starter 1-1');
    expectedHands[starter].push([...deal.stock[0]]);
  }
  const played = [[1, 1]];
  if (state.openingFollowup) {
    const f = state.openingFollowup;
    ok(f.tile[0] !== f.tile[1], label + ': follow-up is not a double');
    ok(f.tile.includes(1), label + ': follow-up matches 1');
    ok(expectedHands[starter].some(t => e.tileKey(t) === e.tileKey(f.tile)),
      label + ': follow-up came from starter hand');
    expectedHands[starter] = removeOnce(expectedHands[starter], f.tile, label + ': remove follow-up');
    played.push([...f.tile]);
    eq(state.openingPassed, false, label + ': legal follow-up not marked pass');
    eq(state.consecutivePasses, 0, label + ': follow-up resets pass count');
    eq(state.hands[starter].length, 8, label + ': starter has eight after two opening plays');
    eq(e.SIDES.map(side => state.branchState.branches[side].end),
      e.SIDES.map(side => side === f.side ? f.to : 1), label + ': only follow-up branch changes');
    eq(f.from, 1, label + ': follow-up begins at 1');
    eq(f.to, f.tile[0] === 1 ? f.tile[1] : f.tile[0], label + ': follow-up exposes opposite pip');
  } else {
    eq(state.openingPassed, true, label + ': no matching follow-up means pass');
    eq(state.consecutivePasses, 1, label + ': opening pass increments pass count');
    eq(state.hands[starter].length, 9, label + ': starter retains nine after center only');
    eq(e.SIDES.map(side => state.branchState.branches[side].end), [1, 1, 1, 1],
      label + ': pass leaves branch ends at 1');
  }
  eq(state.hands.map(keyList), expectedHands.map(keyList), label + ': exact per-seat hand inventory');
  eq(state.hands.filter((_, p) => p !== starter).map(h => h.length), [9, 9],
    label + ': non-starter hands unchanged in size');
  const all = [...state.hands.flat(), ...state.stock, ...played];
  eq(all.length, 28, label + ': 28-tile count after setup');
  eq(new Set(all.map(e.tileKey)).size, 28, label + ': no duplicate tile after setup');
  eq(keyList(all), DECK_KEYS, label + ': exact deck identities after setup');
}
function runAudit(seedStart = 12000000, deals = 2000) {
  assertions = 0;
  if (!Number.isSafeInteger(seedStart) || seedStart < 0) throw new Error('invalid seedStart');
  if (!Number.isInteger(deals) || deals < 1) throw new Error('invalid deals');
  const seen = new Map(), duplicatePairs = [];
  const counts = {
    oneOneBySeat: [0, 0, 0], oneOneInStock: 0,
    firstRoundReady: 0, firstRoundRedeal: 0,
    continuationStartsByPreviousWinner: [0, 0, 0],
    stockOneOneContinuationStartsByPreviousWinner: [0, 0, 0],
    openingFollowupPlayed: 0, openingFollowupPassed: 0,
    stockOneOneFollowupPlayed: 0, stockOneOneFollowupPassed: 0,
    missingPreviousWinnerRejected: 0
  };
  for (let seed = seedStart; seed < seedStart + deals; seed++) {
    const deal = e.dealThreeByNine(seed);
    assertFullDeal(deal, 'seed ' + seed);
    const fp = fingerprint(deal);
    if (seen.has(fp)) duplicatePairs.push({ seed, duplicateOfSeed: seen.get(fp) });
    else seen.set(fp, seed);
    const loc = init.locateOneOne(deal.hands, deal.stock);
    if (loc.where === 'hand') counts.oneOneBySeat[loc.playerIndex]++;
    else counts.oneOneInStock++;

    const firstBefore = cloneDeal(deal);
    const first = init.initializeThreePlayerRoundFromDeal({ ...deal, isFirstRound: true });
    eq(deal, firstBefore, 'seed ' + seed + ': first-round initializer does not mutate deal');
    if (loc.where === 'stock') {
      eq(first, { kind: 'redeal', reason: '1-1-in-stock-on-first-round' },
        'seed ' + seed + ': stock 1-1 triggers explicit first-round redeal');
      counts.firstRoundRedeal++;
      assertFullDeal(deal, 'seed ' + seed + ' after redeal signal');
    } else {
      assertReadyConservation(first, deal, loc, null, 'seed ' + seed + ' first-round setup');
      counts.firstRoundReady++;
    }

    if (loc.where === 'stock') {
      const missing = init.initializeThreePlayerRoundFromDeal({ ...deal, isFirstRound: false });
      eq(missing, { kind: 'unresolved', reason: 'previous-winner-required' },
        'seed ' + seed + ': stock 1-1 requires previous winner');
      counts.missingPreviousWinnerRejected++;
    }

    for (let previousWinner = 0; previousWinner < 3; previousWinner++) {
      const before = cloneDeal(deal);
      const state = init.initializeThreePlayerRoundFromDeal({
        ...deal, isFirstRound: false, previousWinnerIndex: previousWinner
      });
      eq(deal, before, 'seed ' + seed + ' winner ' + previousWinner + ': initializer does not mutate deal');
      assertReadyConservation(state, deal, loc, previousWinner,
        'seed ' + seed + ' continuation winner ' + previousWinner);
      counts.continuationStartsByPreviousWinner[previousWinner]++;
      if (loc.where === 'stock') counts.stockOneOneContinuationStartsByPreviousWinner[previousWinner]++;
      if (state.openingFollowup) {
        counts.openingFollowupPlayed++;
        if (loc.where === 'stock') counts.stockOneOneFollowupPlayed++;
      } else {
        counts.openingFollowupPassed++;
        if (loc.where === 'stock') counts.stockOneOneFollowupPassed++;
      }
    }
  }
  return {
    schema: 'qosa-initializer-redeal-conservation-audit/v1',
    engine: 'qosha-research-0.5.3',
    rules: 'recovered qosa-1.0.0 coded model; primary 3x9 + one stock; opening branch semantics provisional',
    seedStart, seedEnd: seedStart + deals - 1,
    seedDraws: deals, uniqueAllocations: seen.size, duplicateSeedPairs: duplicatePairs,
    counts, assertions,
    checks: {
      exactInitialDeckPartition: true,
      firstRoundStockOneOneRedealSignal: true,
      firstRoundRedealInputUnchanged: true,
      continuationPreviousWinnerSeatsExhausted: true,
      fullDeckConservationAfterOpening: true,
      starterHandInventoryAndClockwiseNextPlayer: true,
      openingDrawOnlyWhenOneOneOwned: true
    },
    assumptions: 'When 1-1 is in stock on the first match round, initializer returns an explicit redeal signal; actual reshuffling is caller-owned and is not simulated by this initializer. On later rounds, the previous winner takes 1-1 from stock, then follows on 1 if possible. If 1-1 is in a hand, that owner removes it, draws the sole stock tile, then follows on 1 if possible.',
    limitations: 'Deterministic finite-seed initializer implementation audit only; no physical-rule authentication, PRNG-uniformity proof, full match lifecycle, or strategy comparison. No cross-cohort allocation deduplication.'
  };
}
function test() {
  const a = runAudit(12000000, 24);
  const b = runAudit(12000000, 24);
  assert.deepStrictEqual(a, b, 'same seed range reproduces exact initializer audit');
  assert.equal(a.seedDraws, 24);
  assert.equal(a.counts.continuationStartsByPreviousWinner.reduce((x,y)=>x+y,0), 72);
  assert.equal(a.duplicateSeedPairs.length, 0);
  return { passed: true, seedDraws: 24, uniqueAllocations: a.uniqueAllocations,
    assertions: a.assertions, previousWinnerInitializations: 72,
    firstRoundRedeals: a.counts.firstRoundRedeal };
}
if (require.main === module) {
  const args = process.argv.slice(2);
  process.stdout.write(JSON.stringify(args[0] === 'test'
    ? test()
    : runAudit(Number(args[0] || 12000000), Number(args[1] || 2000)), null, 2) + '\n');
}
module.exports = { runAudit, test };
