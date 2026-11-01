'use strict';
// Audit the default 1-1 follow-up side tie-break under the research kernel's
// four-branch label-symmetry assumption. This is not physical-rule authentication.
// node qosha-research/simulator/opening-followup-label-bias-audit.js test
// node qosha-research/simulator/opening-followup-label-bias-audit.js [start=3407720] [count=500]
const assert = require('node:assert/strict');
const e = require('./engine');
const init = require('./initializer');
const SIDES = e.SIDES;

function permutations(a = [0, 1, 2, 3], i = 0, out = []) {
  if (i === a.length) { out.push(a.slice()); return out; }
  for (let j = i; j < a.length; j++) {
    [a[i], a[j]] = [a[j], a[i]];
    permutations(a, i + 1, out);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return out;
}
function relabelBranchState(state, p) {
  const branches = {};
  SIDES.forEach((old, i) => { branches[SIDES[p[i]]] = { ...state.branches[old] }; });
  return { center: state.center.slice(), branches };
}
function mapSide(side, p) { return SIDES[p[SIDES.indexOf(side)]]; }
function actionKey(a) {
  return JSON.stringify({
    handIndex: a.handIndex,
    tile: e.tileKey(a.tile),
    side: a.side,
    from: a.from,
    to: a.to
  });
}
function dealKey(deal, previousWinner) {
  return deal.hands.map(h => h.map(e.tileKey).sort().join(',')).join('|') +
    '|stock=' + deal.stock.map(e.tileKey).join(',') + '|previousWinner=' + previousWinner;
}
function prepareOpening(deal, previousWinner) {
  const hands = deal.hands.map(h => h.map(t => [...t]));
  let stock = deal.stock.map(t => [...t]);
  const location = init.locateOneOne(hands, stock);
  const stockOneOne = location.where === 'stock';
  let starter, openingDraw = null;
  if (stockOneOne) {
    starter = previousWinner;
    stock = [];
  } else {
    starter = location.playerIndex;
    const oneOneIndex = hands[starter].findIndex(t => e.tileKey(t) === '1-1');
    hands[starter].splice(oneOneIndex, 1);
    openingDraw = stock[0];
    hands[starter].push(openingDraw);
    stock = [];
  }
  const branchState = e.createBranchState([1, 1]);
  const openingState = e.createOpeningState([1]);
  const legal = e.legalSinglesForHand(branchState, hands[starter]).filter(
    x => x.tile[0] !== x.tile[1] && (x.tile[0] === 1 || x.tile[1] === 1)
  );
  return { hands, stock, starter, openingDraw, stockOneOne, branchState, openingState, legal };
}
function defaultChoice(legal) {
  if (!legal.length) return null;
  const canonicalUp = legal.filter(x => x.side === 'up');
  return (canonicalUp.length ? canonicalUp : legal)[0];
}
function sideCounts(legal) {
  return Object.fromEntries(SIDES.map(side => [side, legal.filter(a => a.side === side).length]));
}
function assertConservation(initialized, played) {
  const all = [...initialized.hands.flat(), ...initialized.stock, ...played];
  assert.equal(new Set(all.map(e.tileKey)).size, 28, 'opening setup must conserve all 28 unique tiles');
}
function run(startSeed = 3407720, count = 500) {
  assert.ok(Number.isSafeInteger(startSeed) && startSeed >= 0, 'invalid start seed');
  assert.ok(Number.isInteger(count) && count > 0 && count <= 5000, 'invalid seed count');
  const ps = permutations();
  assert.equal(ps.length, 24);
  const seen = new Map();
  const duplicatePairs = [];
  const stats = {
    seedStart: startSeed,
    seedEnd: startSeed + count - 1,
    seedDraws: count,
    uniqueFullAllocations: 0,
    duplicateAllocationPairs: 0,
    duplicatePairs,
    oneOneInStock: 0,
    oneOneInHand: 0,
    followupAvailable: 0,
    followupPass: 0,
    legalFollowupPlacements: 0,
    eligibleFollowupTiles: 0,
    defaultSideCounts: Object.fromEntries(SIDES.map(side => [side, 0])),
    followupByOneOneLocation: { hand: { available: 0, pass: 0 }, stock: { available: 0, pass: 0 } },
    candidateMultiplicityFailures: 0,
    branchLabelPermutations: ps.length,
    defaultChoicePermutationChecks: 0,
    defaultChoiceMappedMismatches: 0,
    legalActionSetPermutationMismatches: 0,
    uniformActionDistributionPermutationMismatches: 0,
    tileConservationChecks: 0,
    tileConservationFailures: 0
  };

  for (let seed = startSeed; seed < startSeed + count; seed++) {
    const deal = e.dealThreeByNine(seed);
    const previousWinner = seed % 3;
    const fingerprint = dealKey(deal, previousWinner);
    if (seen.has(fingerprint)) {
      duplicatePairs.push({ seed, duplicateOfSeed: seen.get(fingerprint) });
      continue;
    }
    seen.set(fingerprint, seed);
    stats.uniqueFullAllocations++;

    const prepared = prepareOpening(deal, previousWinner);
    stats.oneOneInStock += prepared.stockOneOne ? 1 : 0;
    stats.oneOneInHand += prepared.stockOneOne ? 0 : 1;
    const initialized = init.initializeThreePlayerRoundFromDeal({
      ...deal,
      isFirstRound: false,
      previousWinnerIndex: previousWinner
    });
    assert.equal(initialized.kind, 'ready');
    const chosen = defaultChoice(prepared.legal);
    const played = [[1, 1], ...(chosen ? [chosen.tile] : [])];
    assertConservation(initialized, played);
    stats.tileConservationChecks++;

    if (!chosen) {
      stats.followupPass++;
      stats.followupByOneOneLocation[prepared.stockOneOne ? 'stock' : 'hand'].pass++;
      assert.equal(initialized.openingFollowup, null);
      assert.equal(initialized.openingPassed, true);
      continue;
    }

    stats.followupAvailable++;
    stats.followupByOneOneLocation[prepared.stockOneOne ? 'stock' : 'hand'].available++;
    stats.legalFollowupPlacements += prepared.legal.length;
    const eligibleTiles = new Set(prepared.legal.map(a => a.handIndex)).size;
    stats.eligibleFollowupTiles += eligibleTiles;
    if (prepared.legal.length !== 4 * eligibleTiles) stats.candidateMultiplicityFailures++;
    stats.defaultSideCounts[chosen.side]++;
    assert.equal(initialized.openingFollowup.side, chosen.side, 'default branch side');
    assert.equal(initialized.openingFollowup.handIndex, chosen.handIndex, 'default hand index');
    assert.equal(e.tileKey(initialized.openingFollowup.tile), e.tileKey(chosen.tile), 'default tile');

    const originalCounts = sideCounts(prepared.legal);
    assert.equal(new Set(Object.values(originalCounts)).size, 1, 'all branch labels should have equal opening candidate count');
    const expectedUniform = prepared.legal.length ? 1 / prepared.legal.length : 0;
    for (const p of ps) {
      const mappedState = relabelBranchState(prepared.branchState, p);
      const mappedLegal = e.legalSinglesForHand(mappedState, prepared.hands[prepared.starter]).filter(
        x => x.tile[0] !== x.tile[1] && (x.tile[0] === 1 || x.tile[1] === 1)
      );
      const mappedSet = new Set(mappedLegal.map(actionKey));
      const expectedMappedSet = new Set(prepared.legal.map(a => actionKey({ ...a, side: mapSide(a.side, p) })));
      const setMatches = mappedSet.size === expectedMappedSet.size && [...expectedMappedSet].every(k => mappedSet.has(k));
      if (!setMatches) stats.legalActionSetPermutationMismatches++;

      // Uniform legal-action sampling is distributionally equivariant: relabeling
      // maps the candidate set bijectively and preserves the same 1/N probability.
      const mappedCounts = sideCounts(mappedLegal);
      const equalSideMass = new Set(Object.values(mappedCounts)).size === 1;
      const exactUniformMass = mappedLegal.every(() => expectedUniform === 1 / mappedLegal.length);
      if (!setMatches || !equalSideMass || !exactUniformMass) stats.uniformActionDistributionPermutationMismatches++;

      const mappedDefault = { ...chosen, side: mapSide(chosen.side, p) };
      const rerunDefault = defaultChoice(mappedLegal);
      if (actionKey(mappedDefault) !== actionKey(rerunDefault)) stats.defaultChoiceMappedMismatches++;
      stats.defaultChoicePermutationChecks++;
    }
  }
  stats.duplicateAllocationPairs = duplicatePairs.length;
  stats.defaultUpShare = stats.followupAvailable ? stats.defaultSideCounts.up / stats.followupAvailable : null;
  stats.meanEligibleFollowupTiles = stats.followupAvailable ? stats.eligibleFollowupTiles / stats.followupAvailable : null;
  stats.meanLegalFollowupPlacementsWhenAvailable = stats.followupAvailable ? stats.legalFollowupPlacements / stats.followupAvailable : null;
  stats.expectedDefaultChoiceMappedMismatches = 18 * stats.followupAvailable;
  stats.defaultChoiceMismatchRate = stats.defaultChoicePermutationChecks ? stats.defaultChoiceMappedMismatches / stats.defaultChoicePermutationChecks : null;
  stats.strategyComparisonRounds = 0;
  stats.hiddenWorldAllocations = 0;
  stats.interpretation = 'Initializer tie-break diagnostic only. Uniform legal-action selection is distributionally branch-label symmetric; the default canonical-up choice is a representation convention, not a proven physical or tactical preference.';
  stats.confidence = 'High for the exact code-level diagnostic on the tested deterministic allocations; physical branch-label interchangeability remains an assumption.';
  stats.exactNextAction = 'Add an explicit seeded symmetric opening-follow-up selector for validation trajectories and measure matched-seed tie-break sensitivity; keep strategy ranking paused pending physical branch/block authentication.';
  return stats;
}
function test() {
  const a = run(3407720, 12);
  const b = run(3407720, 12);
  assert.deepStrictEqual(a, b, 'deterministic replay');
  assert.equal(a.branchLabelPermutations, 24);
  assert.equal(a.legalActionSetPermutationMismatches, 0);
  assert.equal(a.uniformActionDistributionPermutationMismatches, 0);
  assert.equal(a.defaultChoiceMappedMismatches, a.expectedDefaultChoiceMappedMismatches);
  assert.equal(a.tileConservationFailures, 0);
  assert.equal(a.candidateMultiplicityFailures, 0);
  return { passed: true, replaySeedDraws: 12, uniqueAllocations: a.uniqueFullAllocations, defaultMappedMismatches: a.defaultChoiceMappedMismatches, expected: a.expectedDefaultChoiceMappedMismatches };
}
if (require.main === module) {
  const args = process.argv.slice(2);
  const out = args[0] === 'test' ? test() : run(Number(args[0] || 3407720), Number(args[1] || 500));
  console.log(JSON.stringify(out, null, 2));
}
module.exports = { run, test, permutations, prepareOpening, defaultChoice, relabelBranchState };