'use strict';
const e = require('./engine');
const d = require('./turn-dispatcher');
const r = require('./round-driver');
const init = require('./initializer');
const sym = require('./branch-label-symmetric-tiebreak');
const alloc = require('./hidden-world-enumeration');

const DECK = e.createDoubleSixDeck();
const PROFILES = ['closed-branch-control', 'min-hand-pips'];
const key = e.tileKey;

function check(ok, message) { if (!ok) throw new Error(message || 'assertion failed'); }
function tilesFor(a) { return a.type === 'single' ? [a.tile] : (a.tiles || []); }
function actionKey(a) {
  return JSON.stringify({
    type: a.type, handIndex: a.handIndex ?? null, side: a.side ?? null,
    from: a.from ?? null, to: a.to ?? null, tile: a.tile ? key(a.tile) : null,
    tiles: a.tiles ? a.tiles.map(key) : null, numbers: a.numbers || [],
    finishDoubles: a.finishDoubles ? a.finishDoubles.map(key) : null
  });
}
function actionOrbitKey(a, state) {
  const sideFeature = a.side == null ? null : {
    active: !!state.branches[a.side].active, end: state.branches[a.side].end
  };
  return JSON.stringify({
    type: a.type, handIndex: a.handIndex ?? null, sideFeature,
    from: a.from ?? null, to: a.to ?? null, tile: a.tile ? key(a.tile) : null,
    tiles: a.tiles ? a.tiles.map(key) : null, numbers: a.numbers || [],
    finishDoubles: a.finishDoubles ? a.finishDoubles.map(key) : null
  });
}
function pip(a) { return e.pipSum(tilesFor(a)); }
function rng32(seed) {
  let s = e.mixSeed32(seed >>> 0) || 0x9e3779b9;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 0x100000000; };
}
function pairFor(options, openingState, branchState, seed, requireEqualPip = false) {
  if (options.phase !== 'play' || options.drawn ||
      options.actions.some(a => a.type === 'mixed-finish')) return null;
  const singles = options.actions.filter(a => a.type === 'single');
  const doubles = options.actions.filter(a =>
    a.type === 'double-sequence' && a.tiles.length === 1 &&
    !openingState.openedNumbers.has(a.numbers[0]));
  const pairs = [];
  for (const single of singles) for (const dbl of doubles) {
    pairs.push({ single, double: dbl, gap: Math.abs(pip(dbl) - pip(single)) });
  }
  if (!pairs.length) return null;
  const minGap = Math.min(...pairs.map(x => x.gap));
  const eligible = requireEqualPip ? pairs.filter(x => x.gap === 0) : pairs.filter(x => x.gap === minGap);
  if (!eligible.length) return null;
  const groups = new Map();
  for (const x of eligible) {
    const k = actionOrbitKey(x.double, branchState) + '||' + actionOrbitKey(x.single, branchState);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(x);
  }
  const orbitKeys = [...groups.keys()].sort();
  const rng = rng32(seed);
  const group = groups.get(orbitKeys[Math.floor(rng() * orbitKeys.length)]);
  return group[Math.floor(rng() * group.length)];
}
function dealFingerprint(deal) {
  return deal.hands.map(h => h.map(key).sort().join(',')).join('|') +
    '#stock=' + deal.stock.map(key).sort().join(',');
}
function openingSideSelector(seed) { return choices => choices[(seed >>> 0) % choices.length]; }
function hashString(value) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) { h ^= value.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function makeVisibleState(state, focal) {
  const visible = r.cloneRoundState(state);
  visible.hands = visible.hands.map((hand, i) => i === focal ? hand.map(t => t.slice()) : []);
  visible.currentPlayer = focal;
  return visible;
}
function exactWorlds(position, maxWorlds) {
  const used = new Set([...position.focalHand, ...position.known].map(key));
  check(used.size === position.focalHand.length + position.known.length, 'visible duplicate tile');
  const pool = DECK.filter(tile => !used.has(key(tile)));
  const otherSeats = [(position.focal + 1) % 3, (position.focal + 2) % 3];
  const sizes = otherSeats.map(i => position.handSizes[i]);
  check(pool.length === sizes.reduce((a, b) => a + b, 0) + position.stockSize,
    'unknown pool/hand sizes mismatch');
  const spec = { pool, hiddenHandSizes: sizes, stockSize: position.stockSize };
  const support = alloc.countAllocations(spec);
  check(support <= BigInt(maxWorlds), 'exact support exceeds maxWorlds=' + maxWorlds);
  const worlds = alloc.enumerateAllocations(spec, { maxWorlds });
  check(worlds.length === Number(support), 'exact support count mismatch');
  const fingerprints = worlds.map(alloc.allocationFingerprint);
  check(new Set(fingerprints).size === fingerprints.length, 'enumerated worlds must be unique');
  for (const world of worlds) {
    const all = [...position.known, ...position.focalHand, ...world.hiddenHands.flat(), ...world.stock].map(key);
    check(all.length === 28 && new Set(all).size === 28, 'tile conservation');
  }
  const actualFp = position._actualHiddenHands ?
    alloc.allocationFingerprint({ hiddenHands: position._actualHiddenHands, stock: [] }) : null;
  const actualWorldIncluded = actualFp ? fingerprints.includes(actualFp) : null;
  if (actualFp) check(actualWorldIncluded, 'discovery world must belong to exact support');
  return { worlds, support: Number(support), otherSeats, actualWorldIncluded };
}
function metric(end, focal, startTurns, extra = {}) {
  const outcome = end.outcome;
  const focalFinish = outcome && outcome.kind === 'finish' && outcome.playerIndex === focal;
  return {
    kind: outcome ? outcome.kind : 'none',
    focalFinish: +focalFinish, firstFinish: +focalFinish,
    focalPips: e.pipSum(end.hands[focal]),
    minusMagnitude: focalFinish ? Math.abs(outcome.minus || 0) : 0,
    minusFinish: +(focalFinish && (outcome.minus || 0) < 0),
    block: +(outcome && outcome.kind === 'block'),
    turns: end.turns - startTurns,
    ...extra
  };
}
function rollout(world, position, candidate, profile, worldSalt) {
  const focal = position.focal;
  const base = r.cloneRoundState(world);
  const options = d.turnOptions(base.branchState, base.openingState, base.hands[focal], base.stock);
  const wanted = actionKey(candidate);
  const hit = options.actions.find(a => actionKey(a) === wanted);
  check(!!hit, 'candidate must remain legal in every hidden world');

  let state = r.stepRound(base, () => hit);
  let nextOpponentImmediateFinish = 0, nextOpponentPass = 0, nextOpponentPlayableTiles = 0;
  if (!state.outcome) {
    const next = (focal + 1) % 3;
    const nextOptions = d.turnOptions(state.branchState, state.openingState, state.hands[next], state.stock);
    nextOpponentPass = +(nextOptions.phase === 'pass');
    nextOpponentPlayableTiles = state.hands[next].filter(tile =>
      d.actionsForHand(state.branchState, state.openingState, [tile]).length > 0).length;
    const nextAction = nextOptions.phase === 'play' ?
      sym.chooseSymmetric(profile, nextOptions, {
        seed: worldSalt, turns: state.turns, player: next,
        branchState: state.branchState, salt: profile === 'closed-branch-control' ? 11 : 23
      }) : null;
    state = r.stepRound(state, () => nextAction);
    nextOpponentImmediateFinish = +(state.outcome && state.outcome.kind === 'finish' &&
      state.outcome.playerIndex === next);
  }
  if (!state.outcome) {
    state = r.runRound(state, (o, current) => sym.chooseSymmetric(profile, o, {
      seed: worldSalt, turns: current.turns, player: current.currentPlayer,
      branchState: current.branchState, salt: profile === 'closed-branch-control' ? 11 : 23
    }), { maxTurns: 200 });
  }
  check(state.outcome && state.outcome.kind !== 'unresolved', 'continuation unresolved');
  return metric(state, focal, base.turns, {
    nextOpponentImmediateFinish, nextOpponentPass, nextOpponentPlayableTiles
  });
}
function summarize(rows) {
  const mean = values => values.length ? values.reduce((s, x) => s + x, 0) / values.length : null;
  const median = values => {
    if (!values.length) return null;
    const sorted = [...values].sort((a, b) => a - b), n = sorted.length;
    return n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  };
  function metricSummary(values) {
    const n = values.length, m = mean(values);
    const sd = n > 1 ? Math.sqrt(values.reduce((s, x) => s + (x - m) ** 2, 0) / (n - 1)) : 0;
    return { n, mean: m, halfWidth95: n > 1 ? 1.96 * sd / Math.sqrt(n) : null,
      median: median(values), min: n ? Math.min(...values) : null, max: n ? Math.max(...values) : null };
  }
  const metrics = [
    'doubleMinusSingleFirstFinish', 'doubleMinusSingleFocalPips',
    'doubleMinusSingleNextOpponentImmediateFinish', 'doubleMinusSingleNextOpponentPass',
    'doubleMinusSingleNextOpponentPlayableTiles', 'doubleMinusSingleMinusMagnitude',
    'doubleMinusSingleMinusFinish', 'doubleMinusSingleBlock', 'doubleMinusSingleTurns'
  ];
  const out = {
    positions: rows.length,
    meanPipGap: mean(rows.map(x => x.pipGap)),
    equalPipPositions: rows.filter(x => x.pipGap === 0).length,
    actualWorldInclusionChecks: rows.filter(x => x.actualWorldIncluded === true).length
  };
  for (const profile of PROFILES) {
    const subset = rows.filter(x => x.profiles[profile]);
    out[profile] = { n: subset.length };
    for (const name of metrics) out[profile][name] =
      metricSummary(subset.map(x => x.profiles[profile].delta[name]));
  }
  out.byNextOpponentHandSize = {};
  for (const size of [1, 2, 3]) {
    const subset = rows.filter(x => x.nextOpponentHandSize === size);
    out.byNextOpponentHandSize[size] = { positions: subset.length };
    for (const profile of PROFILES) {
      out.byNextOpponentHandSize[size][profile] = {};
      for (const name of [
        'doubleMinusSingleFirstFinish', 'doubleMinusSingleFocalPips',
        'doubleMinusSingleNextOpponentImmediateFinish', 'doubleMinusSingleNextOpponentPass',
        'doubleMinusSingleNextOpponentPlayableTiles'
      ]) out.byNextOpponentHandSize[size][profile][name] =
        metricSummary(subset.map(x => x.profiles[profile].delta[name]));
    }
  }
  const strata = {};
  for (const x of rows) {
    const k = 'focal' + x.focalHandSize + '|next' + x.nextOpponentHandSize +
      '|opp' + x.opponentSizes.join('-') + '|support' + x.support + '|gap' + x.pipGap;
    strata[k] = (strata[k] || 0) + 1;
  }
  out.strata = strata;
  return out;
}
function run({
  startSeed = 3445020, dealCount = 2400, targetPositions = 60, maxWorlds = 1000,
  mode = 'minimum-gap', quotaByNextHandSize = null
} = {}) {
  check(Number.isInteger(startSeed) && startSeed >= 0, 'startSeed');
  check(Number.isInteger(dealCount) && dealCount > 0, 'dealCount');
  check(Number.isInteger(targetPositions) && targetPositions > 0, 'targetPositions');
  check(Number.isInteger(maxWorlds) && maxWorlds > 0, 'maxWorlds');
  check(mode === 'minimum-gap' || mode === 'equal-pip', 'mode must be minimum-gap or equal-pip');
  const quota = quotaByNextHandSize || { 1: 15, 2: 15, 3: 15 };
  const seenDeals = new Map(), positions = [], dealDuplicates = [];
  let dealDraws = 0, uniqueDeals = 0, rounds = 0, finishes = 0, blocks = 0,
    unresolved = 0, passFreeStates = 0, eligibleSupport = 0, worldsEnumerated = 0,
    pairedContinuations = 0, trajectoryTurns = 0;
  const quotas = { 1: 0, 2: 0, 3: 0 };

  for (let seed = startSeed; seed < startSeed + dealCount && positions.length < targetPositions; seed++) {
    dealDraws++;
    const deal = e.dealThreeByNine(seed), dealFp = dealFingerprint(deal);
    if (seenDeals.has(dealFp)) {
      dealDuplicates.push({ seed, duplicateOf: seenDeals.get(dealFp) });
      continue;
    }
    seenDeals.set(dealFp, seed);
    uniqueDeals++;
    const initial = init.initializeThreePlayerRound({
      seed, isFirstRound: false, previousWinnerIndex: seed % 3,
      chooseFollowupSide: openingSideSelector(seed)
    });
    check(initial.kind === 'ready', 'initializer did not return ready');
    let state = r.cloneRoundState(initial);
    const liveKeys = [...state.hands.flat(), ...state.stock].map(key);
    let known = DECK.filter(tile => !liveKeys.includes(key(tile))).map(tile => tile.slice());
    let hadPass = !!initial.openingPassed, selected = false;
    const discoveryPolicy = seed % 2 ? 'closed-branch-control' : 'min-hand-pips';

    while (!state.outcome && state.turns < 200) {
      const player = state.currentPlayer;
      const options = d.turnOptions(state.branchState, state.openingState, state.hands[player], state.stock);
      if (!hadPass && state.stock.length === 0 && options.phase === 'play') passFreeStates++;

      if (!selected && !hadPass && state.stock.length === 0 && options.phase === 'play' &&
          !options.drawn && state.hands[player].length >= 2 && state.hands[player].length <= 4 &&
          options.actions.length >= 2 && !options.actions.some(a => a.type === 'mixed-finish')) {
        const otherSeats = [(player + 1) % 3, (player + 2) % 3];
        const opponentSizes = otherSeats.map(i => state.hands[i].length);
        if (opponentSizes.every(n => n >= 1 && n <= 3) && opponentSizes.reduce((a, b) => a + b, 0) <= 6) {
          const nextSize = opponentSizes[0];
          const quotaMet = mode !== 'equal-pip' ||
            Object.keys(quota).every(k => (quotas[k] || 0) >= quota[k]);
          const pair = (!quotaMet && mode === 'equal-pip' &&
              (quotas[nextSize] || 0) < (quota[nextSize] || 0)) ?
            pairFor(options, state.openingState, state.branchState, seed ^ state.turns ^ player, true) :
            (mode === 'minimum-gap' ?
              pairFor(options, state.openingState, state.branchState, seed ^ state.turns ^ player, false) : null);

          if (pair) {
            const visibleState = makeVisibleState(state, player);
            const position = {
              seed, focal: player, turn: state.turns, focalHandSize: state.hands[player].length,
              passFree: true, profile: discoveryPolicy, visibleState,
              _actualHiddenHands: otherSeats.map(i => state.hands[i].map(tile => tile.slice())),
              focalHand: state.hands[player].map(tile => tile.slice()),
              known: known.map(tile => tile.slice()), handSizes: state.hands.map(hand => hand.length),
              opponentSizes, stockSize: state.stock.length,
              candidateDouble: actionKey(pair.double), candidateSingle: actionKey(pair.single),
              doublePips: pip(pair.double), singlePips: pip(pair.single), pipGap: pair.gap,
              nextOpponentHandSize: opponentSizes[0],
              startingDoubles: state.hands[player].filter(tile => tile[0] === tile[1]).length
            };
            const exact = exactWorlds(position, maxWorlds);
            eligibleSupport++;
            worldsEnumerated += exact.worlds.length;
            const rowsByProfile = {};
            let rootActionKeys = null;

            for (const profile of PROFILES) {
              const metrics = { double: [], single: [] };
              for (const worldAllocation of exact.worlds) {
                const hands = [[], [], []];
                hands[player] = position.focalHand.map(tile => tile.slice());
                for (let j = 0; j < exact.otherSeats.length; j++) {
                  hands[exact.otherSeats[j]] = worldAllocation.hiddenHands[j].map(tile => tile.slice());
                }
                const world = {
                  ...r.cloneRoundState(visibleState), hands,
                  stock: worldAllocation.stock.map(tile => tile.slice()), currentPlayer: player
                };
                const worldFp = alloc.allocationFingerprint(worldAllocation);
                const worldSalt = hashString(seed + '|' + player + '|' + worldFp + '|' + profile);
                const rootOptions = d.turnOptions(world.branchState, world.openingState, world.hands[player], world.stock);
                const rootKeys = rootOptions.actions.map(actionKey).sort();
                const double = rootOptions.actions.find(a => actionKey(a) === position.candidateDouble);
                const single = rootOptions.actions.find(a => actionKey(a) === position.candidateSingle);
                check(!!double && !!single, 'root candidates must remain legal across hidden worlds');
                if (!rootActionKeys) rootActionKeys = rootKeys;
                else check(JSON.stringify(rootActionKeys) === JSON.stringify(rootKeys),
                  'complete root action set must be invariant across hidden worlds');

                const doubleResult = rollout(world, position, double, profile, worldSalt);
                const singleResult = rollout(world, position, single, profile, worldSalt);
                metrics.double.push(doubleResult);
                metrics.single.push(singleResult);
                pairedContinuations += 2;
              }
              const averageDelta = name => metrics.double.reduce((sum, x, i) =>
                sum + (x[name] - metrics.single[i][name]), 0) / metrics.double.length;
              rowsByProfile[profile] = {
                worlds: exact.worlds.length,
                doubleFirstFinishRate: metrics.double.reduce((sum, x) => sum + x.firstFinish, 0) / metrics.double.length,
                singleFirstFinishRate: metrics.single.reduce((sum, x) => sum + x.firstFinish, 0) / metrics.single.length,
                delta: {
                  doubleMinusSingleFirstFinish: averageDelta('firstFinish'),
                  doubleMinusSingleFocalPips: averageDelta('focalPips'),
                  doubleMinusSingleNextOpponentImmediateFinish: averageDelta('nextOpponentImmediateFinish'),
                  doubleMinusSingleNextOpponentPass: averageDelta('nextOpponentPass'),
                  doubleMinusSingleNextOpponentPlayableTiles: averageDelta('nextOpponentPlayableTiles'),
                  doubleMinusSingleMinusMagnitude: averageDelta('minusMagnitude'),
                  doubleMinusSingleMinusFinish: averageDelta('minusFinish'),
                  doubleMinusSingleBlock: averageDelta('block'),
                  doubleMinusSingleTurns: averageDelta('turns')
                }
              };
            }
            const savedPosition = {
              seed, focal: player, turn: state.turns, focalHandSize: state.hands[player].length,
              passFree: true, discoveryPolicy, visible: {
                branchState: visibleState.branchState,
                openedNumbers: [...visibleState.openingState.openedNumbers],
                currentPlayer: player, turns: visibleState.turns,
                consecutivePasses: visibleState.consecutivePasses, stockSize: visibleState.stock.length
              },
              focalHand: position.focalHand, known: position.known, handSizes: position.handSizes,
              opponentSizes, stockSize: position.stockSize,
              candidateDouble: position.candidateDouble, candidateSingle: position.candidateSingle,
              doublePips: position.doublePips, singlePips: position.singlePips, pipGap: position.pipGap,
              nextOpponentHandSize: position.nextOpponentHandSize, startingDoubles: position.startingDoubles,
              support: exact.support, actualWorldIncluded: exact.actualWorldIncluded,
              rootActionCount: rootActionKeys.length, profiles: rowsByProfile
            };
            positions.push(savedPosition);
            quotas[opponentSizes[0]] = (quotas[opponentSizes[0]] || 0) + 1;
            selected = true;
          }
        }
      }
      if (options.phase === 'pass') hadPass = true;
      const action = options.phase === 'play' ? sym.chooseSymmetric(discoveryPolicy, options, {
        seed, turns: state.turns, player, branchState: state.branchState, salt: seed % 17
      }) : null;
      state = r.stepRound(state, () => action);
      if (action) known.push(...tilesFor(action).map(tile => tile.slice()));
    }
    rounds++;
    trajectoryTurns += state.turns;
    if (!state.outcome || state.outcome.kind === 'unresolved') unresolved++;
    else if (state.outcome.kind === 'finish') finishes++;
    else blocks++;
  }

  const timestampAsiaBaku = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Baku', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).format(new Date()) + ' +04';
  return {
    schema: 'qosha-exact-late-hidden-world-choice/v1', timestampAsiaBaku,
    engine: 'qosha-research-0.5.3', mode,
    quotaByNextHandSize: mode === 'equal-pip' ? quota : null,
    rules: 'recovered qosa-1.0.0 3x9; global-ever-open branch model provisional; pass-free root states only',
    startSeed, endSeed: startSeed + dealDraws - 1, dealDraws,
    uniqueDealAllocations: uniqueDeals, duplicateDealAllocations: dealDuplicates.length, dealDuplicates,
    trajectory: {
      rounds, finishes, blocks, unresolved,
      meanTurns: rounds ? trajectoryTurns / rounds : null
    },
    passFreeEligibleStates: passFreeStates, selectedPositions: positions.length,
    eligibleFiniteSupportPositions: eligibleSupport, worldsEnumerated, pairedContinuations,
    selection: mode === 'equal-pip' ?
      'No forced pass before root; stock empty; focal hand 2-4; each opponent 1-3; exact equal-pip legal single vs one-double opening pair; quotas by next-opponent hand size 1-3; hidden support <= cap.' :
      'No forced pass before root; stock empty; focal hand 2-4; each opponent 1-3; one legal single vs one-double opening pair selected by minimum pip gap; hidden support <= cap.',
    hiddenWorldMethod: 'Exact complete allocation enumeration with seat-labeled opponent hands. Pass-free histories need no pass posterior filter. Opponent action-choice likelihood is not modeled; trajectory-based position selection can still be biased by prior choices.',
    continuation: 'Matched candidates, identical exact hidden allocations and same world-derived continuation seed. Existing branch-label symmetric action-orbit tie-break; profiles closed-branch-control and min-hand-pips.',
    interpretation: 'Exact conditional expectations over each enumerated allocation set, with seeded tie-break realizations. Position-level summaries are exploratory, not population strategy estimates.',
    limitations: 'Branch global-ever-open semantics remain provisional; no pass-history conditioning; no opponent choice likelihood; selected reachable positions; two synthetic continuation policies; block winner and match scoring not authenticated. No strategy promotion.',
    exactNextAction: 'Implement separate pass-history-conditioned support filters for global-ever-open and current-only branch models; reconstruct each pass-time hand from the current hidden hand plus tiles that seat played after the pass; report model-specific and joint/exclusive support before rerunning matched candidate comparisons.',
    summary: summarize(positions), positions
  };
}
function test() {
  const a = run({ startSeed: 3445020, dealCount: 40, targetPositions: 1, maxWorlds: 1000, mode: 'minimum-gap' });
  const b = run({ startSeed: 3445020, dealCount: 40, targetPositions: 1, maxWorlds: 1000, mode: 'minimum-gap' });
  const aa = { ...a }; delete aa.timestampAsiaBaku;
  const bb = { ...b }; delete bb.timestampAsiaBaku;
  check(JSON.stringify(aa) === JSON.stringify(bb), 'deterministic replay');
  check(a.selectedPositions === 1 && a.trajectory.unresolved === 0, 'one selected resolved position');
  const p = a.positions[0];
  check(p.passFree && p.support === p.profiles['closed-branch-control'].worlds, 'pass-free exact support');
  check(p.actualWorldIncluded && p.rootActionCount >= 2 && p.pipGap >= 0, 'world/action invariants');
  check(a.pairedContinuations === p.support * 4, 'two candidate arms x two continuation profiles');
  const q = run({
    startSeed: 3445771, dealCount: 300, targetPositions: 1, maxWorlds: 1000,
    mode: 'equal-pip', quotaByNextHandSize: { 1: 1, 2: 1, 3: 1 }
  });
  check(q.selectedPositions === 1 && q.positions[0].pipGap === 0, 'equal-pip mode selects exact-pip pairs');
  check(q.positions[0].actualWorldIncluded, 'equal-pip discovery world belongs to exact support');
  return {
    passed: true, assertions: 7, minimumGapSupport: p.support,
    equalPipSupport: q.positions[0].support, rootActionCount: p.rootActionCount,
    pairedContinuations: a.pairedContinuations
  };
}
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args[0] === 'test') console.log(JSON.stringify(test(), null, 2));
  else console.log(JSON.stringify(run({
    startSeed: +(args[0] || 3445020), dealCount: +(args[1] || 2400),
    targetPositions: +(args[2] || 60), maxWorlds: +(args[3] || 1000),
    mode: args[4] || 'minimum-gap'
  }), null, 2));
}
module.exports = { run, test, pairFor, exactWorlds, actionKey };
