'use strict';

const e = require('./engine');
const init = require('./initializer');
const rd = require('./round-driver');
const integration = require('./finish-score-match-integration');

const DEFAULT_ORDERS = [[0, 1, 2], [1, 2, 0], [2, 0, 1]];
const DEFAULT_ORDER_NAMES = ['0-1-2', '1-2-0', '2-0-1'];

function choose(options, state, seed) {
  if (options.phase !== 'play' || !options.actions.length) return null;
  const h = e.mixSeed32(
    (seed ^ Math.imul(state.turns + 1, 0x9e3779b9) ^
      Math.imul(state.currentPlayer + 1, 0x85ebca6b) ^ 0x51) >>> 0
  );
  return options.actions[h % options.actions.length];
}
function zeroMatch() {
  return [0, 1, 2].map(i => ({ id: 'P' + i, score: 0, exploded: false }));
}
function fingerprint(deal) {
  const keys = xs => xs.map(e.tileKey).sort().join(',');
  return deal.hands.map(keys).join('|') + '|stock=' + keys(deal.stock);
}
function median(xs) {
  const s = [...xs].sort((a, b) => a - b);
  if (!s.length) return null;
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function createArm(order, name) {
  return {
    name, order, current: zeroMatch(), activeRounds: 0, completed: 0,
    matchLengths: [], finishIndices: [], explodedAtFinish: [],
    applied: 0, zeroSkipped: 0, pending: 0, floorHits: 0, bustEvents: 0, maxScore: 0,
    finishMinus: { '0': 0, '-10': 0, '-20': 0, '-30': 0, '-40': 0 }
  };
}

function runAudit({ startSeed = 17000000, acceptedRounds = 1000, maxAttemptsPerRound = 100, maxTurns = 200 } = {}) {
  const arms = DEFAULT_ORDERS.map((order, i) => createArm([...order], DEFAULT_ORDER_NAMES[i]));
  let cursor = startSeed, attempts = 0, redeals = 0, accepted = 0, finishes = 0, blocks = 0, unresolved = 0;
  const seen = new Set();

  for (let i = 0; i < acceptedRounds; i++) {
    let ready = null, chosenSeed = null, tries = 0;
    while (tries < maxAttemptsPerRound) {
      const seed = cursor++;
      attempts++; tries++;
      const deal = e.dealThreeByNine(seed);
      const outcome = init.initializeThreePlayerRoundFromDeal({ ...deal, isFirstRound: true });
      if (outcome.kind === 'redeal') { redeals++; continue; }
      if (outcome.kind !== 'ready') throw new Error('unexpected initializer ' + outcome.kind + ' seed ' + seed);
      const fp = fingerprint(deal);
      if (seen.has(fp)) throw new Error('duplicate accepted allocation seed ' + seed);
      seen.add(fp); ready = outcome; chosenSeed = seed; break;
    }
    if (!ready) throw new Error('redeal cap reached at round ' + i);

    const terminal = rd.runRound(ready, (opts, state) => choose(opts, state, chosenSeed), { maxTurns });
    const outcome = terminal.outcome;
    if (!outcome || (outcome.kind !== 'finish' && outcome.kind !== 'block')) {
      unresolved++; throw new Error('unresolved round seed ' + chosenSeed);
    }
    accepted++;
    if (outcome.kind === 'finish') finishes++; else blocks++;

    for (const arm of arms) {
      arm.activeRounds++;
      if (outcome.kind === 'block') continue;
      const mapped = integration.finishOutcomeToDeltas(outcome, 3);
      arm.finishMinus[String(mapped.minus)]++;
      const beforeScores = arm.current.map(x => x.score);
      const result = integration.applyFinishOutcomeToMatch(arm.current, outcome, { seatOrder: arm.order });
      for (const event of result.events) {
        arm.applied++;
        if (event.delta < 0 && beforeScores[event.seat] + event.delta < 0) arm.floorHits++;
        if (beforeScores[event.seat] + event.delta >= 101 && !arm.current[event.seat].exploded) arm.bustEvents++;
        beforeScores[event.seat] = Math.max(0, beforeScores[event.seat] + event.delta);
        arm.maxScore = Math.max(arm.maxScore, beforeScores[event.seat]);
      }
      arm.zeroSkipped += result.skippedZeroSeats.length;
      arm.pending += result.pendingSeats.length;
      const oldExploded = arm.current.map(x => x.exploded);
      arm.current = result.entities;
      if (result.finished) {
        arm.completed++;
        arm.matchLengths.push(arm.activeRounds);
        arm.finishIndices.push(accepted - 1);
        const newly = arm.current.filter((x, seat) => x.exploded && !oldExploded[seat]).map(x => Number(x.id.slice(1)));
        arm.explodedAtFinish.push(newly);
        arm.activeRounds = 0;
        arm.current = zeroMatch();
      }
    }
  }

  const summaries = arms.map(arm => {
    const explodedSeatCounts = {};
    for (const seats of arm.explodedAtFinish) for (const seat of seats) explodedSeatCounts[seat] = (explodedSeatCounts[seat] || 0) + 1;
    return {
      order: arm.name, completedMatches: arm.completed,
      meanMatchRounds: arm.matchLengths.length ? arm.matchLengths.reduce((sum, value) => sum + value, 0) / arm.matchLengths.length : null,
      medianMatchRounds: median(arm.matchLengths), unfinishedTailRounds: arm.activeRounds,
      appliedNonzeroEvents: arm.applied, zeroInputsSkipped: arm.zeroSkipped, pendingNonzeroEvents: arm.pending,
      scoreFloorHits: arm.floorHits, bustEvents: arm.bustEvents, maxScoreObserved: arm.maxScore, explodedSeatCounts
    };
  });

  const pairwise = [];
  for (let i = 0; i < arms.length; i++) for (let j = i + 1; j < arms.length; j++) {
    const a = arms[i], b = arms[j], bSet = new Set(b.finishIndices), aSet = new Set(a.finishIndices);
    const common = a.finishIndices.filter(index => bSet.has(index));
    const onlyA = a.finishIndices.filter(index => !bSet.has(index));
    const onlyB = b.finishIndices.filter(index => !aSet.has(index));
    let differentExploded = 0;
    for (const index of common) {
      const ai = a.finishIndices.indexOf(index), bi = b.finishIndices.indexOf(index);
      if (JSON.stringify(a.explodedAtFinish[ai]) !== JSON.stringify(b.explodedAtFinish[bi])) differentExploded++;
    }
    pairwise.push({
      orders: [a.name, b.name], commonFinishRoundIndices: common.length,
      uniqueBoundaryIndices: { [a.name]: onlyA.length, [b.name]: onlyB.length },
      sameBoundaryDifferentExplodedSeat: differentExploded
    });
  }

  return {
    schema: 'qosa-finish-score-event-order-sensitivity/v1',
    engine: 'qosha-research-0.5.3',
    rules: 'recovered qosa-1.0.0 coded round model; finish-pip scoring adapter is provisional; block outcomes unscored',
    policy: 'deterministic seed/turn/player hash selects a legal action index; validation-only, not a strategic arm',
    seed: { start: startSeed, attemptEnd: cursor - 1, attempts, acceptedRounds: accepted, redealSignals: redeals,
      uniqueAcceptedAllocations: seen.size, duplicateAcceptedAllocations: 0 },
    roundOutcomes: { finishes, blocks, unresolved, finishMinus: arms[0].finishMinus },
    arms: summaries, pairwiseBoundarySensitivity: pairwise,
    assumptions: 'Each finish maps terminal hand pips to all seats and adds finish-minus to the finisher. Blocks are unscored. Score deltas are applied sequentially in the listed manual-entry order; zero deltas are skipped; later nonzero deltas remain pending after match completion.',
    limitations: 'Only three of six seat permutations are tested. Independent accepted first-round deals are streamed as score rounds, not a physical match-start sequence. No strategy comparison, table-rule authentication, or historical-baseline pooling.'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(runAudit({
    startSeed: Number(process.argv[2] || 17000000),
    acceptedRounds: Number(process.argv[3] || 1000)
  }), null, 2) + '\n');
}
module.exports = { runAudit };
