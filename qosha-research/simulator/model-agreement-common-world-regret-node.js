'use strict';
// Paired common-world regret audit for Qoşa açdı, recovered qosa-1.0.0 3x9.
// Branch-opening interpretations remain provisional. Uses the repository engine,
// initializer, turn-dispatcher, round-driver, hidden-world, decision-regret,
// strategy-runner and branch-current-full-round modules.

const e = require('./engine');
const init = require('./initializer');
const d = require('./turn-dispatcher');
const r = require('./round-driver');
const hidden = require('./hidden-world');
const regret = require('./decision-regret');
const strat = require('./strategy-runner');
const current = require('./branch-current-full-round');

const SIDES = e.SIDES;
const POLICY = 'closed-branch-control';
const WORLD_LIMIT = 24;
const SEED_MULTIPLIER = 0x85ebca6b;

function check(value, message) {
  if (!value) throw new Error('model-agreement-common-world-regret: ' + message);
}
function hashString(value) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function localXorshift32(seed) {
  let s=e.mixSeed32(seed); if(s===0)s=0x9e3779b9;
  return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/0x100000000;};
}
function tileKey(tile) { return e.tileKey(tile); }
function actionTiles(action) {
  return action.tiles || [action.tile].filter(Boolean);
}
function removedPips(action) { return e.pipSum(actionTiles(action)); }
function orbitKey(action, branchState) {
  const tiles = actionTiles(action).map(tileKey).join(',');
  if (action.side) {
    return [action.type, tiles, action.from, action.to,
      (action.numbers || []).join(','), branchState.branches[action.side].end].join('|');
  }
  return [action.type, tiles, (action.numbers || []).join(',')].join('|');
}
function chooseOrbit(opts, state, ctx) {
  const ranked = opts.actions.map(action => ({
    action,
    finish: action.type === 'mixed-finish' ? 1 : 0,
    openings: action.type === 'double-sequence' ? (action.numbers || []).length : 0,
    pips: removedPips(action)
  }));
  ranked.sort((a, b) =>
    b.finish - a.finish || a.openings - b.openings || b.pips - a.pips
  );
  const best = ranked[0];
  const top = ranked.filter(x =>
    x.finish === best.finish && x.openings === best.openings && x.pips === best.pips
  ).map(x => x.action);
  const groups = new Map();
  for (const action of top) {
    const key = orbitKey(action, state.branchState);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(action);
  }
  const sortedGroups = [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const seed = (Number(ctx.seed) >>> 0) ^
    Math.imul((ctx.turns || 0) + 1, 0x9e3779b9) ^
    Math.imul((ctx.player || 0) + 1, 0x85ebca6b) ^
    (ctx.salt || 0);
  // The extra mix matches the V8 audit's seeded orbit tie-break.
  const random = localXorshift32(e.mixSeed32(seed));
  const group = sortedGroups[Math.floor(random() * sortedGroups.length)][1];
  return group[Math.floor(random() * group.length)];
}
function cloneCurrentState(state) {
  return {
    branchState: e.cloneBranchState(state.branchState),
    openBySide: Object.fromEntries(SIDES.map(side =>
      [side, new Set(state.openBySide[side])]
    )),
    usedNumbers: new Set(state.usedNumbers),
    hands: state.hands.map(hand => hand.map(tile => [...tile])),
    stock: state.stock.map(tile => [...tile]),
    currentPlayer: state.currentPlayer,
    turns: state.turns,
    consecutivePasses: state.consecutivePasses,
    outcome: state.outcome ? { ...state.outcome } : null,
    counters: state.counters ? { ...state.counters } : undefined
  };
}
function currentFromBase(base) {
  return current.currentInit(base);
}
function currentOptions(state) {
  const p=state.currentPlayer;
  let hand=state.hands[p].map(tile=>[...tile]),stock=state.stock.map(tile=>[...tile]);
  let actions=current.actions(state,hand),drawn=false;
  if(actions.length)return{phase:'play',hand,stock,actions,drawn};
  if(stock.length){hand.push(stock[0]);stock=stock.slice(1);drawn=true;actions=current.actions(state,hand);
    if(actions.length)return{phase:'play',hand,stock,actions,drawn};}
  return{phase:'pass',hand,stock,actions:[],drawn};
}
function syncCurrentAfterGlobal(currentState, nextGlobal, action) {
  // Geometry is shared; only the opening ledger is model-specific.
  currentState.branchState = e.cloneBranchState(nextGlobal.branchState);
  if (action && (action.type === 'double-sequence' || action.type === 'mixed-finish')) {
    for (const entry of action.sequence) {
      for (const side of e.sidesEndingIn(currentState.branchState, entry.number)) {
        currentState.openBySide[side].add(entry.number);
      }
      currentState.usedNumbers.add(entry.number);
    }
  }
  currentState.hands = nextGlobal.hands.map(hand => hand.map(tile => [...tile]));
  currentState.stock = nextGlobal.stock.map(tile => [...tile]);
  currentState.currentPlayer = nextGlobal.currentPlayer;
  currentState.turns = nextGlobal.turns;
  currentState.consecutivePasses = nextGlobal.consecutivePasses;
  currentState.outcome = nextGlobal.outcome ? { ...nextGlobal.outcome } : null;
}
function currentActionKeys(state) {
  const opts = currentOptions(state);
  return opts.phase === 'play' ? opts.actions.map(regret.actionKey).sort() : [];
}
function globalActionKeys(state) {
  const opts = d.turnOptions(
    state.branchState, state.openingState, state.hands[state.currentPlayer], state.stock
  );
  return opts.phase === 'play' ? opts.actions.map(regret.actionKey).sort() : [];
}
function visibleSignature(state, currentState, played) {
  return [
    state.currentPlayer, state.turns, state.consecutivePasses,
    SIDES.map(side => state.branchState.branches[side].end).join(','),
    [...state.openingState.openedNumbers].sort((a,b)=>a-b).join(','),
    SIDES.map(side => [...currentState.openBySide[side]].sort((a,b)=>a-b).join('.')).join('/'),
    state.hands[state.currentPlayer].map(tileKey).sort().join(','),
    played.map(tileKey).sort().join(',')
  ].join('#');
}
function collectAgreementStates(startSeed,deals){
  const fullDeals=new Set(),seenVisible=new Set(),seenDisagreement=new Set();
  const candidates=[],disagreementCandidates=[];
  let decisions=0,actionSetDisagreements=0,commonHistoryDecisions=0,firstDivergences=0,postDivergenceDisagreements=0;
  let eligibleMultiAction=0,openingFollowups=0,openingPasses=0,firstDivergenceNoCommonActionPositions=0,firstDivergenceCommonMultiActionPositions=0;
  let firstDivergenceGlobalOnlyActionCount=0,firstDivergenceCurrentOnlyActionCount=0,firstDivergenceCommonActionCount=0;
  const firstDivergenceCommonActionHistogram={},openingSideCounts={up:0,left:0,right:0,down:0};
  const describeActions=actions=>actions.map(a=>({key:regret.actionKey(a),type:a.type,pips:removedPips(a),tiles:actionTiles(a).map(tileKey),side:a.side||null}));
  for(let seed=startSeed;seed<startSeed+deals;seed++){
    const raw=e.dealThreeByNine(seed);
    fullDeals.add(raw.hands.map(h=>h.map(tileKey).sort().join(',')).join('|')+'#'+raw.stock.map(tileKey).join(','));
    const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3,
      chooseFollowupSide:sides=>sides[(seed>>>0)%sides.length]});
    check(base.kind==='ready','initializer did not resolve seed '+seed);
    const gs=r.cloneRoundState(base),csState=currentFromBase(base),played=[[1,1]];
    if(base.openingFollowup){played.push([...base.openingFollowup.tile]);openingFollowups++;openingSideCounts[base.openingFollowup.side]++;}else openingPasses++;
    let commonHistory=true;
    for(let guard=0;!gs.outcome&&guard<200;guard++){
      const gKeys=globalActionKeys(gs),cKeys=currentActionKeys(csState);decisions++;if(commonHistory)commonHistoryDecisions++;
      const same=JSON.stringify(gKeys)===JSON.stringify(cKeys);
      if(!same){
        actionSetDisagreements++;
        if(commonHistory){
          firstDivergences++;
          const cSet=new Set(cKeys),gSet=new Set(gKeys),common=gKeys.filter(k=>cSet.has(k));
          const gOnly=gKeys.filter(k=>!cSet.has(k)),cOnly=cKeys.filter(k=>!gSet.has(k));
          firstDivergenceGlobalOnlyActionCount+=gOnly.length;firstDivergenceCurrentOnlyActionCount+=cOnly.length;firstDivergenceCommonActionCount+=common.length;
          firstDivergenceCommonActionHistogram[String(common.length)]=(firstDivergenceCommonActionHistogram[String(common.length)]||0)+1;
          if(!common.length)firstDivergenceNoCommonActionPositions++;if(common.length>=2)firstDivergenceCommonMultiActionPositions++;
          const sig=visibleSignature(gs,csState,played)+'#G:'+gKeys.join(';')+'#C:'+cKeys.join(';');
          if(!seenDisagreement.has(sig)){
            seenDisagreement.add(sig);
            const go=d.turnOptions(gs.branchState,gs.openingState,gs.hands[gs.currentPlayer],gs.stock),co=currentOptions(csState);
            const gm=new Map(go.actions.map(a=>[regret.actionKey(a),a])),cm=new Map(co.actions.map(a=>[regret.actionKey(a),a]));
            disagreementCandidates.push({seed,signature:sig,state:r.cloneRoundState(gs),current:cloneCurrentState(csState),played:played.map(t=>[...t]),
              actionKeys:common,candidateKeys:common,commonActionKeys:common,globalActionKeys:gKeys,currentActionKeys:cKeys,
              globalOnlyActionKeys:gOnly,currentOnlyActionKeys:cOnly,commonActionCount:common.length,globalActionCount:gKeys.length,
              currentActionCount:cKeys.length,actionCount:common.length,turn:gs.turns,
              globalOnlyActions:describeActions(gOnly.map(k=>gm.get(k)).filter(Boolean)),
              currentOnlyActions:describeActions(cOnly.map(k=>cm.get(k)).filter(Boolean)),
              commonActions:describeActions(common.map(k=>gm.get(k)).filter(Boolean))});
          }
        }else postDivergenceDisagreements++;
      }
      if(commonHistory&&same&&gKeys.length>=2){
        eligibleMultiAction++;const sig=visibleSignature(gs,csState,played);
        if(!seenVisible.has(sig)){seenVisible.add(sig);candidates.push({seed,signature:sig,state:r.cloneRoundState(gs),current:cloneCurrentState(csState),
          played:played.map(t=>[...t]),actionKeys:gKeys,candidateKeys:gKeys,actionCount:gKeys.length,turn:gs.turns,requireExactGlobalActionSet:true});}
      }
      if(!same)commonHistory=false;
      let chosen=null;const next=r.stepRound(gs,(opts,state)=>{chosen=chooseOrbit(opts,state,{seed,turns:state.turns,player:state.currentPlayer,salt:7});return chosen;});
      if(chosen)played.push(...actionTiles(chosen).map(t=>[...t]));
      syncCurrentAfterGlobal(csState,next,chosen);
      check(next.hands.flat().concat(next.stock).length+played.length===28,'trajectory tile conservation seed '+seed);
      Object.assign(gs,next);
    }
  }
  return{candidates,disagreementCandidates,metrics:{
    seedDraws:deals,uniqueFullAllocations:fullDeals.size,duplicateDeals:deals-fullDeals.size,decisionPositions:decisions,
    rootActionSetDisagreements:actionSetDisagreements,fullTrajectoryActionSetDisagreements:actionSetDisagreements,
    commonHistoryDecisionPositions:commonHistoryDecisions,firstDivergencePositions:firstDivergences,
    postDivergenceDisagreementPositions:postDivergenceDisagreements,
    commonHistoryDisagreementRate:commonHistoryDecisions?firstDivergences/commonHistoryDecisions:0,
    firstDivergenceNoCommonActionPositions,firstDivergenceCommonMultiActionPositions,
    firstDivergenceGlobalOnlyActionCount,firstDivergenceCurrentOnlyActionCount,firstDivergenceCommonActionCount,
    firstDivergenceCommonActionHistogram,uniqueVisibleFirstDivergenceStates:disagreementCandidates.length,
    eligibleMultiActionPositions:eligibleMultiAction,historyAgreementEligibleMultiActionPositions:eligibleMultiAction,
    uniqueVisibleAgreementStates:candidates.length,uniqueSeedsWithCandidate:new Set(candidates.map(x=>x.seed)).size,
    openingFollowups,openingPasses,openingFollowupSideCounts:openingSideCounts}};
}
function selectStates(candidates, target) {
  const cells = new Map();
  for (const state of candidates) {
    const actionBin = state.actionCount === 2 ? '2' :
      state.actionCount === 3 ? '3' : state.actionCount <= 6 ? '4-6' : '7+';
    const phase = state.turn <= 7 ? 'early' : state.turn <= 15 ? 'mid' : 'late';
    const cell = actionBin + '/' + phase;
    if (!cells.has(cell)) cells.set(cell, []);
    cells.get(cell).push(state);
  }
  for (const rows of cells.values()) rows.sort((a,b) =>
    hashString(a.signature) - hashString(b.signature) || a.signature.localeCompare(b.signature)
  );
  const selected = [], usedSeeds = new Set();
  const quota = Math.max(1, Math.floor(target / 12));
  for (const cell of [...cells.keys()].sort()) {
    let n = 0;
    for (const state of cells.get(cell)) {
      if (usedSeeds.has(state.seed)) continue;
      selected.push({ ...state, cell });
      usedSeeds.add(state.seed);
      if (++n >= quota) break;
    }
  }
  if (selected.length < target) {
    const rest = candidates.filter(x => !selected.some(y => y.signature === x.signature))
      .sort((a,b) => hashString(a.signature) - hashString(b.signature) ||
        a.signature.localeCompare(b.signature));
    for (const state of rest) {
      if (usedSeeds.has(state.seed)) continue;
      selected.push({ ...state, cell: 'fill' });
      usedSeeds.add(state.seed);
      if (selected.length >= target) break;
    }
  }
  return selected.slice(0, target);
}
function chooseCombinations(items, k) {
  const out = [];
  function rec(start, prefix) {
    if (prefix.length === k) { out.push(prefix); return; }
    for (let i = start; i <= items.length - (k - prefix.length); i++) {
      rec(i + 1, prefix.concat([items[i]]));
    }
  }
  rec(0, []);
  return out;
}
function conditionalWorldCount(n, groups) {
  let remaining = n, total = 1;
  for (let i = 0; i < groups.length - 1; i++) {
    const k = groups[i];
    let choose = 1;
    for (let j = 1; j <= Math.min(k, remaining - k); j++) {
      choose = choose * (remaining - j + 1) / j;
    }
    total *= Math.round(choose);
    remaining -= k;
  }
  return Math.round(total);
}
function enumerateAssignments(pool, groupSizes) {
  const out = [];
  function rec(remaining, index, groups) {
    if (index === groupSizes.length - 1) {
      out.push(groups.concat([remaining]));
      return;
    }
    for (const subset of chooseCombinations(remaining, groupSizes[index])) {
      const selected = new Set(subset.map(tileKey));
      rec(remaining.filter(tile => !selected.has(tileKey(tile))),
        index + 1, groups.concat([subset]));
    }
  }
  if (groupSizes.length === 1) return [[pool]];
  rec(pool, 0, []);
  return out;
}
function worldKey(state) {
  return state.hands.map(hand => hand.map(tileKey).sort().join(',')).join('|') +
    '#' + state.stock.map(tileKey).sort().join(',');
}
function hiddenWorlds(spec, count) {
  const focal = spec.state.currentPlayer;
  const pool = hidden.hiddenPool({ focalHand: spec.state.hands[focal], knownTiles: spec.played });
  const groupSizes = spec.state.hands.filter((_,p) => p !== focal).map(hand => hand.length);
  if (spec.state.stock.length) groupSizes.push(spec.state.stock.length);
  check(pool.length === groupSizes.reduce((a,b)=>a+b,0), 'hidden pool size mismatch');
  const space = conditionalWorldCount(pool.length, groupSizes);
  const worlds = [];
  let attempts = 0, duplicates = 0, method = 'exact-enumeration';
  const makeWorld = (hands, stock, seed) => {
    const state = r.cloneRoundState(spec.state);
    state.hands = hands.map(hand => hand.map(tile => [...tile]));
    state.stock = stock.map(tile => [...tile]);
    return { state, seed };
  };
  if (space <= count) {
    const assignments = enumerateAssignments(pool, groupSizes);
    check(assignments.length === space, 'exact hidden-world count mismatch');
    for (let i = 0; i < assignments.length; i++) {
      const hands = [[], [], []];
      let group = 0;
      for (let p = 0; p < 3; p++) {
        hands[p] = p === focal ? spec.state.hands[p].map(tile => [...tile]) :
          assignments[i][group++].map(tile => [...tile]);
      }
      const stock = spec.state.stock.length ? assignments[i][group].map(tile => [...tile]) : [];
      const seed = e.mixSeed32(hashString(spec.signature) ^
        Math.imul(spec.seed + 1, 0x9e3779b9) ^ Math.imul(i + 1, SEED_MULTIPLIER));
      worlds.push(makeWorld(hands, stock, seed));
    }
  } else {
    method = 'seeded-rejection-sample';
    const seen = new Set();
    const base = hashString(spec.signature) ^ Math.imul(spec.seed + 1, 0x9e3779b9);
    while (worlds.length < count && attempts < Math.max(1000, count * 100)) {
      const sampleSeed = e.mixSeed32(base ^ Math.imul(attempts + 1, SEED_MULTIPLIER));
      const sampled = hidden.sampleWorld({
        visibleState: spec.state,
        focalPlayer: focal,
        focalHand: spec.state.hands[focal],
        knownTiles: spec.played,
        hiddenHandSizes: spec.state.hands.map(hand => hand.length),
        stockSize: spec.state.stock.length
      }, sampleSeed);
      attempts++;
      const key = worldKey(sampled);
      if (seen.has(key)) { duplicates++; continue; }
      seen.add(key);
      const continuationSeed = e.mixSeed32(base ^ Math.imul(attempts, SEED_MULTIPLIER));
      worlds.push({ state: sampled, seed: continuationSeed });
    }
    check(worlds.length === count, 'hidden sample count mismatch; space=' + space);
  }
  return { worlds, attempts, duplicates, space, method };
}
function cloneCurrentForWorld(spec, world) {
  const s = cloneCurrentState(spec.current);
  s.hands = world.state.hands.map(hand => hand.map(tile => [...tile]));
  s.stock = world.state.stock.map(tile => [...tile]);
  s.currentPlayer = world.state.currentPlayer;
  s.turns = world.state.turns;
  s.consecutivePasses = world.state.consecutivePasses;
  s.outcome = null;
  return s;
}
function stepCurrent(s, chooser) {
  const p = s.currentPlayer;
  const opts = currentOptions(s);
  let hand = opts.hand;
  s.stock = opts.stock;
  if (opts.phase === 'pass') {
    s.hands[p] = hand;
    s.consecutivePasses++;
    s.turns++;
    if (!s.stock.length && s.consecutivePasses >= 3) {
      s.outcome = { kind: 'block', playerIndex: null, minus: 0, remainders: s.hands.map(e.pipSum) };
    } else s.currentPlayer = (p + 1) % 3;
    return { passed: true, action: null, played: [] };
  }
  const action = chooser(opts, s);
  check(opts.actions.includes(action), 'current-only policy chose illegal action');
  const played = [], finishDoubles = [];
  if (action.type === 'single' || action.type === 'mixed-finish') {
    s.branchState = e.applySinglePlacement(s.branchState, action);
    hand = hand.filter((_, i) => i !== action.handIndex);
    played.push(action.tile);
  }
  if (action.sequence) {
    for (const entry of action.sequence) {
      const matching = e.sidesEndingIn(s.branchState, entry.number);
      check(!s.usedNumbers.has(entry.number), 'double repeated');
      check(matching.length === entry.sides.length &&
        matching.every(side => entry.sides.includes(side)), 'current matching-side mismatch');
      s.usedNumbers.add(entry.number);
      for (const side of matching) s.openBySide[side].add(entry.number);
      hand = hand.filter(tile => tileKey(tile) !== tileKey(entry.tile));
      played.push(entry.tile);
      finishDoubles.push(entry.tile);
    }
  }
  s.hands[p] = hand;
  s.consecutivePasses = 0;
  s.turns++;
  if (!hand.length) {
    s.outcome = { kind: 'finish', playerIndex: p, minus: e.finishMinus(finishDoubles),
      remainders: s.hands.map(e.pipSum) };
  } else if (!s.stock.length && s.consecutivePasses >= 3) {
    s.outcome = { kind: 'block', playerIndex: null, minus: 0, remainders: s.hands.map(e.pipSum) };
  } else s.currentPlayer = (p + 1) % 3;
  return { passed: false, action, played };
}
function metrics(end, focal) {
  const outcome = end.outcome;
  const minus = outcome.kind === 'finish' && outcome.playerIndex === focal ? (outcome.minus || 0) : 0;
  return {
    focalFirst: outcome.kind === 'finish' && outcome.playerIndex === focal,
    remainder: e.pipSum(end.hands[focal]),
    minusRisk: minus < 0,
    minusLoss: -minus,
    outcomeKind: outcome.kind
  };
}
function simulateGlobal(spec, world, candidateKey) {
  let forced = true;
  const chooser = (opts, state) => {
    if (forced) {
      forced = false;
      const action = opts.actions.find(a => regret.actionKey(a) === candidateKey);
      check(action, 'global root candidate absent');
      return action;
    }
    return chooseOrbit(opts, state, {
      seed: world.seed, turns: state.turns, player: state.currentPlayer, salt: 11
    });
  };
  const end = r.runRound(world.state, chooser, { maxTurns: 200 });
  return metrics(end, spec.state.currentPlayer);
}
function simulateCurrent(spec, world, candidateKey) {
  const state = cloneCurrentForWorld(spec, world);
  let forced = true;
  while (!state.outcome && state.turns < 200) {
    stepCurrent(state, (opts, s) => {
      if (forced) {
        forced = false;
        const action = opts.actions.find(a => regret.actionKey(a) === candidateKey);
        check(action, 'current-only root candidate absent');
        return action;
      }
      return chooseOrbit(opts, s, {
        seed: world.seed, turns: s.turns, player: s.currentPlayer, salt: 11
      });
    });
  }
  if (!state.outcome) state.outcome = { kind: 'unresolved', reason: 'turn-limit' };
  return metrics(state, spec.state.currentPlayer);
}
function summarizeRegret(rows) {
  const out = {};
  for (const metric of ['firstFinishChance','meanRemainder','minusRisk','expectedMinusLoss']) {
    const values = rows.map(x => x.regret[metric]).filter(Number.isFinite);
    if (!values.length) { out[metric] = { mean: null, median: null, ci95: null }; continue; }
    const mean = values.reduce((a,b)=>a+b,0) / values.length;
    const sorted = values.slice().sort((a,b)=>a-b);
    const median = sorted.length % 2 ? sorted[(sorted.length-1)/2] :
      (sorted[sorted.length/2-1] + sorted[sorted.length/2]) / 2;
    const sd = Math.sqrt(values.reduce((s,x)=>s+(x-mean)**2,0) / Math.max(1,values.length-1));
    out[metric] = { mean, median, ci95: 1.96 * sd / Math.sqrt(values.length) };
  }
  return out;
}
function evaluateState(spec,worldsPerState){
  const sampled=hiddenWorlds(spec,worldsPerState),keys=spec.candidateKeys||spec.actionKeys,candidates=keys.map(key=>({key,global:[],current:[]}));
  let evaluations=0;
  for(const world of sampled.worlds){
    const gKeys=globalActionKeys(world.state),cState=cloneCurrentForWorld(spec,world),cKeys=currentActionKeys(cState);
    if(spec.requireExactGlobalActionSet){check(JSON.stringify(gKeys)===JSON.stringify(spec.actionKeys),'global action set changed across worlds');
      check(JSON.stringify(cKeys)===JSON.stringify(spec.actionKeys),'current action set changed across worlds');}
    for(const candidate of candidates){check(gKeys.includes(candidate.key),'candidate absent from global action set');
      check(cKeys.includes(candidate.key),'candidate absent from current-only action set');
      candidate.global.push(simulateGlobal(spec,world,candidate.key));candidate.current.push(simulateCurrent(spec,world,candidate.key));evaluations+=2;}
  }
  const summary=name=>{
    const values=candidates.map(c=>{const rows=c[name],n=rows.length;return{first:rows.filter(x=>x.focalFirst).length/n,
      remainder:rows.reduce((s,x)=>s+x.remainder,0)/n,risk:rows.filter(x=>x.minusRisk).length/n,loss:rows.reduce((s,x)=>s+x.minusLoss,0)/n};});
    const best={first:Math.max(...values.map(x=>x.first)),remainder:Math.min(...values.map(x=>x.remainder)),
      risk:Math.min(...values.map(x=>x.risk)),loss:Math.min(...values.map(x=>x.loss))};
    return{candidateCount:values.length,regret:summarizeRegret(values.map(x=>({regret:{firstFinishChance:best.first-x.first,
      meanRemainder:x.remainder-best.remainder,minusRisk:x.risk-best.risk,expectedMinusLoss:x.loss-best.loss}})))};
  };
  const rows=candidates.flatMap(c=>[...c.global,...c.current]),outcomeKinds={finish:0,block:0,unresolved:0};
  for(const row of rows)if(outcomeKinds[row.outcomeKind]!==undefined)outcomeKinds[row.outcomeKind]++;
  return{seed:spec.seed,cell:spec.cell,turn:spec.turn,actionCount:spec.actionCount,candidateCount:candidates.length,
    worlds:sampled.worlds.length,attempts:sampled.attempts,duplicates:sampled.duplicates,method:sampled.method,
    conditionalWorldCount:sampled.space,evaluations,outcomeKinds,global:summary('global'),currentOnly:summary('current')};
}
function runAudit(startSeed=3409970, deals=500, targetStates=72, worldsPerState=WORLD_LIMIT) {
  check(Number.isInteger(startSeed) && Number.isInteger(deals) && deals > 0, 'seed/count');
  const cohort = collectAgreementStates(startSeed, deals);
  const selected = selectStates(cohort.candidates, targetStates);
  const states = selected.map(state => evaluateState(state, worldsPerState));
  const totals = {
    states: states.length,
    selectedDeals: new Set(states.map(x=>x.seed)).size,
    worldPairs: states.reduce((s,x)=>s+x.worlds,0),
    sampledDraws: states.reduce((s,x)=>s+x.attempts,0),
    exactWorlds: states.filter(x=>x.method==='exact-enumeration').reduce((s,x)=>s+x.worlds,0),
    exactStates: states.filter(x=>x.method==='exact-enumeration').length,
    sampledStates: states.filter(x=>x.method==='seeded-rejection-sample').length,
    duplicateDraws: states.reduce((s,x)=>s+x.duplicates,0),
    candidateWorldEvaluations: states.reduce((s,x)=>s+x.evaluations,0)
  };
  const aggregate = model => summarizeRegret(states.flatMap(state =>
    Object.entries(state[model].regret).map(([metric,value]) => ({ regret: { [metric]: value.mean } }))
  ));
  return {
    schema: 'qosha-model-agreement-common-world-regret-node/v1',
    timestampAsiaBaku: new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'}).replace(' ','T')+'+04:00',
    engine: 'qosa-research-0.5.3 modules; recovered qosa-1.0.0; 3x9+stock',
    startSeed, endSeed: startSeed+deals-1, seedDraws: deals,
    trajectory: cohort.metrics,
    selection: {
      targetStates, selectedStates: states.length, selectedDeals: totals.selectedDeals,
      byCell: Object.fromEntries([...new Set(states.map(x=>x.cell))].map(cell =>
        [cell,states.filter(x=>x.cell===cell).length])),
      uniqueVisibleAgreementStates: cohort.candidates.length
    },
    hiddenWorldSampling: {
      requestedPerState: worldsPerState, stateWorldPairs: totals.worldPairs,
      sampledDraws: totals.sampledDraws, exactWorlds: totals.exactWorlds,
      exactStates: totals.exactStates, sampledStates: totals.sampledStates,
      duplicateDraws: totals.duplicateDraws,
      method: 'uniform conditional allocations; exact enumeration if space <= request; otherwise seeded rejection without replacement'
    },
    evaluations: totals,
    regret: { global: aggregate('global'), currentOnly: aggregate('currentOnly') },
    states
  };
}
function runDisagreementAudit(startSeed=3410470,deals=500,targetStates=72,worldsPerState=WORLD_LIMIT){
  check(Number.isInteger(startSeed)&&Number.isInteger(deals)&&deals>0,'seed/count');
  const cohort=collectAgreementStates(startSeed,deals),eligible=cohort.disagreementCandidates.filter(x=>x.commonActionCount>=2);
  const selected=selectStates(eligible,targetStates),states=selected.map(s=>evaluateState({...s,candidateKeys:s.commonActionKeys,requireExactGlobalActionSet:false},worldsPerState));
  const totals={states:states.length,selectedDeals:new Set(states.map(x=>x.seed)).size,worldPairs:states.reduce((s,x)=>s+x.worlds,0),
    sampledDraws:states.reduce((s,x)=>s+x.attempts,0),exactWorlds:states.filter(x=>x.method==='exact-enumeration').reduce((s,x)=>s+x.worlds,0),
    exactStates:states.filter(x=>x.method==='exact-enumeration').length,sampledStates:states.filter(x=>x.method==='seeded-rejection-sample').length,
    duplicateDraws:states.reduce((s,x)=>s+x.duplicates,0),candidateWorldEvaluations:states.reduce((s,x)=>s+x.evaluations,0),
    outcomeKinds:states.reduce((a,x)=>{for(const k of Object.keys(a))a[k]+=x.outcomeKinds[k]||0;return a;},{finish:0,block:0,unresolved:0})};
  const aggregate=model=>summarizeRegret(states.flatMap(s=>Object.entries(s[model].regret).map(([metric,value])=>({regret:{[metric]:value.mean}}))));
  const typeCounts=rows=>{const out={};for(const row of rows)for(const action of row)out[action.type]=(out[action.type]||0)+1;return out;};
  const histogram={};for(const row of cohort.disagreementCandidates){const k=String(row.commonActionCount);histogram[k]=(histogram[k]||0)+1;}
  const cand=cohort.disagreementCandidates;
  return{schema:'qosha-model-disagreement-common-action-intersection/v1',timestampAsiaBaku:'2026-11-01T11:47:32+04:00',
    engine:'qosa-research-0.5.3 modules; recovered qosa-1.0.0; 3x9+stock',startSeed,endSeed:startSeed+deals-1,seedDraws:deals,
    trajectory:cohort.metrics,census:{uniqueFirstDivergenceStates:cand.length,eligibleCommonActionIntersectionStates:eligible.length,
      commonActionCountHistogram:histogram,globalOnlyActionDescriptors:typeCounts(cand.map(x=>x.globalOnlyActions)),
      currentOnlyActionDescriptors:typeCounts(cand.map(x=>x.currentOnlyActions)),commonActionDescriptors:typeCounts(cand.map(x=>x.commonActions)),
      meanGlobalOnlyActionsPerUniqueDivergence:cand.length?cand.reduce((s,x)=>s+x.globalOnlyActionKeys.length,0)/cand.length:0,
      meanCurrentOnlyActionsPerUniqueDivergence:cand.length?cand.reduce((s,x)=>s+x.currentOnlyActionKeys.length,0)/cand.length:0,
      meanCommonActionsPerUniqueDivergence:cand.length?cand.reduce((s,x)=>s+x.commonActionCount,0)/cand.length:0},
    selection:{targetStates,selectedStates:states.length,selectedDeals:totals.selectedDeals,
      byCell:Object.fromEntries([...new Set(states.map(x=>x.cell))].map(cell=>[cell,states.filter(x=>x.cell===cell).length])),
      eligibleUniqueStates:eligible.length},
    hiddenWorldSampling:{requestedPerState:worldsPerState,stateWorldPairs:totals.worldPairs,sampledDraws:totals.sampledDraws,
      exactWorlds:totals.exactWorlds,exactStates:totals.exactStates,sampledStates:totals.sampledStates,duplicateDraws:totals.duplicateDraws,
      method:'uniform conditional allocations; exact enumeration if space <= request; otherwise seeded rejection without replacement'},
    evaluations:totals,regret:{global:aggregate('global'),currentOnly:aggregate('currentOnly')},states};
}
function test(){
  const deck=e.createDoubleSixDeck();check(deck.length===28&&new Set(deck.map(tileKey)).size===28,'deck');
  const base=init.initializeThreePlayerRound({seed:3409970,isFirstRound:false,previousWinnerIndex:3409970%3,
    chooseFollowupSide:sides=>sides[(3409970>>>0)%sides.length]});
  check(base.kind==='ready','initializer');const cstate=currentFromBase(base);
  check(currentOptions(cstate).phase==='play'||currentOptions(cstate).phase==='pass','current options');
  const agreement=runAudit(3409970,8,4,2);check(agreement.trajectory.uniqueFullAllocations===8,'agreement replay');
  check(agreement.selection.selectedStates>0,'agreement selection');
  const disagreement=runDisagreementAudit(3410470,60,12,4);
  check(disagreement.trajectory.uniqueFullAllocations===60,'disagreement replay');
  check(disagreement.census.eligibleCommonActionIntersectionStates>=12,'intersection sample');
  check(disagreement.evaluations.candidateWorldEvaluations>0,'paired evaluations');
  check(disagreement.evaluations.outcomeKinds.unresolved===0,'unresolved pilot');
  return{passed:true,agreementPilotDeals:8,agreementStates:agreement.selection.selectedStates,
    disagreementPilotDeals:60,firstDivergenceStates:disagreement.census.uniqueFirstDivergenceStates,
    eligibleIntersectionStates:disagreement.census.eligibleCommonActionIntersectionStates,
    selectedIntersectionStates:disagreement.selection.selectedStates,hiddenWorldPairs:disagreement.evaluations.worldPairs,
    candidateWorldEvaluations:disagreement.evaluations.candidateWorldEvaluations,unresolved:disagreement.evaluations.outcomeKinds.unresolved};
}
if (require.main === module) {
  const args = process.argv.slice(2);
  const result = args[0] === 'test' ? test() :
    runAudit(Number(args[0] || 3409970), Number(args[1] || 500),
      Number(args[2] || 72), Number(args[3] || WORLD_LIMIT));
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}
module.exports = { runAudit, runDisagreementAudit, test, collectAgreementStates, selectStates, hiddenWorlds, evaluateState };
