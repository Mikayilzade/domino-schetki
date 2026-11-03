'use strict';

const e = require('./engine');
const init = require('./initializer');
const rd = require('./round-driver');
const integration = require('./finish-score-match-integration');

const DEFAULT_ORDERS = [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
const DEFAULT_ORDER_NAMES = DEFAULT_ORDERS.map(order => order.join('-'));

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
function riskAtBoundary(entities, deltas) {
  const candidates = entities.map((entity, seat) => ({
    seat, gap: 101 - entity.score, delta: deltas[seat]
  })).filter(item => !entities[item.seat].exploded && item.delta > 0);
  const minGap = candidates.length ? Math.min(...candidates.map(item => item.gap)) : null;
  return { minGap, crossingCandidateCount: candidates.filter(item => item.delta >= item.gap).length };
}
function riskBin(gap) {
  if (gap == null) return 'no-positive-delta';
  if (gap <= 10) return '01-10';
  if (gap <= 20) return '11-20';
  if (gap <= 40) return '21-40';
  return '41+';
}
function createArm(order, name) {
  return {
    name, order, current: zeroMatch(), activeRounds: 0, completed: 0,
    matchLengths: [], finishIndices: [], explodedAtFinish: [], placesAtFinish: [],
    matchRecords: [],
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
      const preRoundScores = arm.current.map(x => x.score);
      const boundaryRisk = riskAtBoundary(arm.current, mapped.deltas);
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
        const places = result.places.map(x => ({ entityId: x.entityId, place: x.place, points: x.points })).sort((a,b) => a.entityId.localeCompare(b.entityId));
        arm.placesAtFinish.push(places);
        arm.matchRecords.push({
          boundaryIndex: accepted - 1,
          minGapTo101: boundaryRisk.minGap,
          riskBin: riskBin(boundaryRisk.minGap),
          crossingCandidateCount: boundaryRisk.crossingCandidateCount,
          explodedSeats: newly,
          places,
          firstPlaceEntityId: places.find(x => x.place === 1)?.entityId || null
        });
        arm.activeRounds = 0;
        arm.current = zeroMatch();
      }
    }
  }

  const summaries = arms.map(arm => {
    const explodedSeatCounts = {};
    for (const seats of arm.explodedAtFinish) for (const seat of seats) explodedSeatCounts[seat] = (explodedSeatCounts[seat] || 0) + 1;
    return {
      order: arm.name, seatOrder: arm.order, completedMatches: arm.completed,
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
    let differentExploded = 0, differentPlaces = 0, differentFirstPlace = 0;
    const strata = {};
    for (const index of common) {
      const ai = a.finishIndices.indexOf(index), bi = b.finishIndices.indexOf(index);
      if (JSON.stringify(a.explodedAtFinish[ai]) !== JSON.stringify(b.explodedAtFinish[bi])) differentExploded++;
      const ap = a.placesAtFinish[ai], bp = b.placesAtFinish[bi];
      if (JSON.stringify(ap) !== JSON.stringify(bp)) differentPlaces++;
      const af = ap.find(x => x.place === 1)?.entityId || null;
      const bf = bp.find(x => x.place === 1)?.entityId || null;
      if (af !== bf) differentFirstPlace++;
      const ar = a.matchRecords[ai], br = b.matchRecords[bi];
      const gap = Math.min(ar.minGapTo101 ?? Infinity, br.minGapTo101 ?? Infinity);
      const bin = riskBin(gap === Infinity ? null : gap);
      if (!strata[bin]) strata[bin] = { boundaries: 0, differentExploded: 0, differentPlaces: 0, differentFirstPlace: 0 };
      strata[bin].boundaries++;
      if (JSON.stringify(ar.explodedSeats) !== JSON.stringify(br.explodedSeats)) strata[bin].differentExploded++;
      if (JSON.stringify(ar.places) !== JSON.stringify(br.places)) strata[bin].differentPlaces++;
      if (ar.firstPlaceEntityId !== br.firstPlaceEntityId) strata[bin].differentFirstPlace++;
    }
    pairwise.push({
      orders: [a.name, b.name], commonFinishRoundIndices: common.length,
      uniqueBoundaryIndices: { [a.name]: onlyA.length, [b.name]: onlyB.length },
      sameBoundaryDifferentExplodedSeat: differentExploded, sameBoundaryDifferentSurvivorPlaces: differentPlaces, sameBoundaryDifferentFirstPlace: differentFirstPlace,
      stratifiedByMinimumPreRoundGap: strata
    });
  }

  const stratifiedTotals = Object.fromEntries(['01-10','11-20','21-40','41+','no-positive-delta'].map(bin => {
    const totals = pairwise.reduce((sum, pair) => {
      const s = pair.stratifiedByMinimumPreRoundGap[bin];
      if (!s) return sum;
      sum.boundaries += s.boundaries;
      sum.differentExplodedSeats += s.differentExploded;
      sum.differentSurvivorPlaces += s.differentPlaces;
      sum.differentFirstPlaces += s.differentFirstPlace;
      return sum;
    }, { boundaries: 0, differentExplodedSeats: 0, differentSurvivorPlaces: 0, differentFirstPlaces: 0 });
    return [bin, totals];
  }));

  return {
    schema: 'qosa-pwa-order-proximity-six-permutation-holdout/v1',
    engine: 'qosha-research-0.5.3',
    rules: 'recovered qosa-1.0.0 coded round model; finish-pip scoring adapter is provisional; block outcomes unscored',
    policy: 'deterministic seed/turn/player hash selects a legal action index; validation-only, not a strategic arm',
    seed: { start: startSeed, attemptEnd: cursor - 1, attemptSeedRange: [startSeed, cursor - 1], attempts, acceptedRounds: accepted, redealSignals: redeals,
      uniqueAcceptedAllocations: seen.size, duplicateAcceptedAllocations: 0 },
    roundOutcomes: { finishes, blocks, unresolved, finishMinus: arms[0].finishMinus },
    arms: summaries, pairwiseBoundarySensitivity: pairwise,
    stratifiedTotalsAcross15DependentContrasts: stratifiedTotals,
    definitions: {
      proximity: 'Minimum 101 minus pre-round score among non-exploded seats receiving positive mapped deltas; matched pair uses the smaller gap from the two arms; bins 1-10, 11-20, 21-40, 41+.',
      matchedBoundary: 'Match-ending accepted-round index; only shared boundary indices are compared.'
    },
    assumptions: 'Each finish maps terminal hand pips to all seats and adds finish-minus to the finisher. Blocks are unscored. Score deltas are applied sequentially in the listed manual-entry order; zero deltas are skipped; later nonzero deltas remain pending after match completion.',
    limitations: 'All six seat permutations are tested on a disjoint 1,000-round holdout. Independent accepted first-round deals are streamed as score rounds, not a physical match-start sequence. No strategy comparison, table-rule authentication, or historical-baseline pooling.'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(runAudit({
    startSeed: Number(process.argv[2] || 17000000),
    acceptedRounds: Number(process.argv[3] || 1000)
  }), null, 2) + '\n');
}
module.exports = { runAudit };
