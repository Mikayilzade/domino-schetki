'use strict';
// Audit matched-double retention for exact post-action geometry and immediate opponent mobility.
// Node: node qosha-research/simulator/matched-double-geometry-audit.js test
// Node: node qosha-research/simulator/matched-double-geometry-audit.js 3145000 3215000 20 100
const e=require('./engine'),d=require('./turn-dispatcher'),hw=require('./hidden-world');
const {actionKey}=require('./decision-regret');
const {capture,passProb}=require('./consecutive-pass-forecast-runner');
const {describe,matchedPair}=require('./matched-double-retention-runner');
const oldDiscovery=[2988116,2989006,2989575,2990700,2991229,2991714,2995935,2996027,2996301,3001434,3004224,3006093,3009589,3012104,3012590,3012745,3013705,3013962,3014914,3015724,3018836,3019380,3020529,3020568,3024158,3024866,3026182,3027574,3030218,3030341];
const oldHoldout=[3066102,3066875,3072112,3073053,3074777,3075337,3076869,3077474,3079545,3081207,3083527,3086669,3086845,3092294,3093243,3094648,3096914,3097654,3099005,3102632,3102932,3103122,3104742,3106013,3106808,3106928,3108182,3108302,3108549,3108877];
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
const opened=s=>[...s.openingState.openedNumbers].sort((a,b)=>a-b);
const ends=s=>e.SIDES.map(side=>s.branchState.branches[side].end);
function auditPosition(seed,worldCount=100){
 const pos=capture(seed);
 if(!pos)throw Error('position not reachable '+seed);
 const pair=matchedPair(describe(pos));
 if(!pair)throw Error('no matched double-retention pair '+seed);
 const [keep,spend]=pair,byKey=new Map(pos.actions.map(a=>[actionKey(a),a]));
 const before=JSON.stringify(pos.spec.visibleState);
 const k=d.applyTurn(pos.spec.visibleState.branchState,pos.spec.visibleState.openingState,pos.spec.focalHand,[],byKey.get(keep.key));
 const s=d.applyTurn(pos.spec.visibleState.branchState,pos.spec.visibleState.openingState,pos.spec.focalHand,[],byKey.get(spend.key));
 const playable=state=>new Set(pos.pool.filter(t=>d.actionsForHand(state.branchState,state.openingState,[t]).length>0).map(e.tileKey));
 const pk=playable(k),ps=playable(s),overlap=[...pk].filter(x=>ps.has(x)).length;
 if(pk.size!==ps.size||pk.size!==keep.k||keep.k!==spend.k)throw Error('K matching broken '+seed);
 if(keep.discardPips!==spend.discardPips||keep.remaining!==spend.remaining||keep.doublesRetained<=spend.doublesRetained)throw Error('pair matching broken '+seed);
 const next=(pos.spec.focalPlayer+1)%3,handSize=pos.spec.hiddenHandSizes[next];
 const exactKeepPass=passProb(pos.pool.length,pk.size,handSize),exactSpendPass=passProb(pos.pool.length,ps.size,handSize);
 if(Math.abs(exactKeepPass-exactSpendPass)>1e-12)throw Error('exact pass probability differs');
 let keepOnlyPass=0,spendOnlyPass=0,bothPass=0,bothPlay=0;
 const worldSeedStart=(970000000+Math.imul(seed,997))>>>0;
 for(let wi=0;wi<worldCount;wi++){
  const w=hw.sampleWorld(pos.spec,(worldSeedStart+wi)>>>0),h=w.hands[next];
  const ka=d.actionsForHand(k.branchState,k.openingState,h).length===0;
  const sa=d.actionsForHand(s.branchState,s.openingState,h).length===0;
  if(ka&&sa)bothPass++;else if(!ka&&!sa)bothPlay++;else if(ka)keepOnlyPass++;else spendOnlyPass++;
 }
 if(JSON.stringify(pos.spec.visibleState)!==before)throw Error('source state mutated');
 const connector=keep.after.some(t=>t[0]===t[1]&&keep.after.some(u=>u[0]!==u[1]&&(u[0]===t[0]||u[1]===t[0])));
 return{seed,turn:pos.turn,nextHand:handSize,hand:pos.spec.focalHand,
  keepAction:keep.key,spendAction:spend.key,discardPips:keep.discardPips,k:pk.size,
  retainedConnector:connector,keepDoubles:keep.doublesRetained,spendDoubles:spend.doublesRetained,
  keepEnds:ends(k),spendEnds:ends(s),keepOpened:opened(k),spendOpened:opened(s),
  changedEnds:ends(k).filter((x,i)=>x!==ends(s)[i]).length,
  changedOpened:opened(k).join(',')!==opened(s).join(','),
  sharedPlayable:overlap,playableOverlap:pk.size?overlap/pk.size:1,
  samePlayableSet:overlap===pk.size,exactNextPassProbability:exactKeepPass,
  worldSeedStart,worlds:worldCount,keepOnlyPass,spendOnlyPass,bothPass,bothPlay,
  passFlipRate:(keepOnlyPass+spendOnlyPass)/worldCount,
  sampledPassDifference:(keepOnlyPass-spendOnlyPass)/worldCount};
}
function summarize(rows){
 const w=rows.reduce((s,r)=>s+r.worlds,0);
 const total=(field)=>rows.reduce((s,r)=>s+r[field],0);
 const byConnector={with:rows.filter(r=>r.retainedConnector),without:rows.filter(r=>!r.retainedConnector)};
 return{positions:rows.length,hiddenWorlds:w,
  exactKAndPipMatched:rows.every(r=>r.k>=0),
  differentOpened:rows.filter(r=>r.changedOpened).length,
  differentEnds:rows.filter(r=>r.changedEnds>0).length,
  identicalPlayableSets:rows.filter(r=>r.samePlayableSet).length,
  meanPlayableOverlap:mean(rows.map(r=>r.playableOverlap)),
  meanPositionPassFlip:mean(rows.map(r=>r.passFlipRate)),
  pairedPassFlipRate:w?(total('keepOnlyPass')+total('spendOnlyPass'))/w:null,
  keepOnlyPass:total('keepOnlyPass'),spendOnlyPass:total('spendOnlyPass'),
  bothPass:total('bothPass'),bothPlay:total('bothPlay'),
  meanSampledPassDifference:mean(rows.map(r=>r.sampledPassDifference)),
  exactPassProbabilityDifference:0,
  withConnector:{positions:byConnector.with.length,meanOverlap:mean(byConnector.with.map(r=>r.playableOverlap)),meanPassFlip:mean(byConnector.with.map(r=>r.passFlipRate))},
  withoutConnector:{positions:byConnector.without.length,meanOverlap:mean(byConnector.without.map(r=>r.playableOverlap)),meanPassFlip:mean(byConnector.without.map(r=>r.passFlipRate))}};
}
function run(start=3145000,end=3215000,limit=20,worldCount=100){
 if(![start,end,limit,worldCount].every(Number.isInteger)||start>=end||limit<1||worldCount<1)throw Error('bad args');
 const previousDiscovery=oldDiscovery.map(seed=>auditPosition(seed,worldCount));
 const previousHoldout=oldHoldout.map(seed=>auditPosition(seed,worldCount));
 const fresh=[];let scanned=0,eligible=0;
 for(let seed=start;seed<end&&fresh.length<limit;seed++){
  scanned++;const pos=capture(seed);if(!pos)continue;eligible++;
  if(!matchedPair(describe(pos)))continue;
  fresh.push(auditPosition(seed,worldCount));
 }
 if(fresh.length!==limit)throw Error('insufficient fresh positions '+fresh.length+'/'+limit);
 const cohorts={priorDiscovery:summarize(previousDiscovery),priorHoldout:summarize(previousHoldout),fresh:summarize(fresh)};
 return{schema:'qosa-matched-double-geometry-audit/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
  mode:'3x9',timestampBaku:'2026-10-14 01:53 +04:00',seeds:{priorDiscovery:oldDiscovery,priorHoldout:oldHoldout,freshRange:[start,end],freshSelected:fresh.map(x=>x.seed),freshScanned:scanned,freshPassPositions:eligible},
  worldSeedFormula:'(970000000+Math.imul(dealSeed,997)+worldIndex)>>>0',
  worldCountPerPosition:worldCount,cohorts,
  totals:summarize([...previousDiscovery,...previousHoldout,...fresh]),
  rows:{priorDiscovery:previousDiscovery,priorHoldout:previousHoldout,fresh},
  newFullStrategyRounds:0,verifiedPriorFullStrategyRounds:180000,
  finding:'Equal K guarantees equal marginal next-opponent pass probability under uniform hidden allocations, but not the same playable tile identities, branch ends or opened numbers. Sampled pass events can flip between actions in the same hidden world. Double-retention causal effect remains unidentified.',
  limitations:'Selected two-pass reachable positions only, uniform unknown allocation (not history-conditioned posterior), deterministic min-pips discovery, 100 world samples per position, no full continuations here, assumed branch semantics; next-pass event is only immediate legal availability, not actual opponent strategy. Previous 60 selected seeds reused only for geometry audit; fresh cohort disjoint.',
  next:'Compare full continuations conditional on immediate legal-response identity and post-action branch geometry on fresh seeds; do not interpret conditional post-action strata causally. Add earlier-game matched action controls.'};
}
function test(){
 const a=auditPosition(2988116,20),b=auditPosition(2988116,20);
 if(JSON.stringify(a)!==JSON.stringify(b)||a.k<1||!a.changedOpened||a.changedEnds<1)throw Error('replay or geometry');
 if(a.keepOnlyPass+a.spendOnlyPass+a.bothPass+a.bothPlay!==20)throw Error('partition');
 if(a.exactNextPassProbability<0||a.exactNextPassProbability>1)throw Error('probability');
 const c=auditPosition(3066102,20);
 if(c.keepDoubles<=c.spendDoubles)throw Error('retention direction');
 return{passed:true,seeds:[a.seed,c.seed],worlds:40,exactPassEqual:true};
}
if(require.main===module){
 const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||3145000),+(a[1]||3215000),+(a[2]||20),+(a[3]||100)),null,2));
}
module.exports={auditPosition,summarize,run,test};