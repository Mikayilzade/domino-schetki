'use strict';
const assert = require('node:assert/strict');
const e = require('./engine');
const init = require('./initializer');
const rd = require('./round-driver');
const d = require('./turn-dispatcher');
const t = require('./turn-kernel');

const DECK_KEYS = e.createDoubleSixDeck().map(e.tileKey).sort();
let assertions = 0;
function eq(actual, expected, label) { assert.deepStrictEqual(actual, expected, label); assertions++; }
function ok(value, label) { assert.ok(value, label); assertions++; }
function keys(tiles) { return tiles.map(e.tileKey).sort(); }
function cloneDeal(deal) { return { hands: deal.hands.map(h => h.map(x => [...x])), stock: deal.stock.map(x => [...x]) }; }
function dealFingerprint(deal) {
  return deal.hands.map(h => keys(h).join(',')).join('|') + '|stock=' + keys(deal.stock).join(',');
}
function assertDeal(deal, label) {
  const all = [...deal.hands.flat(), ...deal.stock];
  eq(all.length, 28, label + ': 28 initial tiles');
  eq(new Set(all.map(e.tileKey)).size, 28, label + ': unique tile identities');
  eq(keys(all), DECK_KEYS, label + ': exact double-six partition');
}
function removeOnce(tiles, tile, label) {
  const key = e.tileKey(tile), i = tiles.findIndex(x => e.tileKey(x) === key);
  if (i < 0) throw new Error(label + ': tile missing ' + key);
  return tiles.filter((_, j) => j !== i);
}
function project(s) {
  return {
    center: s.branchState.center,
    branches: e.SIDES.map(side => [side, s.branchState.branches[side].active, s.branchState.branches[side].end]),
    opened: [...s.openingState.openedNumbers].sort((a,b)=>a-b),
    hands: s.hands.map(h => keys(h)), stock: keys(s.stock),
    currentPlayer: s.currentPlayer, consecutivePasses: s.consecutivePasses,
    turns: s.turns, outcome: s.outcome
  };
}
function deterministicChoice(opts, state, seed, tag) {
  if (opts.phase !== 'play' || !opts.actions.length) return null;
  const salt = Math.imul((tag + 1) >>> 0, 0x27d4eb2d) >>> 0;
  const h = e.mixSeed32((seed ^ Math.imul(state.turns + 1, 0x9e3779b9) ^ Math.imul(state.currentPlayer + 1, 0x85ebca6b) ^ salt) >>> 0);
  return opts.actions[h % opts.actions.length];
}
function firstRoundRetryLoop(startSeed, acceptedDeals, maxAttemptsPerDeal = 100) {
  let cursor = startSeed;
  const accepted = [], attemptSeeds = [], retryHistogram = {};
  let redealSignals = 0, totalAttempts = 0, maxRetryObserved = 0;
  for (let i = 0; i < acceptedDeals; i++) {
    let retries = 0, ready = null, deal = null, acceptedSeed = null;
    while (retries < maxAttemptsPerDeal) {
      const seed = cursor++;
      attemptSeeds.push(seed); totalAttempts++;
      deal = e.dealThreeByNine(seed); assertDeal(deal, 'first-round attempt seed ' + seed);
      const before = cloneDeal(deal);
      const result = init.initializeThreePlayerRoundFromDeal({ ...deal, isFirstRound: true });
      eq(deal, before, 'first-round attempt ' + seed + ': initializer input immutability');
      const loc = init.locateOneOne(deal.hands, deal.stock);
      if (loc.where === 'stock') {
        eq(result, { kind: 'redeal', reason: '1-1-in-stock-on-first-round' }, 'seed ' + seed + ': explicit redeal signal');
        redealSignals++; retries++;
        continue;
      }
      eq(result.kind, 'ready', 'seed ' + seed + ': accepted deal ready');
      eq(result.starter, loc.playerIndex, 'seed ' + seed + ': starter is 1-1 owner');
      ready = result; acceptedSeed = seed;
      break;
    }
    if (!ready) throw new Error('first-round retry cap exceeded at accepted deal ' + i);
    retryHistogram[String(retries)] = (retryHistogram[String(retries)] || 0) + 1;
    maxRetryObserved = Math.max(maxRetryObserved, retries);
    accepted.push({ seed: acceptedSeed, deal, state: ready, retries });
  }
  const seen = new Map(), duplicates = [];
  for (const x of accepted) {
    const fp = dealFingerprint(x.deal);
    if (seen.has(fp)) duplicates.push({ seed: x.seed, duplicateOfSeed: seen.get(fp) });
    else seen.set(fp, x.seed);
  }
  eq(new Set(attemptSeeds).size, attemptSeeds.length, 'retry stream never reuses a candidate seed');
  for (let i = 1; i < attemptSeeds.length; i++) eq(attemptSeeds[i], attemptSeeds[i-1] + 1, 'retry stream increments seed by exactly one');
  return {
    accepted, startSeed, endSeed: cursor - 1, acceptedDeals, totalAttempts,
    redealSignals, maxRetryObserved, retryHistogram,
    uniqueAllocations: seen.size, duplicateSeedPairs: duplicates,
    attemptSeeds
  };
}
function assertOpeningState(state, deal, expectedStarter, loc, label) {
  eq(state.kind, 'ready', label + ': ready state');
  eq(state.starter, expectedStarter, label + ': starter');
  eq(state.currentPlayer, (expectedStarter + 1) % 3, label + ': next player clockwise');
  eq(state.turns, 1, label + ': opening counts one turn');
  eq(state.outcome, null, label + ': no opening outcome');
  eq(state.stock, [], label + ': stock consumed during setup');
  eq(state.branchState.center, [1,1], label + ': center 1-1');
  eq([...state.openingState.openedNumbers].sort((a,b)=>a-b), [1], label + ': opened number set');
  eq(state.openingDraw, loc.where === 'hand' ? deal.stock[0] : null, label + ': opening draw contract');
  const expectedHands = deal.hands.map(h => h.map(x => [...x]));
  if (loc.where === 'hand') {
    expectedHands[expectedStarter] = removeOnce(expectedHands[expectedStarter], [1,1], label + ': remove 1-1');
    expectedHands[expectedStarter].push([...deal.stock[0]]);
  }
  const played = new Set(['1-1']);
  if (state.openingFollowup) {
    const f = state.openingFollowup;
    ok(f.tile[0] !== f.tile[1] && f.tile.includes(1), label + ': follow-up is a non-double matching 1');
    const origin = [...deal.hands[expectedStarter], ...(loc.where === 'hand' ? deal.stock : [])];
    ok(origin.some(x => e.tileKey(x) === e.tileKey(f.tile)), label + ': follow-up originates in starter inventory');
    expectedHands[expectedStarter] = removeOnce(expectedHands[expectedStarter], f.tile, label + ': remove follow-up');
    played.add(e.tileKey(f.tile));
    eq(state.openingPassed, false, label + ': follow-up not pass');
    eq(state.consecutivePasses, 0, label + ': follow-up resets pass count');
    eq(state.hands[expectedStarter].length, 8, label + ': starter has eight after follow-up');
    eq(state.branchState.branches[f.side].end, f.to, label + ': follow-up side end');
    eq(f.from, 1, label + ': follow-up begins at 1');
    eq(f.to, f.tile[0] === 1 ? f.tile[1] : f.tile[0], label + ': follow-up exposes other pip');
    for (const side of e.SIDES.filter(s => s !== f.side)) eq(state.branchState.branches[side].end, 1, label + ': other branch unchanged ' + side);
  } else {
    eq(state.openingPassed, true, label + ': no follow-up marks pass');
    eq(state.consecutivePasses, 1, label + ': opening pass count');
    eq(state.hands[expectedStarter].length, 9, label + ': starter retains nine without follow-up');
    eq(e.SIDES.map(side => state.branchState.branches[side].end), [1,1,1,1], label + ': no branch change on pass');
  }
  eq(state.hands.map(h => keys(h)), expectedHands.map(h => keys(h)), label + ': exact per-seat hand inventory');
  eq(state.hands.filter((_,p)=>p!==expectedStarter).map(h=>h.length), [9,9], label + ': non-starter hand sizes');
  return played;
}
function assertInventory(state, played, stats, label) {
  const all = [...state.hands.flat(), ...state.stock, ...[...played].map(k => k.split('-').map(Number))];
  eq(all.length, 28, label + ': all 28 tiles present');
  eq(new Set(all.map(e.tileKey)).size, 28, label + ': no duplicate tile identities');
  eq(keys(all), DECK_KEYS, label + ': exact tile identities conserved');
  stats.inventorySnapshots++;
}
function auditTwoClockwiseTurns(initial, deal, loc, seed, tag, stats, label) {
  let state = rd.cloneRoundState(initial);
  const starter = initial.starter;
  const played = assertOpeningState(initial, deal, starter, loc, label + ' opening');
  assertInventory(state, played, stats, label + ' after opening');
  for (let turnIndex = 0; turnIndex < 2; turnIndex++) {
    const expectedPlayer = (starter + 1 + turnIndex) % 3;
    eq(state.currentPlayer, expectedPlayer, label + ' turn ' + turnIndex + ': clockwise seat');
    eq(state.outcome, null, label + ' turn ' + turnIndex + ': still active');
    const before = rd.cloneRoundState(state), p = state.currentPlayer;
    const opts = d.turnOptions(state.branchState, state.openingState, state.hands[p], state.stock);
    const choice = opts.phase === 'play' ? deterministicChoice(opts, state, seed, tag + turnIndex) : null;
    const tr = d.applyTurn(state.branchState, state.openingState, state.hands[p], state.stock, choice);
    const consumed = state.stock.length - tr.stock.length;
    ok(consumed === 0 || consumed === 1, label + ': at most one draw');
    eq(tr.drawn, consumed === 1, label + ': draw flag matches stock delta');
    if (tr.drawn) { eq(tr.drawnTile, state.stock[0], label + ': draw uses stock head'); stats.draws++; }
    stats.maxDrawsPerTurn = Math.max(stats.maxDrawsPerTurn, consumed);
    const local = new Set();
    for (const tile of tr.playedTiles) {
      const key = e.tileKey(tile);
      ok(!played.has(key), label + ': no tile played twice ' + key);
      ok(!local.has(key), label + ': no duplicate within action ' + key);
      ok(opts.hand.some(x => e.tileKey(x) === key), label + ': played tile came from hand/draw ' + key);
      local.add(key); played.add(key); stats.playedTileChecks++;
    }
    if (tr.passed) { eq(tr.playedTiles, [], label + ': pass plays no tile'); stats.passTurns++; }
    else { stats.actionTurns++; stats.actionTypes[tr.action.type] = (stats.actionTypes[tr.action.type] || 0) + 1; }
    const expectedPasses = tr.passed ? state.consecutivePasses + 1 : 0;
    eq(t.nextPassCount(state.consecutivePasses, tr), expectedPasses, label + ': pass counter transition');
    const manual = rd.cloneRoundState(before);
    manual.branchState = tr.branchState; manual.openingState = tr.openingState;
    manual.hands[p] = tr.hand; manual.stock = tr.stock;
    manual.consecutivePasses = expectedPasses; manual.turns++;
    manual.outcome = d.roundOutcome({ hands: manual.hands, stock: manual.stock, consecutivePasses: expectedPasses, lastPlayerIndex: p, lastTurnResult: tr, players: 3 });
    if (!manual.outcome) manual.currentPlayer = (p + 1) % 3;
    const actual = rd.stepRound(before, (o,s) => deterministicChoice(o,s,seed,tag+turnIndex));
    eq(project(actual), project(manual), label + ': round-driver/manual transition equivalence');
    stats.driverEquivalenceChecks++;
    state = actual;
    eq(state.turns, turnIndex + 2, label + ': turn count');
    eq(state.outcome, null, label + ': no finish/block within first two turns');
    eq(state.currentPlayer, (starter + 2 + turnIndex) % 3, label + ': next clockwise seat');
    assertInventory(state, played, stats, label + ' after turn ' + (turnIndex + 1));
  }
  stats.twoTurnCases++;
  return state;
}
function emptyStats() {
  return { twoTurnCases:0, inventorySnapshots:0, driverEquivalenceChecks:0, playedTileChecks:0, draws:0, maxDrawsPerTurn:0, passTurns:0, actionTurns:0, actionTypes:{}, openingFollowups:0, openingPasses:0 };
}
function runAudit({firstRoundStartSeed=13000000,firstRoundAcceptedDeals=2000,continuationStartSeed=14000000,continuationSeedDraws=2000,maxAttemptsPerDeal=100}={}) {
  assertions = 0;
  const first = firstRoundRetryLoop(firstRoundStartSeed, firstRoundAcceptedDeals, maxAttemptsPerDeal);
  const firstStats = emptyStats();
  for (let i=0;i<first.accepted.length;i++) {
    const x=first.accepted[i], loc=init.locateOneOne(x.deal.hands,x.deal.stock);
    auditTwoClockwiseTurns(x.state,x.deal,loc,x.seed,101,firstStats,'first-round accepted seed '+x.seed);
    if (x.state.openingFollowup) firstStats.openingFollowups++; else firstStats.openingPasses++;
  }
  const continuationSeen=new Map(), continuationDuplicates=[];
  const continuationStats=emptyStats();
  let continuationStockOneOne=0, continuationNonStock=0;
  let continuationInitCount=0;
  for (let seed=continuationStartSeed;seed<continuationStartSeed+continuationSeedDraws;seed++) {
    const deal=e.dealThreeByNine(seed); assertDeal(deal,'continuation allocation seed '+seed);
    const fp=dealFingerprint(deal);
    if(continuationSeen.has(fp)) continuationDuplicates.push({seed,duplicateOfSeed:continuationSeen.get(fp)}); else continuationSeen.set(fp,seed);
    const loc=init.locateOneOne(deal.hands,deal.stock);
    if(loc.where!=='stock'){continuationNonStock++;continue;}
    continuationStockOneOne++;
    for(let previousWinner=0;previousWinner<3;previousWinner++){
      const before=cloneDeal(deal);
      const state=init.initializeThreePlayerRoundFromDeal({...deal,isFirstRound:false,previousWinnerIndex:previousWinner});
      eq(deal,before,'continuation seed '+seed+' previous winner '+previousWinner+': no input mutation');
      eq(state.kind,'ready','continuation seed '+seed+': ready');
      eq(state.starter,previousWinner,'continuation seed '+seed+': previous winner starts');
      eq(state.openingDraw,null,'continuation seed '+seed+': no replacement draw');
      continuationInitCount++;
      const locNow=init.locateOneOne(deal.hands,deal.stock);
      auditTwoClockwiseTurns(state,deal,locNow,seed,1000+previousWinner*17,continuationStats,'stock-1-1 seed '+seed+' previous winner '+previousWinner);
      if(state.openingFollowup)continuationStats.openingFollowups++;else continuationStats.openingPasses++;
    }
  }
  const allStats={
    firstRound:{startSeed:first.startSeed,endSeed:first.endSeed,acceptedDeals:first.acceptedDeals,attempts:first.totalAttempts,redealSignals:first.redealSignals,maxRetryObserved:first.maxRetryObserved,retryHistogram:first.retryHistogram,uniqueAllocations:first.uniqueAllocations,duplicateSeedPairs:first.duplicateSeedPairs,attemptSeedSequence:{first:first.attemptSeeds[0],last:first.attemptSeeds[first.attemptSeeds.length-1],strictlyConsecutive:true},starterCounts:[0,0,0],...firstStats},
    continuation:{startSeed:continuationStartSeed,endSeed:continuationStartSeed+continuationSeedDraws-1,seedDraws:continuationSeedDraws,uniqueAllocations:continuationSeen.size,duplicateSeedPairs:continuationDuplicates,stockOneOneAllocations:continuationStockOneOne,nonStockOneOneAllocations:continuationNonStock,previousWinnerInitializations:continuationInitCount,...continuationStats}
  };
  for(const x of first.accepted)allStats.firstRound.starterCounts[x.state.starter]++;
  return {
    schema:'qosa-redeal-loop-clockwise-audit/v1',engine:'qosha-research-0.5.3',
    rules:'recovered qosa-1.0.0 coded model; primary 3x9 + one stock; branch/opening semantics provisional',
    seedRetryConvention:'Use monotonically increasing nonnegative safe-integer seed values. For a first-round 1-1-in-stock deal, record the redeal signal and advance to seed+1; never retry the same seed. An accepted seed is consumed, and the next requested deal starts at the next integer seed. The underlying coded PRNG maps seeds to 32 bits; this run stays far below wrap.',
    policy:'deterministic seeded index over currently legal actions; used only to exercise transitions, not as a strategy arm',
    metrics:allStats,
    assertions,
    invariantChecks:{allFirstRoundAcceptedReady:true,allStockOneOneContinuationStartsUsePreviousWinner:true,firstTwoClockwiseTurnsAudited:true,exact28TileConservation:true,roundDriverManualTransitionEquivalence:true,noDuplicatePlays:true,atMostOneDrawPerTurn:true,noPrematureFinishOrBlock:true},
    limitations:'Implementation-contract audit only. It does not authenticate physical table rules, branch semantics, block scoring, or tactical strength. Seed determinism is verified by replay; no PRNG-uniformity proof. First-round retries are caller-owned and modeled as consecutive-seed advancement.'
  };
}
function test(){
  const options={firstRoundStartSeed:13000040,firstRoundAcceptedDeals:32,continuationStartSeed:14000030,continuationSeedDraws:32,maxAttemptsPerDeal:100};
  const a=runAudit(options),b=runAudit(options);
  assert.deepStrictEqual(a,b,'identical seed windows reproduce exact audit');
  assert.equal(a.metrics.firstRound.acceptedDeals,32);
  assert.equal(a.metrics.firstRound.attempts,a.metrics.firstRound.redealSignals+32);
  assert.equal(a.metrics.firstRound.twoTurnCases,32);
  assert.equal(a.metrics.continuation.seedDraws,32);
  assert.equal(a.metrics.continuation.twoTurnCases,a.metrics.continuation.stockOneOneAllocations*3);
  assert.equal(a.metrics.continuation.previousWinnerInitializations,a.metrics.continuation.twoTurnCases);
  assert.equal(a.metrics.firstRound.maxDrawsPerTurn,0);
  assert.equal(a.metrics.continuation.maxDrawsPerTurn,0);
  return {passed:true,firstRoundAcceptedDeals:32,firstRoundAttempts:a.metrics.firstRound.attempts,redealSignals:a.metrics.firstRound.redealSignals,continuationSeedDraws:32,stockOneOneAllocations:a.metrics.continuation.stockOneOneAllocations,continuationTwoTurnCases:a.metrics.continuation.twoTurnCases,assertions:a.assertions};
}
if(require.main===module){const args=process.argv.slice(2);if(args[0]==='test')process.stdout.write(JSON.stringify(test(),null,2)+'\n');else process.stdout.write(JSON.stringify(runAudit({firstRoundStartSeed:Number(args[0]||13000000),firstRoundAcceptedDeals:Number(args[1]||2000),continuationStartSeed:Number(args[2]||14000000),continuationSeedDraws:Number(args[3]||2000)}),null,2)+'\n');}
module.exports={runAudit,test};
