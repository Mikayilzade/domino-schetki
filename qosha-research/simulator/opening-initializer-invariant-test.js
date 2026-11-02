'use strict';
const assert = require('node:assert/strict');
const e = require('./engine');
const init = require('./initializer');

const SIDES = e.SIDES;
const DECK = e.createDoubleSixDeck().map(e.tileKey).sort();
let assertions = 0;
function eq(a, b, message) { assert.deepStrictEqual(a, b, message); assertions++; }
function ok(value, message) { assert.ok(value, message); assertions++; }
function tileList(ts) { return ts.map(e.tileKey).sort(); }
function choose(n, k) { if (k < 0 || k > n) return 0; k = Math.min(k, n-k); let x = 1; for (let i=1;i<=k;i++) x=x*(n-k+i)/i; return x; }
function dealKey(deal) {
  return deal.hands.map(h => tileList(h).join(',')).join('|') +
    '|stock=' + tileList(deal.stock).join(',');
}
function checkConservation(state, played) {
  const all = [...state.hands.flat(), ...state.stock, ...played];
  eq(all.length, 28, '28-tile count after opening');
  eq(new Set(all.map(e.tileKey)).size, 28, 'unique tile identities after opening');
  eq(all.map(e.tileKey).sort(), DECK, 'full double-six deck after opening');
}
function checkOpeningState(state, deal, loc, previousWinner) {
  eq(state.kind, 'ready', 'continuation round must initialize');
  const expectedStarter = loc.where === 'stock' ? previousWinner : loc.playerIndex;
  eq(state.starter, expectedStarter, 'starter ownership / previous-winner rule');
  eq(state.currentPlayer, (expectedStarter + 1) % 3, 'turn advances clockwise after opening');
  eq(state.turns, 1, 'opening is one completed turn');
  eq(state.stock.length, 0, 'single stock tile is consumed');
  eq(state.openingDraw, loc.where === 'hand' ? deal.stock[0] : null,
    'only a hand-owned 1-1 causes the mandatory stock draw');
  eq(state.branchState.center, [1, 1], 'center is 1-1');
  eq(SIDES.map(s => state.branchState.branches[s].active), [true, true, true, true],
    'all four branches remain active after the opening');
  eq([...state.openingState.openedNumbers].sort(), [1], 'only 1 is opened by center double');
  if (state.openingFollowup) {
    const f = state.openingFollowup;
    ok(f.tile[0] !== f.tile[1], 'mandatory follow-up is not a double');
    ok(f.tile.includes(1), 'mandatory follow-up matches 1');
    eq(state.openingPassed, false, 'legal follow-up is not a pass');
    eq(state.consecutivePasses, 0, 'legal follow-up clears pass count');
    eq(state.hands[expectedStarter].length, 8, 'starter sheds 1-1 and follow-up');
    eq(state.hands.filter((_, p) => p !== expectedStarter).map(h => h.length), [9, 9], 'other hands remain 9');
    for (const side of SIDES) {
      eq(state.branchState.branches[side], {
        active: true,
        end: side === f.side ? f.to : 1
      }, 'only selected branch changes');
    }
    eq(f.from, 1, 'follow-up begins at 1');
    eq(f.to, f.tile[0] === 1 ? f.tile[1] : f.tile[0], 'follow-up exposes other pip');
    checkConservation(state, [[1, 1], f.tile]);
  } else {
    eq(state.openingPassed, true, 'no 1-matching tile means opening pass');
    eq(state.consecutivePasses, 1, 'opening pass increments pass count');
    eq(state.hands[expectedStarter].length, 9, 'starter has 9 after draw but before follow-up');
    eq(state.hands.filter((_, p) => p !== expectedStarter).map(h => h.length), [9, 9], 'other hands remain 9');
    eq(SIDES.map(s => state.branchState.branches[s].end), [1, 1, 1, 1], 'pass leaves all branch ends unchanged');
    checkConservation(state, [[1, 1]]);
  }
  eq(state.outcome, null, 'opening itself does not prematurely finish round');
}

function checkSideSelector(deal, previousWinner, base) {
  if (!base.openingFollowup) return 0;
  const chosen = base.openingFollowup;
  let trials = 0;
  for (const targetSide of SIDES) {
    const variant = init.initializeThreePlayerRoundFromDeal({
      ...deal,
      isFirstRound: false,
      previousWinnerIndex: previousWinner,
      chooseFollowup: choices => choices.find(x =>
        x.handIndex === chosen.handIndex && e.tileKey(x.tile) === e.tileKey(chosen.tile)),
      chooseFollowupSide: sideChoices => sideChoices.find(x => x.side === targetSide)
    });
    eq(variant.kind, 'ready', 'side variant initializes');
    eq(variant.openingFollowup.side, targetSide, 'selector can choose each branch label');
    eq(e.tileKey(variant.openingFollowup.tile), e.tileKey(chosen.tile), 'side-only variant keeps tile');
    eq(variant.openingFollowup.handIndex, chosen.handIndex, 'side-only variant keeps hand index');
    eq(variant.openingFollowup.to, chosen.to, 'side-only variant keeps destination pip');
    eq(variant.hands, base.hands, 'side-only variant keeps exact hand remainder');
    eq(variant.openingDraw, base.openingDraw, 'side-only variant keeps draw');
    eq(variant.starter, base.starter, 'side-only variant keeps starter');
    eq([...variant.openingState.openedNumbers].sort(), [...base.openingState.openedNumbers].sort(), 'side-only variant keeps opening state');
    for (const side of SIDES) {
      eq(variant.branchState.branches[side], {
        active: true,
        end: side === targetSide ? chosen.to : 1
      }, 'side variant modifies only target branch');
    }
    checkConservation(variant, [[1, 1], chosen.tile]);
    trials++;
  }
  return trials;
}

