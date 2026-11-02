'use strict';
// Counterfactual current-only branch model. Not a claim about physical rules.
// Exact pass support is filtered separately for global-ever-open/current-only;
// candidate comparisons are eligible only on joint support.
const e = require('./engine'), init = require('./initializer'), d = require('./turn-dispatcher');
const rd = require('./round-driver'), support = require('./pass-history-conditioned-support');
const SIDES = e.SIDES, DECK = e.createDoubleSixDeck(), DECK_KEYS = DECK.map(e.tileKey).sort();
const check = (ok, message) => { if (!ok) throw new Error(message || 'assertion failed'); };

function cloneOpenedAt(map) { return new Map([...map].map(([n, sides]) => [n, new Set(sides)])); }
function clonePasses(passes) {
  return passes.map(p => ({ ...p, forbiddenGlobal: p.forbiddenGlobal.slice(),
    forbiddenCurrent: p.forbiddenCurrent.slice(), branchEnds: { ...p.branchEnds }, openedNumbers: p.openedNumbers.slice() }));
}
function currentOnlyActions(branch, opening, openedAtDouble, hand) {
  return d.actionsForHand(branch, opening, hand).filter(a =>
    a.type !== 'single' && a.type !== 'mixed-finish' || !!openedAtDouble.get(a.from)?.has(a.side));
}
function currentOnlyTurnOptions(branch, opening, openedAtDouble, hand, stock) {
  let h = hand.map(t => t.slice()), s = stock.map(t => t.slice());
  let actions = currentOnlyActions(branch, opening, openedAtDouble, h);
  if (actions.length) return { phase: 'play', drawn: false, drawnTile: null, hand: h, stock: s, actions };
  if (s.length) {
    const drawnTile = s[0].slice(); h = [...h, drawnTile]; s = s.slice(1);
    actions = currentOnlyActions(branch, opening, openedAtDouble, h);
    return { phase: actions.length ? 'play' : 'pass', drawn: true, drawnTile, hand: h, stock: s, actions };
  }
  return { phase: 'pass', drawn: false, drawnTile: null, hand: h, stock: s, actions: [] };
}
function recordPass(state, player, playedKeys, openedAtDouble, history, turn = state.turns) {
  check(state.stock.length === 0, 'only no-stock pass observations are used');
  const g = support.legalMask(state.branchState, state.openingState, openedAtDouble, playedKeys, 'global-ever-open');
  const c = support.legalMask(state.branchState, state.openingState, openedAtDouble, playedKeys, 'current-only');
  check(c.every(k => g.includes(k)), 'current-only pass mask must be a subset of global');
  check(!state.hands[player].some(t => c.includes(e.tileKey(t))), 'current-only pass contains a legal tile');
  history.push({ player, turn, handSizeAtPass: state.hands[player].length, forbiddenGlobal: g, forbiddenCurrent: c,
    branchEnds: Object.fromEntries(SIDES.map(side => [side, state.branchState.branches[side].end])),
    openedNumbers: [...state.openingState.openedNumbers].sort((a, b) => a - b) });
}
function noteDoubles(numbers, branch, opening, openedAtDouble, turn) {
  let next = e.cloneOpeningState(opening);
  for (const n of numbers) {
    const candidates = e.candidateDoubleOpenings(branch, next, [[n, n]]);
    check(candidates.length > 0, 'double not legal in current-only trace: ' + n + ' at turn ' + turn);
    openedAtDouble.set(n, new Set(candidates[0].sides)); next = e.openNumber(next, n);
  }
}
function applyActionModel(action, state, openedAtDouble) {
  if (action.type === 'single') {
    check(openedAtDouble.get(action.from)?.has(action.side), 'single uses a locked side');
    check(d.openedSinglePlacements(state.branchState, state.openingState, action.tile)
      .some(p => p.side === action.side && p.to === action.to), 'single is not globally legal');
  } else if (action.type === 'double-sequence') {
    noteDoubles(action.numbers, state.branchState, state.openingState, openedAtDouble, state.turns);
  } else if (action.type === 'mixed-finish') {
    check(openedAtDouble.get(action.from)?.has(action.side), 'mixed prefix uses a locked side');
    noteDoubles(action.numbers, e.applySinglePlacement(state.branchState, action),
      state.openingState, openedAtDouble, state.turns);
  } else throw new Error('unknown action type: ' + action.type);
}
function chooseTopUniform(policy, options, context) {
  const rank = a => {
    const finish = a.type === 'mixed-finish' ? 1 : 0;
    const tiles = a.type === 'single' ? [a.tile] : (a.tiles || []);
    const pips = e.pipSum(tiles), doubles = tiles.filter(t => t[0] === t[1]).length;
    return policy === 'fast-doubles' ? [finish, doubles, pips] : [finish, pips];
  };
  const cmp = (a, b) => { for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const delta = (a[i] || 0) - (b[i] || 0); if (delta) return delta; } return 0; };
  let best = rank(options.actions[0]);
  for (const a of options.actions) if (cmp(rank(a), best) > 0) best = rank(a);
  const top = options.actions.filter(a => cmp(rank(a), best) === 0);
  let x = e.mixSeed32((context.seed ^ Math.imul(context.turns + 1, 0x9e3779b9) ^
    Math.imul(context.player + 1, 0x85ebca6b) ^ 0x1248) >>> 0) || 0x9e3779b9;
  const random = () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return (x >>> 0) / 0x100000000; };
  // Uniform over top-ranked actions is distributionally branch-label symmetric.
  return top[Math.floor(random() * top.length)];
}
function assertConservation(state, played, seed) {
  const all = [...state.hands.flat(), ...state.stock, ...played].map(e.tileKey).sort();
  check(all.length === 28 && new Set(all).size === 28, 'tile count/uniqueness at seed ' + seed);
  check(JSON.stringify(all) === JSON.stringify(DECK_KEYS), 'deck conservation at seed ' + seed);
}
function simulateSeed(seed, maxTurns = 100) {
  const base = init.initializeThreePlayerRound({ seed, isFirstRound: false, previousWinnerIndex: seed % 3,
    chooseFollowupSide: choices => choices[(seed >>> 0) % choices.length] });
  check(base.kind === 'ready', 'initializer did not produce ready state');
  const state = rd.cloneRoundState(base), openedAtDouble = new Map([[1, new Set(SIDES)]]);
  const playedTiles = [[1, 1]], playedEvents = [{ turn: -2, player: base.starter, tiles: [[1, 1]] }];
  const playedKeys = new Set(['1-1']), passHistory = [], eligible = [];
  if (base.openingFollowup) {
    const tile = base.openingFollowup.tile.slice(); playedTiles.push(tile);
    playedKeys.add(e.tileKey(tile)); playedEvents.push({ turn: -1, player: base.starter, tiles: [tile] });
  } else if (base.openingPassed) recordPass(state, base.starter, playedKeys, openedAtDouble, passHistory, 0);
  assertConservation(state, playedTiles, seed);

  while (!state.outcome && state.turns < maxTurns) {
    check(state.stock.length === 0, '3x9 initializer should consume the single stock tile');
    const p = state.currentPlayer, options = currentOnlyTurnOptions(state.branchState,
      state.openingState, openedAtDouble, state.hands[p], state.stock);
    const opp = [state.hands[(p + 1) % 3].length, state.hands[(p + 2) % 3].length];
    if (options.phase === 'play' && options.actions.length >= 2 && opp.every(n => n <= 3) &&
        passHistory.some(pass => pass.player !== p)) {
      eligible.push({ state: rd.cloneRoundState(state), openedAtDouble: cloneOpenedAt(openedAtDouble), playedTiles: playedTiles.map(t => t.slice()),
        playedEvents: playedEvents.map(ev => ({ ...ev, tiles: ev.tiles.map(t => t.slice()) })),
        passHistory: clonePasses(passHistory) });
    }
    let tr;
    if (options.phase === 'pass') {
      recordPass(state, p, playedKeys, openedAtDouble, passHistory);
      tr = { branchState: e.cloneBranchState(state.branchState), openingState: e.cloneOpeningState(state.openingState),
        hand: options.hand, stock: options.stock, passed: true, drawn: options.drawn,
        drawnTile: options.drawnTile, playedTiles: [], finishDoubles: [], action: null };
    } else {
      const policy = seed % 2 === 0 ? 'min-hand-pips' : 'fast-doubles';
      const action = chooseTopUniform(policy, options, { seed, turns: state.turns, player: p });
      applyActionModel(action, state, openedAtDouble);
      tr = d.applyTurn(state.branchState, state.openingState, state.hands[p], state.stock, action);
      for (const tile of tr.playedTiles) {
        const k = e.tileKey(tile); check(!playedKeys.has(k), 'tile played twice at seed ' + seed);
        playedKeys.add(k); playedTiles.push(tile.slice());
      }
      playedEvents.push({ turn: state.turns, player: p, tiles: tr.playedTiles.map(t => t.slice()) });
    }
    state.branchState = tr.branchState; state.openingState = tr.openingState;
    state.hands[p] = tr.hand; state.stock = tr.stock;
    state.consecutivePasses = tr.passed ? state.consecutivePasses + 1 : 0; state.turns++;
    state.outcome = d.roundOutcome({ hands: state.hands, stock: state.stock,
      consecutivePasses: state.consecutivePasses, lastPlayerIndex: p, lastTurnResult: tr, players: 3 });
    if (!state.outcome) state.currentPlayer = (p + 1) % 3;
    assertConservation(state, playedTiles, seed);
  }
  if (!state.outcome) state.outcome = { kind: 'unresolved', reason: 'turn-limit', turns: state.turns };
  return { seed, state, playedTiles, playedEvents, passHistory, eligible, outcome: state.outcome };
}
function analyzeSnapshot(snapshot, maxWorlds = 20000) {
  const state = snapshot.state, focalSeat = state.currentPlayer, focalHand = state.hands[focalSeat].map(t => t.slice());
  const played = snapshot.playedTiles.map(t => t.slice()), known = new Set([...played, ...focalHand].map(e.tileKey));
  check(known.size === played.length + focalHand.length, 'known tile duplication');
  const pool = DECK.filter(tile => !known.has(e.tileKey(tile)));
  const seats = [(focalSeat + 1) % 3, (focalSeat + 2) % 3], sizes = seats.map(seat => state.hands[seat].length);
  check(pool.length === sizes[0] + sizes[1] + state.stock.length, 'unknown pool size mismatch');
  const actualHands = seats.map(seat => state.hands[seat].map(t => t.slice()));
  const result = support.supportFromSpec({ pool, hiddenHandSizes: sizes, stockSize: state.stock.length,
    focalHand, focalSeat, playedEvents: snapshot.playedEvents, passHistory: snapshot.passHistory,
    currentOnlyTraceCompatible: true, actualHiddenHands: actualHands, actualExpectedModel: 'current-only', maxWorlds });
  const passAudit = snapshot.passHistory.map(pass => {
    const later = snapshot.playedEvents.filter(ev => ev.player === pass.player && ev.turn > pass.turn).flatMap(ev => ev.tiles);
    const hand = [...state.hands[pass.player], ...later];
    check(hand.length === pass.handSizeAtPass, 'pass-time hand size mismatch');
    check(!hand.some(tile => pass.forbiddenCurrent.includes(e.tileKey(tile))), 'actual current-only pass contradiction');
    return { player: pass.player, turn: pass.turn, handSizeAtPass: pass.handSizeAtPass,
      globalMaskSize: pass.forbiddenGlobal.length, currentOnlyMaskSize: pass.forbiddenCurrent.length,
      laterPlayedTiles: later.map(e.tileKey).sort(), actualPassTimeHand: hand.map(e.tileKey).sort(),
      globalCompatible: !hand.some(tile => pass.forbiddenGlobal.includes(e.tileKey(tile))) };
  });
  return { seed: snapshot.seed, focalSeat, handSizes: [focalHand.length, ...sizes], turn: state.turns,
    passCount: snapshot.passHistory.length,
    passMaskDifferences: snapshot.passHistory.filter(p => JSON.stringify(p.forbiddenGlobal) !==
      JSON.stringify(p.forbiddenCurrent)).length,
    support: result.counts, actualGlobalCompatible: result.actualGlobal,
    actualCurrentOnlyCompatible: result.actualCurrent, passAudit };
}
function dealFingerprint(deal) {
  return deal.hands.map(h => h.map(e.tileKey).sort().join(',')).join('|') +
    '|stock=' + deal.stock.map(e.tileKey).sort().join(',');
}
function run({ startSeed = 3454291, deals = 2400, targetPositions = 100, maxWorlds = 20000, maxTurns = 100 } = {}) {
  const positions = [], seen = new Map(), outcomes = { finish: 0, block: 0, unresolved: 0 };
  const supportTotals = { raw: 0, global: 0, currentOnly: 0, joint: 0, globalOnly: 0, currentOnlyExclusive: 0, neither: 0 };
  let dealsGenerated = 0, duplicateDeals = 0, eligibleLateStates = 0, passObservations = 0;
  let actualGlobalCompatible = 0, actualCurrentOnlyCompatible = 0, lastScannedSeed = null;
  for (let seed = startSeed; seed < startSeed + deals && positions.length < targetPositions; seed++) {
    const deal = e.dealThreeByNine(seed), fp = dealFingerprint(deal);
    if (seen.has(fp)) { duplicateDeals++; continue; }
    seen.set(fp, seed); dealsGenerated++; lastScannedSeed = seed;
    const round = simulateSeed(seed, maxTurns);
    outcomes[round.outcome.kind] = (outcomes[round.outcome.kind] || 0) + 1;
    passObservations += round.passHistory.length; eligibleLateStates += round.eligible.length;
    for (let i = round.eligible.length - 1; i >= 0; i--) {
      try {
        const result = analyzeSnapshot({ ...round.eligible[i], seed }, maxWorlds); positions.push(result);
        for (const k of Object.keys(supportTotals)) supportTotals[k] += result.support[k];
        actualGlobalCompatible += +result.actualGlobalCompatible;
        actualCurrentOnlyCompatible += +result.actualCurrentOnlyCompatible; break;
      } catch (error) { if (!/exact support exceeds cap/.test(error.message)) throw error; }
    }
  }
  check(outcomes.finish + outcomes.block + outcomes.unresolved === dealsGenerated, 'outcome totals mismatch');
  return { schema: 'qosha-current-only-pass-support/v1',
    engine: 'qosha-research-0.5.3 + current-only-pass-support-1.0',
    rules: 'recovered qosa-1.0.0 3x9; current-only side-local opening is a provisional counterfactual',
    seedStart: startSeed, seedWindowEnd: startSeed + deals - 1, lastScannedSeed,
    dealsRequested: deals, dealsGenerated, uniqueDealAllocations: seen.size, duplicateDeals,
    outcomes, eligibleLateStates, passObservations, selectedPositions: positions.length,
    selectedSeeds: positions.map(p => p.seed),
    selection: 'latest eligible state per seed; focal >=2 current-only actions; both opponents <=3 tiles; prior hidden-seat no-stock pass; exact support under cap',
    policies: 'seed-even=min-hand-pips; seed-odd=fast-doubles; uniform seeded choice among top-ranked actions (distributionally branch-label symmetric)',
    posterior: 'Exact labeled allocations; pass-time hand=current hidden hand + same-seat later public plays; global/current-only masks filtered separately; no opponent-choice likelihood.',
    supportTotals, meanSupport: Object.fromEntries(Object.entries(supportTotals).map(([k, v]) =>
      [k, positions.length ? v / positions.length : null])),
    jointPositivePositions: positions.filter(p => p.support.joint > 0).length,
    actualModelCompatibility: { global: actualGlobalCompatible, currentOnly: actualCurrentOnlyCompatible }, positions };
}
function test() {
  let assertions = 0; const ok = (v, m) => { assertions++; check(v, m); };
  const a = run({ startSeed: 3454291, deals: 200, targetPositions: 10, maxWorlds: 20000 });
  const b = run({ startSeed: 3454291, deals: 200, targetPositions: 10, maxWorlds: 20000 });
  ok(JSON.stringify(a) === JSON.stringify(b), 'deterministic replay');
  ok(a.selectedPositions === 10, 'selected position quota');
  ok(a.uniqueDealAllocations === a.dealsGenerated, 'deal allocation uniqueness');
  ok(a.outcomes.finish + a.outcomes.block + a.outcomes.unresolved === a.dealsGenerated, 'outcome accounting');
  ok(a.positions.every(p => p.actualCurrentOnlyCompatible), 'actual current-only worlds survive');
  ok(a.positions.every(p => p.support.globalOnly + p.support.currentOnlyExclusive + p.support.joint + p.support.neither === p.support.raw), 'support partition');
  ok(a.positions.every(p => p.support.joint <= p.support.global && p.support.joint <= p.support.currentOnly), 'joint support bounds');
  const fixture = support.supportFromSpec({ pool: [[2, 5]], hiddenHandSizes: [0, 1], stockSize: 0,
    focalHand: [], focalSeat: 0, playedEvents: [],
    passHistory: [{ player: 2, turn: 0, handSizeAtPass: 1, forbiddenGlobal: ['2-5'], forbiddenCurrent: [] }],
    currentOnlyTraceCompatible: true, actualHiddenHands: [[], [[2, 5]]],
    actualExpectedModel: 'current-only', maxWorlds: 10 });
  ok(!fixture.actualGlobal && fixture.actualCurrent, 'current-only model permits global-exclusive actual world');
  ok(fixture.counts.currentOnlyExclusive === 1 && fixture.counts.global === 0, 'model-exclusive fixture');
  ok(a.selectedSeeds.every((seed, i, xs) => xs.indexOf(seed) === i), 'one selected position per seed');
  return { passed: true, assertions, deals: a.dealsGenerated, selectedPositions: a.selectedPositions,
    exactWorldRecords: a.supportTotals.raw, actualCurrentOnlyCompatible: a.actualModelCompatibility.currentOnly };
}
if (require.main === module) {
  const args = process.argv.slice(2);
  console.log(JSON.stringify(args[0] === 'test' ? test() : run({
    startSeed: +(args[0] || 3454291), deals: +(args[1] || 2400),
    targetPositions: +(args[2] || 100), maxWorlds: +(args[3] || 20000) }), null, 2));
}
module.exports = { run, test, simulateSeed, analyzeSnapshot, currentOnlyActions, currentOnlyTurnOptions, recordPass, applyActionModel };
