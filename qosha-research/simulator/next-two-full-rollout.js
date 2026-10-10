'use strict';
// Paired complete-continuation follow-up to exact next-two minus risk.
// Run: node qosha-research/simulator/next-two-full-rollout.js 2900000 3200000 6
// A distinct, disjoint holdout: ... 3200000 3500000 6
const e=require('./engine');
const exact=require('./next-two-minus-exact');
const base=require('./double-connector-urgency-holdout');
const POLICIES=['closed-branch-control','min-hand-pips','fast-doubles'];
const sum=xs=>xs.reduce((a,b)=>a+b,0);
const mean=xs=>xs.length?sum(xs)/xs.length:null;
function ci(xs){
 if(!xs.length)return null;
 const m=mean(xs),sd=xs.length>1?Math.sqrt(sum(xs.map(x=>(x-m)**2))/(xs.length-1)):0;
 const h=1.96*sd/Math.sqrt(xs.length);
 return {n:xs.length,mean:m,ci95ExploratoryPositionNormal:[m-h,m+h],
  positive:xs.filter(x=>x>0).length,negative:xs.filter(x=>x<0).length,ties:xs.filter(x=>x===0).length};
}
function evaluate(pos){
 const s=pos.state,f=s.currentPlayer,unknown=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));
 const known=e.createDoubleSixDeck().filter(t=>!unknown.has(e.tileKey(t)));
 const prepared={...pos,focal:f,known,group:'next-two'};
 const exactRow=exact.analyze(pos);
 const rollout=base.analyze(prepared,100);
 if(rollout.worlds!==exactRow.counts.total||rollout.maxDistinctAllocations!==rollout.worlds)
  throw Error('non-exhaustive full-world enumeration at seed '+pos.seed);
 if(Math.abs(rollout.immediateNextOpponentMinusDiff-exactRow.exactRiskDifference)>1e-12)
  throw Error('exact-minus risk mismatch at seed '+pos.seed);
 const out={seed:pos.seed,target:pos.choice.x,turn:s.turns,focal:f,handSize:s.hands[f].length,
  hand:s.hands[f].map(e.tileKey),clockwiseOppSizes:[s.hands[(f+1)%3].length,s.hands[(f+2)%3].length],
  connector:pos.choice.connector,ends:e.SIDES.map(side=>s.branchState.branches[side].end),
  opened:[...s.openingState.openedNumbers].sort((a,b)=>a-b),
  knownCount:known.length,worldSeedStart:rollout.worldSeedStart,worldSeedOffsets:rollout.worldSeedOffsets,
  worlds:rollout.worlds,exactRiskDifference:exactRow.exactRiskDifference,
  doubleOnlyMinusHands:exactRow.counts.doubleOnly,connectorOnlyMinusHands:exactRow.counts.connectorOnly,
  bothMinusHands:exactRow.counts.both,immediateNextFinishDiff:rollout.immediateNextOpponentFinishDiff,
  policyDiff:rollout.policyDiff};
 return out;
}
function summary(rows){
 const subsets={all:rows,riskPositive:rows.filter(r=>r.exactRiskDifference>0),
  riskZero:rows.filter(r=>r.exactRiskDifference===0),riskNegative:rows.filter(r=>r.exactRiskDifference<0)};
 return Object.fromEntries(Object.entries(subsets).map(([k,rs])=>[k,{
  positions:rs.length,worlds:sum(rs.map(r=>r.worlds)),
  exactMinusRisk:ci(rs.map(r=>r.exactRiskDifference)),
  policyDiff:Object.fromEntries(POLICIES.map(p=>[p,Object.fromEntries(
   ['first','pips','minus','block','turns'].map(m=>[m,ci(rs.map(r=>r.policyDiff[p][m]))]))]))
 }]));
}
function run(start=2900000,end=3200000,quota=6){
 if(![start,end,quota].every(Number.isInteger)||end<=start||quota<1)throw Error('bad parameters');
 const guard=exact.selfTest(),selected=exact.collect(start,end,quota);
 const rows=selected.positions.map(evaluate);
 if(new Set(rows.map(r=>r.seed)).size!==rows.length)throw Error('duplicate selected seed');
 if(rows.length!==3*quota)throw Error('wrong position count');
 // Replay a complete position, including exact hidden allocation order.
 if(JSON.stringify(evaluate(selected.positions[0]))!==JSON.stringify(rows[0]))throw Error('non-deterministic replay');
 const worlds=sum(rows.map(r=>r.worlds));
 return {schema:'qosa-next-two-full-rollout/v1',
  timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'})+' +04:00',
  engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
  startSeed:start,endSeedExclusive:end,seedFilter:'seed%17===0; first eligible reachable position; next clockwise opponent has 2 tiles',
  discoveryPolicy:'closed-branch-control',quotaPerTarget:quota,targets:[0,2,4],
  selectedSeedsByTarget:selected.selectedSeedsByTarget,scannedDealSeeds:selected.scanned,
  comparison:'force unopened X-X versus X-Y connector on same visible position and EXACT SAME full hidden world',
  continuationPolicies:POLICIES.map(x=>'side-neutral-'+x),
  worldSeedFormula:'22000000+1000*dealSeed+offset; distinct allocations, offsets stored',
  positionCount:rows.length,exactFullySpecifiedHiddenWorlds:worlds,
  pairedCandidateContinuations:worlds*2*POLICIES.length,newCompleteStrategyRounds:0,
  validation:{exactFixture:guard,allAllocationsExhaustive:true,exactMinusMatchesRollout:true,firstPositionReplay:true},
  summary:summary(rows),rows,
  limitations:['All unknown tiles assigned exactly because stock is empty; not independent random deals',
   'Selected first-eligible states and target quota bias; risk-positive subgroup selected after observation',
   'Exploratory position-level normal CIs; no causal comparison between risk strata',
   'Three simple side-neutral continuation bots; branch lock/open semantics remain assumption-labelled',
   'Block has no official winner; first-place means only outright finish; Node CLI execution should be independently checked',
   'These complete hidden worlds are distinct from the earlier marginal two-tile exact risk enumeration'],
  nextHypothesis:'Repeat on disjoint seed window; if risk-positive cases exist, test whether any double-opening finish advantage persists within those positions under three policies.'};
}
if(require.main===module){
 const [start=2900000,end=3200000,quota=6]=process.argv.slice(2).map(Number);
 console.log(JSON.stringify(run(start,end,quota),null,2));
}
module.exports={evaluate,summary,run};