function test(seedStart = 7000000, deals = 20000, sideCheckDeals = 2000) {
  assertions = 0;
  assert.ok(Number.isSafeInteger(seedStart) && seedStart >= 0);
  assert.ok(Number.isInteger(deals) && deals >= 1);
  assert.ok(Number.isInteger(sideCheckDeals) && sideCheckDeals >= 0 && sideCheckDeals <= deals);
  const seen = new Map();
  const duplicatePairs = [];
  const counts = {
    oneOneBySeat: [0, 0, 0],
    oneOneInStock: 0,
    firstRoundRedeals: 0,
    continuationRoundsReady: 0,
    openingFollowupPlayed: 0,
    openingFollowupPass: 0,
    sideVariantInitializations: 0
  };
  for (let seed = seedStart; seed < seedStart + deals; seed++) {
    const deal = e.dealThreeByNine(seed);
    const fingerprint = dealKey(deal);
    if (seen.has(fingerprint)) duplicatePairs.push({ seed, duplicateOfSeed: seen.get(fingerprint) });
    else seen.set(fingerprint, seed);
    const loc = init.locateOneOne(deal.hands, deal.stock);
    if (loc.where === 'hand') counts.oneOneBySeat[loc.playerIndex]++;
    else counts.oneOneInStock++;

    const first = init.initializeThreePlayerRoundFromDeal({ ...deal, isFirstRound: true });
    if (loc.where === 'stock') {
      eq(first.kind, 'redeal', 'first round with stock 1-1 redeals');
      eq(first.reason, '1-1-in-stock-on-first-round', 'redeal reason is explicit');
      counts.firstRoundRedeals++;
    } else {
      eq(first.kind, 'ready', 'first round with hand 1-1 initializes');
      checkOpeningState(first, deal, loc, null);
    }

    const previousWinner = seed % 3;
    if (loc.where === 'stock') {
      const missingWinner = init.initializeThreePlayerRoundFromDeal({ ...deal, isFirstRound: false });
      eq(missingWinner.kind, 'unresolved', 'stock 1-1 requires previous winner outside first round');
      eq(missingWinner.reason, 'previous-winner-required', 'missing previous winner is explicit');
    }
    const continuation = init.initializeThreePlayerRoundFromDeal({
      ...deal,
      isFirstRound: false,
      previousWinnerIndex: previousWinner
    });
    checkOpeningState(continuation, deal, loc, previousWinner);
    counts.continuationRoundsReady++;
    if (continuation.openingFollowup) counts.openingFollowupPlayed++;
    else counts.openingFollowupPass++;

    if (seed - seedStart < sideCheckDeals) {
      const sideTrials = checkSideSelector(deal, previousWinner, continuation);
      counts.sideVariantInitializations += sideTrials;
    }
  }
  const exactNoFollowupProbability = choose(21, 9) / choose(27, 9);
  const observedNoFollowupProbability = counts.openingFollowupPass / deals;
  const noFollowupExpected = deals * exactNoFollowupProbability;
  const noFollowupSd = Math.sqrt(deals * exactNoFollowupProbability * (1 - exactNoFollowupProbability));
  ok(Math.abs(counts.openingFollowupPass - noFollowupExpected) <= 7 * noFollowupSd + 1,
    'opening-pass frequency within broad 7-sigma smoke band');
  const result = {
    passed: true,
    seedStart,
    seedEnd: seedStart + deals - 1,
    seedDraws: deals,
    uniqueFullAllocations: seen.size,
    duplicateAllocationPairs: duplicatePairs.length,
    duplicatePairs,
    counts,
    exactNoFollowupProbability,
    observedNoFollowupProbability,
    assertions,
    rulesAssumption: 'Recovered qosa-1.0.0 3x9: 1-1 in hand removes it and draws the sole stock tile; 1-1 in stock starts with previous round winner; first-round stock 1-1 redeals; starter follows on 1 if possible, otherwise passes. Four side labels are treated as interchangeable only for the selector diagnostic.',
    limitation: 'Deterministic finite-seed invariant audit of the current initializer implementation; not physical-rule authentication, PRNG uniformity proof, or a strategy comparison.'
  };
  return result;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  console.log(JSON.stringify(test(Number(args[0] || 7000000), Number(args[1] || 20000), Number(args[2] || 2000)), null, 2));
}
module.exports = { test };
