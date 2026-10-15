'use strict';
// Reproduce: node qosha-research/simulator/pass-role-cycle-matched-runner.js 500000 600000
// Recovered qosa-1.0.0; provisional branch rules; 3 players x 9.
const e=require('./engine'),{discover}=require('./pass-history-persistent-runner');
const {role,evaluate}=require('./pass-role-balanced-runner');
const strict=['hand','otherHand','cycles','passCount','opened','ends'];
const relaxed=['hand','cycles','opened','ends'];
function info(p){
 const r=role(p);if(r!=='next-only'&&r!=='third-only')return null;
 const who=r==='next-only'?(p.focal+1)%3:(p.focal+2)%3;
 const ev=p.evidence.filter(x=>x.player===who&&x.playedAfter.length);
 const age=Math.min(...ev.map(x=>p.turn-x.turn)),offset=r==='next-only'?2:1;
 if(!ev.length||age<offset||(age-offset)%3)throw Error('invalid pass-age phase');
 return{p,seed:p.seed,role:r,hand:p.visibleState.hands[who].length,
  otherHand:p.visibleState.hands[3-p.focal-who].length,cycles:(age-offset)/3,
  ageTurns:age,passCount:ev.length,opened:p.visibleState.openingState.openedNumbers.size,
  ends:new Set(e.SIDES.map(s=>p.visibleState.branchState.branches[s].end)).size};
}
function match(rows,keys){
 const n=rows.filter(x=>x.role==='next-only').sort((a,b)=>a.seed-b.seed);
 const t=rows.filter(x=>x.role==='third-only').sort((a,b)=>a.seed-b.seed);
 const map=new Map(),key=x=>keys.map(k=>x[k]).join('|');
 for(const x of t){const k=key(x);if(!map.has(k))map.set(k,[]);map.get(k).push(x);}
 const out=[];for(const x of n){const b=map.get(key(x));if(b&&b.length)out.push([x,b.shift()]);}return out;
}
function avg(a){return a.length?a.reduce((s,x)=>s+x,0)/a.length:null;}
function pExact(a){
 if(!a.length||a.length>16)return null;
 const target=Math.abs(a.reduce((s,x)=>s+x,0));let extreme=0;
 for(let mask=0;mask<(1<<a.length);mask++){
  let s=0;for(let i=0;i<a.length;i++)s+=(mask&(1<<i)?1:-1)*a[i];
  if(Math.abs(s)+1e-12>=target)extreme++;
 }return extreme/(1<<a.length);
}
function run(start=500000,end=600000){
 const found=discover(start,end,999999),rows=found.positions.map(info).filter(Boolean);
 const primary=match(rows,strict),sensitivity=match(rows,relaxed);
 const chosen=new Map();
 for(const pairs of [primary,sensitivity])for(const pair of pairs)for(const x of pair)chosen.set(x.seed,x);
 const details=new Map();
 for(const x of chosen.values()){
  const v=evaluate(x.p);
  details.set(x.seed,{seed:x.seed,role:x.role,hand:x.hand,otherHand:x.otherHand,
   cycles:x.cycles,ageTurns:x.ageTurns,passCount:x.passCount,opened:x.opened,ends:x.ends,
   worlds:v.worlds,legacy:v.legacyWorlds,conditioned:v.conditionedWorlds,
   fraction:v.additionalExcluded/v.legacyWorlds,bits:Math.log2(v.legacyWorlds/v.conditionedWorlds),
   brier:v.prediction.actualNextPass===null?null:v.prediction.legacy.brier-v.prediction.conditioned.brier,
   policy:v.policy});
 }
 function group(pairs){
  const items=pairs.map(([a,b])=>({next:a.seed,third:b.seed,
   fractionDelta:details.get(b.seed).fraction-details.get(a.seed).fraction,
   bitsDelta:details.get(b.seed).bits-details.get(a.seed).bits,
   brierDelta:details.get(b.seed).brier-details.get(a.seed).brier}));
  return{n:items.length,fractionMean:avg(items.map(x=>x.fractionDelta)),
   fractionExactSignFlipP:pExact(items.map(x=>x.fractionDelta)),
   bitsMean:avg(items.map(x=>x.bitsDelta)),bitsExactSignFlipP:pExact(items.map(x=>x.bitsDelta)),
   brierMean:avg(items.map(x=>x.brierDelta)),items};
 }
 const evaluated=[...details.values()].sort((a,b)=>a.seed-b.seed);
 return{schema:'qosa-pass-role-cycle-matched/v1',
  timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'}),
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0; branch opening provisional',
  mode:'3x9',seedRange:[start,end-1],scanned:found.scanned,eligible:found.positions.length,
  exposed:{next:rows.filter(x=>x.role==='next-only').length,third:rows.filter(x=>x.role==='third-only').length},
  primaryFields:strict,sensitivityFields:relaxed,primary:group(primary),sensitivity:group(sensitivity),
  positions:evaluated.length,allocations:evaluated.reduce((s,x)=>s+x.worlds,0),
  continuations:evaluated.reduce((s,x)=>s+6*x.worlds,0),
  strategies:['closed-branch-control','min-hand-pips','fast-doubles'],
  continuationSeed:'61000000+1000*dealSeed+lexicographicAllocationIndex',
  newFullStrategyRounds:0,verifiedCumulativeFullRounds:180000,
  details:evaluated,
  limitations:'Exploratory small matched cohorts; first eligible state per seed; equal hidden-allocation prior; matched end diversity not exact end identity; deterministic bots; branch opening provisional; block winner unassigned; primary and sensitivity overlap.',
  next:'Independent seeds 600000..749999, larger strict matched sample, stratify pass count and then evaluate move-choice regret.'};
}
function test(){
 const p=discover(281304,281305,1).positions[0],x=info(p);
 if(!x||!Number.isInteger(x.cycles)||pExact([1,1])!==0.5)throw Error('regression');
 return{passed:true,seed:p.seed,role:x.role,ageTurns:x.ageTurns,ageCycles:x.cycles};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||500000),+(a[1]||600000)),null,2));}
module.exports={info,match,pExact,run,test};