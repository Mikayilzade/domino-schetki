'use strict';

// Exact pass-history-conditioned support for the recovered 3x9 mode.
// Global-ever-open is the research engine model. Current-only is a provisional
// side-local counterfactual: a number opened by a double is usable only on the
// side(s) ending in that number when the double was played.

const e = require('./engine');
const init = require('./initializer');
const d = require('./turn-dispatcher');
const rd = require('./round-driver');
const alloc = require('./hidden-world-enumeration');
const SIDES = e.SIDES;
const DECK = e.createDoubleSixDeck();
const key = e.tileKey;
const check = (ok, message) => { if (!ok) throw new Error(message || 'assertion failed'); };

function cloneMap(map) { return new Map([...map].map(([n, sides]) => [n, new Set(sides)])); }
function actionTiles(a) { return a.type === 'single' ? [a.tile] : (a.tiles || []); }
function actionPips(a) { return e.pipSum(actionTiles(a)); }
function actionDoubles(a) { return actionTiles(a).filter(t => t[0] === t[1]).length; }
function tupleCompare(a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const delta = (a[i] || 0) - (b[i] || 0);
    if (delta) return delta;
  }
  return 0;
}
function rank(policy, action) {
  const finish = action.type === 'mixed-finish' ? 1 : 0;
  return policy === 'fast-doubles' ? [finish, actionDoubles(action), actionPips(action)] : [finish, actionPips(action)];
}
function orbitKey(action, branchState) {
  const side = action.side == null ? null : [branchState.branches[action.side].active, branchState.branches[action.side].end];
  return JSON.stringify([action.type, action.handIndex ?? null, side, action.from ?? null, action.to ?? null,
    action.tile ? key(action.tile) : null, action.tiles ? action.tiles.map(key) : null,
    action.numbers || [], action.finishDoubles ? action.finishDoubles.map(key) : null]);
}
function rngFor(seed) {
  let x = e.mixSeed32(seed >>> 0) || 0x9e3779b9;
  return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return (x >>> 0) / 0x100000000; };
}
function chooseOrbit(policy, options, state, context) {
  const actions = options.actions;
  let top = actions;
  if (policy !== 'random-legal') {
    let best = rank(policy, actions[0]);
    for (const a of actions) if (tupleCompare(rank(policy, a), best) > 0) best = rank(policy, a);
    top = actions.filter(a => tupleCompare(rank(policy, a), best) === 0);
  }
  const random = rngFor((context.seed ^ Math.imul(context.turns + 1, 0x9e3779b9) ^
    Math.imul(context.player + 1, 0x85ebca6b) ^ context.salt) >>> 0);
  if (policy === 'random-legal') return top[Math.floor(random() * top.length)];
  const groups = new Map();
  for (const a of top) {
    const k = orbitKey(a, state.branchState);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(a);
  }
  const values = [...groups.values()];
  const group = values[Math.floor(random() * values.length)];
  return group[Math.floor(random() * group.length)];
}
function currentOnlyLegalTile(branch, opening, openedAtDouble, tile) {
  if (tile[0] === tile[1]) return e.candidateDoubleOpenings(branch, opening, [tile]).length > 0;
  return e.legalSinglePlacements(branch, tile).some(p => e.isNumberOpened(opening, p.from) && openedAtDouble.get(p.from)?.has(p.side));
}
function legalMask(branch, opening, openedAtDouble, playedKeys, model) {
  return DECK.filter(tile => !playedKeys.has(key(tile)) && (model === 'global-ever-open'
    ? d.actionsForHand(branch, opening, [tile]).length > 0
    : currentOnlyLegalTile(branch, opening, openedAtDouble, tile))).map(key).sort();
}
function noteSingle(action, branch, opening, openedAtDouble, divergences, turn) {
  check(d.openedSinglePlacements(branch, opening, action.tile).some(p => p.side === action.side && p.to === action.to),
    'single not legal under global-ever-open');
  if (!openedAtDouble.get(action.from)?.has(action.side)) divergences.push({ turn, tile: key(action.tile), side: action.side, from: action.from });
}
function noteDoubles(numbers, branch, opening, openedAtDouble, turn) {
  let next = e.cloneOpeningState(opening);
  for (const n of numbers) {
    const candidates = e.candidateDoubleOpenings(branch, next, [[n, n]]);
    check(candidates.length > 0, 'double not legal under global-ever-open: ' + n);
    openedAtDouble.set(n, new Set(candidates[0].sides));
    next = e.openNumber(next, n);
  }
  return next;
}
function recordPass(state, player, turn, playedKeys, openedAtDouble, passHistory) {
  check(state.stock.length === 0, 'only no-stock passes are eligible');
  const global = legalMask(state.branchState, state.openingState, openedAtDouble, playedKeys, 'global-ever-open');
  const current = legalMask(state.branchState, state.openingState, openedAtDouble, playedKeys, 'current-only');
  check(current.every(tile => global.includes(tile)), 'current-only pass mask must be a subset of global');
  passHistory.push({ player, turn, handSizeAtPass: state.hands[player].length,
    forbiddenGlobal: global, forbiddenCurrent: current,
    branchEnds: Object.fromEntries(SIDES.map(side => [side, state.branchState.branches[side].end])),
    openedNumbers: [...state.openingState.openedNumbers].sort((a, b) => a - b) });
}
function passTimeHand(currentHand, pass, playedEvents) {
  const laterPlayed = playedEvents.filter(event => event.player === pass.player && event.turn > pass.turn)
    .flatMap(event => event.tiles.map(tile => tile.slice()));
  const hand = [...currentHand.map(tile => tile.slice()), ...laterPlayed];
  check(new Set(hand.map(key)).size === hand.length, 'pass-time hand has duplicate tiles');
  check(hand.length === pass.handSizeAtPass, 'pass-time hand size mismatch');
  return { hand, laterPlayed };
}
function worldCompatible(world, focalHand, playedEvents, passes, focalSeat, model) {
  const hands = [[], [], []];
  hands[focalSeat] = focalHand.map(tile => tile.slice());
  const seats = [(focalSeat + 1) % 3, (focalSeat + 2) % 3];
  for (let i = 0; i < 2; i++) hands[seats[i]] = world.hiddenHands[i].map(tile => tile.slice());
  for (const pass of passes) {
    const reconstructed = passTimeHand(hands[pass.player], pass, playedEvents).hand;
    const forbidden = new Set(model === 'global-ever-open' ? pass.forbiddenGlobal : pass.forbiddenCurrent);
    if (reconstructed.some(tile => forbidden.has(key(tile)))) return false;
  }
  return true;
}
function supportFromSpec({ pool, hiddenHandSizes, stockSize = 0, focalHand, focalSeat = 0,
  playedEvents = [], passHistory = [], currentOnlyTraceCompatible = true, actualHiddenHands = null, maxWorlds = 20000 }) {
  const spec = { pool, hiddenHandSizes, stockSize };
  const total = alloc.countAllocations(spec);
  check(total <= BigInt(maxWorlds), 'exact support exceeds cap: ' + total);
  const worlds = alloc.enumerateAllocations(spec, { maxWorlds });
  check(worlds.length === Number(total), 'exact enumeration count mismatch');
  check(new Set(worlds.map(alloc.allocationFingerprint)).size === worlds.length, 'duplicate exact allocations');
  const counts = { raw: worlds.length, global: 0, currentOnly: 0, joint: 0, globalOnly: 0, currentOnlyExclusive: 0, neither: 0 };
  let actualIncluded = false, actualGlobal = false, actualCurrent = false;
  const actualFingerprint = actualHiddenHands ? alloc.allocationFingerprint({ hiddenHands: actualHiddenHands, stock: [] }) : null;
  for (const world of worlds) {
    const g = worldCompatible(world, focalHand, playedEvents, passHistory, focalSeat, 'global-ever-open');
    const c = currentOnlyTraceCompatible && worldCompatible(world, focalHand, playedEvents, passHistory, focalSeat, 'current-only');
    counts.global += +g; counts.currentOnly += +c; counts.joint += +(g && c);
    counts.globalOnly += +(g && !c); counts.currentOnlyExclusive += +(c && !g); counts.neither += +(!g && !c);
    if (actualFingerprint && alloc.allocationFingerprint(world) === actualFingerprint) {
      actualIncluded = true; actualGlobal = g; actualCurrent = c;
    }
  }
  check(counts.globalOnly + counts.currentOnlyExclusive + counts.joint + counts.neither === counts.raw, 'support partition mismatch');
  if (actualHiddenHands) check(actualIncluded && actualGlobal, 'actual global world excluded by pass history');
  if (actualHiddenHands && currentOnlyTraceCompatible) check(actualCurrent, 'joint trace excluded actual current-only world');
  return { counts, actualIncluded, actualGlobal, actualCurrent };
}
function applyActionModel(action, state, openedAtDouble, divergences) {
  if (action.type === 'single') noteSingle(action, state.branchState, state.openingState, openedAtDouble, divergences, state.turns);
  else if (action.type === 'double-sequence') noteDoubles(action.numbers, state.branchState, state.openingState, openedAtDouble, state.turns);
  else if (action.type === 'mixed-finish') {
    noteSingle(action, state.branchState, state.openingState, openedAtDouble, divergences, state.turns);
    const branch = e.applySinglePlacement(state.branchState, action);
    noteDoubles(action.numbers, branch, state.openingState, openedAtDouble, state.turns);
  } else throw new Error('unknown action type');
}
function simulateSeed(seed, maxTurns = 100) {
  const base = init.initializeThreePlayerRound({ seed, isFirstRound: false, previousWinnerIndex: seed % 3,
    chooseFollowupSide: choices => choices[(seed >>> 0) % choices.length] });
  check(base.kind === 'ready', 'initializer not ready');
  const state = rd.cloneRoundState(base);
  const openedAtDouble = new Map([[1, new Set(SIDES)]]);
  const playedTiles = [[1, 1]], playedEvents = [{ turn: -2, player: base.starter, tiles: [[1, 1]] }];
  const playedKeys = new Set(['1-1']), passHistory = [], divergences = [];
  if (base.openingFollowup) {
    const tile = base.openingFollowup.tile.slice();
    playedTiles.push(tile); playedKeys.add(key(tile)); playedEvents.push({ turn: -1, player: base.starter, tiles: [tile] });
  } else if (base.openingPassed) recordPass(base, base.starter, 0, playedKeys, openedAtDouble, passHistory);
  const eligible = [];
  while (!state.outcome && state.turns < maxTurns) {
    const player = state.currentPlayer;
    const options = d.turnOptions(state.branchState, state.openingState, state.hands[player], state.stock);
    const opponents = [state.hands[(player + 1) % 3].length, state.hands[(player + 2) % 3].length];
    if (options.phase === 'play' && options.actions.length >= 2 && opponents.every(n => n <= 3) &&
        passHistory.some(pass => pass.player !== player) && state.stock.length === 0) {
      eligible.push({ state: rd.cloneRoundState(state), playedTiles: playedTiles.map(t => t.slice()),
        playedEvents: playedEvents.map(ev => ({ ...ev, tiles: ev.tiles.map(t => t.slice()) })),
        passHistory: passHistory.map(pass => ({ ...pass, forbiddenGlobal: pass.forbiddenGlobal.slice(),
          forbiddenCurrent: pass.forbiddenCurrent.slice(), branchEnds: { ...pass.branchEnds }, openedNumbers: pass.openedNumbers.slice() })),
        divergences: divergences.map(x => ({ ...x })) });
    }
    let tr;
    if (options.phase === 'pass') {
      recordPass(state, player, state.turns, playedKeys, openedAtDouble, passHistory);
      tr = d.applyTurn(state.branchState, state.openingState, state.hands[player], state.stock, null);
    } else {
      const policy = seed % 2 === 0 ? 'min-hand-pips' : 'fast-doubles';
      const action = chooseOrbit(policy, options, state, { seed, turns: state.turns, player, salt: 0x1248 });
      applyActionModel(action, state, openedAtDouble, divergences);
      tr = d.applyTurn(state.branchState, state.openingState, state.hands[player], state.stock, action);
      const tiles = tr.playedTiles.map(t => t.slice());
      for (const tile of tiles) { check(!playedKeys.has(key(tile)), 'tile played twice'); playedKeys.add(key(tile)); playedTiles.push(tile); }
      playedEvents.push({ turn: state.turns, player, tiles });
    }
    state.branchState = tr.branchState; state.openingState = tr.openingState;
    state.hands[player] = tr.hand; state.stock = tr.stock;
    state.consecutivePasses = tr.passed ? state.consecutivePasses + 1 : 0;
    state.turns++;
    state.outcome = d.roundOutcome({ hands: state.hands, stock: state.stock, consecutivePasses: state.consecutivePasses,
      lastPlayerIndex: player, lastTurnResult: tr, players: 3 });
    if (!state.outcome) state.currentPlayer = (player + 1) % 3;
  }
  return { seed, state, playedTiles, playedEvents, passHistory, divergences, eligible, outcome: state.outcome };
}
function analyzeSnapshot(snapshot, maxWorlds = 20000) {
  const state = snapshot.state, focalSeat = state.currentPlayer;
  const focalHand = state.hands[focalSeat].map(t => t.slice());
  const played = snapshot.playedTiles.map(t => t.slice());
  const known = new Set([...played, ...focalHand].map(key));
  check(known.size === played.length + focalHand.length, 'known tiles duplicated');
  const pool = DECK.filter(tile => !known.has(key(tile)));
  const seats = [(focalSeat + 1) % 3, (focalSeat + 2) % 3];
  const sizes = seats.map(seat => state.hands[seat].length);
  check(pool.length === sizes[0] + sizes[1] + state.stock.length, 'unknown pool size mismatch');
  const actualHands = seats.map(seat => state.hands[seat].map(t => t.slice()));
  const support = supportFromSpec({ pool, hiddenHandSizes: sizes, stockSize: state.stock.length,
    focalHand, focalSeat, playedEvents: snapshot.playedEvents, passHistory: snapshot.passHistory,
    currentOnlyTraceCompatible: snapshot.divergences.length === 0, actualHiddenHands: actualHands, maxWorlds });
  const actualPassHistory = snapshot.passHistory.map(pass => {
    const later = snapshot.playedEvents.filter(ev => ev.player === pass.player && ev.turn > pass.turn).flatMap(ev => ev.tiles);
    const hand = [...state.hands[pass.player], ...later];
    check(hand.length === pass.handSizeAtPass, 'actual pass-time hand size mismatch');
    check(!hand.some(tile => pass.forbiddenGlobal.includes(key(tile))), 'actual global pass contradiction');
    if (!snapshot.divergences.length) check(!hand.some(tile => pass.forbiddenCurrent.includes(key(tile))), 'actual current-only pass contradiction');
    return { player: pass.player, turn: pass.turn, handSizeAtPass: pass.handSizeAtPass,
      globalMaskSize: pass.forbiddenGlobal.length, currentOnlyMaskSize: pass.forbiddenCurrent.length,
      laterPlayedTiles: later.map(key).sort(), actualPassTimeHand: hand.map(key).sort() };
  });
  return { seed: snapshot.seed, focalSeat, handSizes: [focalHand.length, ...sizes],
    playedTiles: played.map(key).sort(), focalHand: focalHand.map(key).sort(),
    branchState: Object.fromEntries(SIDES.map(side => [side, { active: state.branchState.branches[side].active, end: state.branchState.branches[side].end }])),
    openedNumbers: [...state.openingState.openedNumbers].sort((a, b) => a - b), turn: state.turns,
    passCount: snapshot.passHistory.length, passMaskDifferences: snapshot.passHistory.filter(p =>
      JSON.stringify(p.forbiddenGlobal) !== JSON.stringify(p.forbiddenCurrent)).length,
    currentOnlyCompatible: snapshot.divergences.length === 0, currentOnlyDivergences: snapshot.divergences,
    passTimeAudit: actualPassHistory, support: support.counts,
    actualGlobalCompatible: support.actualGlobal, actualCurrentOnlyCompatible: support.actualCurrent };
}
function syntheticFixture() {
  let branch = e.createBranchState([1, 1]);
  let opening = e.createOpeningState([1]);
  const opened = new Map([[1, new Set(SIDES)]]);
  const played = [[1, 1], [1, 2], [2, 2], [1, 3], [3, 3], [2, 4], [2, 3]];
  const playedKeys = new Set(played.map(key));
  branch = e.applySinglePlacement(branch, e.legalSinglePlacements(branch, [1, 2]).find(p => p.side === 'up'));
  opening = noteDoubles([2], branch, opening, opened, 0);
  branch = e.applySinglePlacement(branch, e.legalSinglePlacements(branch, [1, 3]).find(p => p.side === 'left'));
  opening = noteDoubles([3], branch, opening, opened, 1);
  branch = e.applySinglePlacement(branch, e.legalSinglePlacements(branch, [2, 4]).find(p => p.side === 'up'));
  branch = e.applySinglePlacement(branch, e.legalSinglePlacements(branch, [2, 3]).find(p => p.side === 'left'));
  const global = legalMask(branch, opening, opened, playedKeys, 'global-ever-open');
  const current = legalMask(branch, opening, opened, playedKeys, 'current-only');
  const focalHand = DECK.filter(tile => !playedKeys.has(key(tile))).slice(0, 7);
  const pool = DECK.filter(tile => !playedKeys.has(key(tile)) && !focalHand.some(t => key(t) === key(tile)));
  const pass = { player: 2, turn: 5, handSizeAtPass: 7, forbiddenGlobal: global, forbiddenCurrent: current };
  const playedEvents = played.map((tile, i) => ({ turn: i - 2, player: i === 0 ? 2 : (i + 1) % 3, tiles: [tile] }));
  const support = supportFromSpec({ pool, hiddenHandSizes: [7, 7], focalHand, focalSeat: 0,
    playedEvents: [], passHistory: [pass], currentOnlyTraceCompatible: true, maxWorlds: 20000 });
  return { raw: Number(alloc.countAllocations({ pool, hiddenHandSizes: [7, 7], stockSize: 0 })),
    focalHand: focalHand.map(key).sort(), playedTiles: played.map(key).sort(),
    global: support.counts.global, currentOnly: support.counts.currentOnly, joint: support.counts.joint,
    globalOnly: support.counts.globalOnly, currentOnlyExclusive: support.counts.currentOnlyExclusive,
    neither: support.counts.neither, globalMaskSize: global.length, currentOnlyMaskSize: current.length,
    differingTiles: global.filter(tile => !current.includes(tile)), currentOnlyCompatibleTrace: true };
}
function run({ startSeed = 3446032, deals = 3000, targetPositions = 120, maxWorlds = 20000, maxTurns = 100 } = {}) {
  const positions = [];
  let dealsGenerated = 0, finishes = 0, blocks = 0, unresolved = 0, eligibleLateStates = 0;
  for (let seed = startSeed; seed < startSeed + deals && positions.length < targetPositions; seed++) {
    const round = simulateSeed(seed, maxTurns);
    eligibleLateStates += round.eligible.length;
    if (round.outcome?.kind === 'finish') finishes++; else if (round.outcome?.kind === 'block') blocks++; else unresolved++;
    dealsGenerated++;
    for (let i = round.eligible.length - 1; i >= 0; i--) {
      try { const result = analyzeSnapshot({ ...round.eligible[i], seed }, maxWorlds); positions.push(result); break; }
      catch (error) { if (!/exact support exceeds cap/.test(error.message)) throw error; }
    }
  }
  return { schema: 'qosha-pass-history-conditioned-support/v1',
    timestampBaku: new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Baku', dateStyle: 'short', timeStyle: 'medium' }).format(new Date()) + ' +04:00',
    engine: 'qosa-research-0.5.3 + pass-history-conditioned-support-1.0',
    rules: 'recovered qosa-1.0.0 3x9; global-ever-open and current-only side-local model both provisional',
    startSeed, dealsRequested: deals, dealsGenerated, finishes, blocks, unresolved,
    selectedSeedRange: positions.length ? [positions[0].seed, positions[positions.length - 1].seed] : null,
    selectedSeeds: positions.map(p => p.seed), generation: { policy: 'seed-even=min-hand-pips; seed-odd=fast-doubles; action-orbit symmetric tie-break',
      openingFollowup: 'canonical tile; unsigned seed modulo four sides',
      selection: 'latest state per seed with >=2 legal actions, both opponents <=3 tiles, prior no-stock pass by a hidden seat', eligibleLateStates },
    posterior: 'Exact labeled allocations; pass-time hand = current hidden hand + same-seat tiles played after pass; no-intervening-draw passes only; no opponent-choice likelihood.',
    currentOnlyDefinition: 'A number opened by a double is usable only on side(s) active and ending in that number when the double was played; later arrivals on other sides are locked. Provisional counterfactual.',
    syntheticFixture: syntheticFixture(), positions };
}
module.exports = { run, simulateSeed, analyzeSnapshot, supportFromSpec, passTimeHand, currentOnlyLegalTile, legalMask, syntheticFixture };
if (require.main === module) {
  const args = process.argv.slice(2);
  const result = run({ startSeed: +(args[0] || 3446032), deals: +(args[1] || 3000),
    targetPositions: +(args[2] || 120), maxWorlds: +(args[3] || 20000) });
  console.log(JSON.stringify(result, null, 2));
}
