'use strict';
/**
 * Replays the 20M six-order cohort and records event-level evidence at
 * match-ending boundaries. Never scores blocks or alters live PWA files.
 */
const e = require('./engine');
const init = require('./initializer');
const rd = require('./round-driver');
const scoring = require('./match-scoring');
const integration = require('./finish-score-match-integration');
const prior = require('./finish-score-event-order-proximity-six-permutation-holdout');

const ORDERS = [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
function check(ok, message) { if (!ok) throw new Error(message); }
function same(a,b) { return JSON.stringify(a) === JSON.stringify(b); }
function zeroMatch() { return [0,1,2].map(i => ({id:'P'+i,score:0,exploded:false})); }
function choose(opts,state,seed) {
  if (opts.phase !== 'play' || !opts.actions.length) return null;
  const h=e.mixSeed32((seed ^ Math.imul(state.turns+1,0x9e3779b9) ^
    Math.imul(state.currentPlayer+1,0x85ebca6b) ^ 0x51) >>> 0);
  return opts.actions[h % opts.actions.length];
}
function bin(gap) {
  if (gap == null) return 'no-positive-delta';
  return gap<=10?'01-10':gap<=20?'11-20':gap<=40?'21-40':'41+';
}
function scoreTrace(before, mapped, order) {
  const current=before.map(x=>({...x}));
  const events=[], used=new Set();
  let finished=false, places=[];
  for (const seat of order) {
    const delta=mapped.deltas[seat];
    if (delta===0) {used.add(seat);continue;}
    const preScore=current[seat].score;
    const result=scoring.evaluateQoshaScoreEvent(current,current[seat].id,delta);
    current.splice(0,current.length,...result.entities);
    events.push({seat,delta,before:preScore,after:current[seat].score,
      crossed:!result.ignored && preScore<101 && current[seat].score>=101,
      finished:result.finished,ignored:!!result.ignored});
    used.add(seat);
    if (result.finished) {finished=true;places=result.places;break;}
  }
  return {entities:current,events,finished,places,
    pending:order.filter(seat=>!used.has(seat)&&mapped.deltas[seat]!==0),
    skippedZero:order.filter(seat=>mapped.deltas[seat]===0)};
}
function traceFixture() {
  const before=[80,88,90].map((score,i)=>({id:'P'+i,score,exploded:false}));
  const mapped={deltas:[30,10,15]};
  const a=scoreTrace(before,mapped,[0,1,2]),b=scoreTrace(before,mapped,[1,0,2]);
  check(a.finished&&b.finished,'fixture did not finish');
  check(same(a.entities.map(x=>x.exploded),b.entities.map(x=>x.exploded)),'fixture exploded seat differs');
  check(!same(a.places,b.places),'fixture did not change places');
  check(a.pending.includes(1)&&!b.pending.includes(1),'fixture pending mismatch');
  return {preScores:[80,88,90],deltas:mapped.deltas,orders:['0-1-2','1-0-2'],
    aPlaces:a.places,bPlaces:b.places,aPending:a.pending,bPending:b.pending};
}
function runTraceAudit({startSeed=20000000,acceptedRounds=1000}={}) {
  const arms=ORDERS.map(order=>({order,name:order.join('-'),entities:zeroMatch(),records:new Map(),finished:0}));
  let cursor=startSeed,attempts=0,redeals=0,finishes=0,blocks=0,checks=0;
  const seen=new Set();
  for (let round=0;round<acceptedRounds;round++) {
    let ready=null,seed=null;
    for(let tries=0;tries<100;tries++){
      seed=cursor++;attempts++;
      const deal=e.dealThreeByNine(seed);
      const setup=init.initializeThreePlayerRoundFromDeal({...deal,isFirstRound:true});
      if(setup.kind==='redeal'){redeals++;continue;}
      check(setup.kind==='ready','unexpected initializer');
      const keys=xs=>xs.map(e.tileKey).sort().join(',');
      const fingerprint=deal.hands.map(keys).join('|')+'|stock='+keys(deal.stock);
      check(!seen.has(fingerprint),'duplicate accepted allocation');
      seen.add(fingerprint);ready=setup;break;
    }
    check(!!ready,'redeal cap reached');
    const terminal=rd.runRound(ready,(opts,state)=>choose(opts,state,seed),{maxTurns:200});
    const outcome=terminal.outcome;
    check(outcome&&['finish','block'].includes(outcome.kind),'unresolved round');
    if(outcome.kind==='block'){blocks++;continue;}
    finishes++;
    const mapped=integration.finishOutcomeToDeltas(outcome,3);
    for(const arm of arms) {
      const before=arm.entities.map(x=>({...x}));
      const replay=scoreTrace(before,mapped,arm.order);
      const adapter=integration.applyFinishOutcomeToMatch(before,outcome,{seatOrder:arm.order});
      check(same(replay.entities,adapter.entities),'event replay differs from adapter');
      check(replay.finished===adapter.finished,'finish mismatch');
      check(same(replay.places,adapter.places),'place mismatch');
      check(same(replay.pending,adapter.pendingSeats),'pending mismatch');
      check(same(replay.skippedZero,adapter.skippedZeroSeats),'zero skip mismatch');
      checks+=5;
      arm.entities=adapter.entities;
      if(adapter.finished) {
        arm.finished++;
        const candidates=before.map((entity,seat)=>({
          gap:101-entity.score,delta:mapped.deltas[seat],eligible:!entity.exploded&&mapped.deltas[seat]>0
        })).filter(x=>x.eligible);
        const gap=candidates.length?Math.min(...candidates.map(x=>x.gap)):null;
        const exploded=arm.entities.map((x,i)=>x.exploded?i:null).filter(x=>x!==null);
        const places=[...adapter.places].sort((a,b)=>a.entityId.localeCompare(b.entityId));
        arm.records.set(round,{
          roundIndex:round,preScores:before.map(x=>x.score),deltas:mapped.deltas,
          minGap:gap,bin:bin(gap),exploded,places,
          survivorScores:arm.entities.filter(x=>!x.exploded).map(x=>({id:x.id,score:x.score})),
          events:replay.events,pending:replay.pending,skippedZero:replay.skippedZero
        });
        arm.entities=zeroMatch();
      }
    }
  }
  const pairs=[], examples=[],caseTraces=[],uniqueBoundaries=new Set();
  let rankDiff=0,explodedDiff=0,sortOnly=0,changedSurvivorScores=0,
    pendingSurvivorDiff=0,preScoreDiff=0,unchangedPending=0;
  const perBoundary=new Map();
  for(let i=0;i<arms.length;i++)for(let j=i+1;j<arms.length;j++){
    const a=arms[i],b=arms[j];let pairCount=0;
    check(same([...a.records.keys()],[...b.records.keys()]),'boundary indices differ');
    for(const [index,ar] of a.records){
      const br=b.records.get(index);
      const gap=Math.min(ar.minGap??Infinity,br.minGap??Infinity);
      if(bin(gap===Infinity?null:gap)!=='11-20')continue;
      if(!same(ar.exploded,br.exploded))explodedDiff++;
      if(same(ar.places,br.places)||!same(ar.exploded,br.exploded))continue;
      rankDiff++;pairCount++;uniqueBoundaries.add(index);
      perBoundary.set(index,(perBoundary.get(index)||0)+1);
      const scoresDiffer=!same(ar.survivorScores,br.survivorScores);
      if(scoresDiffer)changedSurvivorScores++;else sortOnly++;
      if(!same(ar.preScores,br.preScores))preScoreDiff++;
      const survivorIds=new Set(ar.survivorScores.map(x=>x.id));
      const pendingA=ar.pending.filter(x=>survivorIds.has('P'+x)).sort();
      const pendingB=br.pending.filter(x=>survivorIds.has('P'+x)).sort();
      if(!same(pendingA,pendingB))pendingSurvivorDiff++;else unchangedPending++;
      const caseTrace={roundIndex:index,orders:[a.name,b.name],
        minGap:gap,preScoresA:ar.preScores,preScoresB:br.preScores,deltas:ar.deltas,
        a:{events:ar.events,pending:ar.pending,skippedZero:ar.skippedZero,survivorScores:ar.survivorScores,places:ar.places},
        b:{events:br.events,pending:br.pending,skippedZero:br.skippedZero,survivorScores:br.survivorScores,places:br.places}};
      caseTraces.push(caseTrace);
      if(examples.length<3)examples.push(caseTrace);
    }
    pairs.push({orders:[a.name,b.name],rankChanges11to20SameExploded:pairCount});
  }
  const baseline=prior.runAudit({startSeed,acceptedRounds});
  check(baseline.seed.attemptEnd===cursor-1,'seed range drift');
  check(baseline.roundOutcomes.finishes===finishes&&baseline.roundOutcomes.blocks===blocks,'outcome drift');
  check(baseline.stratifiedTotalsAcross15DependentContrasts['11-20'].differentSurvivorPlaces===rankDiff,'rank mismatch');
  check(baseline.stratifiedTotalsAcross15DependentContrasts['11-20'].differentExplodedSeats===explodedDiff,'exploded mismatch');
  check(rankDiff===changedSurvivorScores+sortOnly,'classification mismatch');
  checks+=5;
  return {
    schema:'qosa-pwa-order-event-trace-audit/v1',
    engine:'qosha-research-0.5.3',
    rules:'recovered qosa-1.0.0 3x9 coded model; finish-pip mapping provisional; blocks unscored',
    seed:{start:startSeed,end:cursor-1,attempts,redeals,acceptedRounds,uniqueAllocations:seen.size},
    roundOutcomes:{finishes,blocks},
    sixOrders:arms.map(x=>({order:x.name,completedMatches:x.finished})),
    analysis:{pairwiseRankChanges11to20SameExploded:rankDiff,explodedSeatDifferences11to20:explodedDiff,
      changedSurvivorScores,sortOnly,changedPendingSurvivorSet:pendingSurvivorDiff,
      unchangedPendingSurvivorSet:unchangedPending,changedPreRoundScores:preScoreDiff,
      uniqueAffectedBoundaries:uniqueBoundaries.size,
      comparisonsPerBoundary:[...perBoundary.entries()].sort((a,b)=>a[0]-b[0]).map(([roundIndex,contrasts])=>({roundIndex,contrasts})),
      pairwise:pairs},
    examples,caseTraces,fixture:traceFixture(),
    validation:{passed:true,checks,baselineBin11to20:baseline.stratifiedTotalsAcross15DependentContrasts['11-20'],
      exactSeedRange:true,adapterTraceEquivalence:true},
    limitations:'15 pairwise contrasts are dependent, not 26 independent matches. Event-order effect is a PWA manual-entry artifact under provisional finish-pip mapping; block outcomes unscored; no physical-rule or strategy conclusion.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(runTraceAudit(),null,2)+'\n');
module.exports={runTraceAudit,scoreTrace,traceFixture};
