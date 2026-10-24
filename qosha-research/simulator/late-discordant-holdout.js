'use strict';
// Reproducible discordant-only pre-action late (2-3 stones) same-tile side holdout.
// Four-branch locking remains provisional.
// node qosha-research/simulator/late-discordant-holdout.js test
// node qosha-research/simulator/late-discordant-holdout.js 1383640 2200 40 256
const e=require('./engine'),late=require('./late-side-mc');
const {conditionalWorld}=require('./equal-pip-paired-runner');
const profiles=['min-hand-pips','closed-branch-control'];
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
const half=a=>a.length>1?1.96*Math.sqrt(a.reduce((s,x)=>s+(x-mean(a))**2,0)/(a.length-1)/a.length):null;
const median=a=>{if(!a.length)return null;const b=[...a].sort((x,y)=>x-y),n=b.length;return n%2?b[(n-1)/2]:(b[n/2-1]+b[n/2])/2;};
function choose(meta){
 const own=[...meta].sort((a,b)=>b.own-a.own||a.key.localeCompare(b.key))[0];
 const risk=[...meta].sort((a,b)=>a.expectedNextLegal-b.expectedNextLegal||a.key.localeCompare(b.key))[0];
 return{own,risk};
}
function run(start=1383640,count=2200,limit=40,worlds=256){
 if(![start,count,limit,worlds].every(Number.isInteger)||count<1||limit<1||worlds<1)throw Error('bad args');
 const discovery=late.collect(start,count,320),selected=[],available={};
 for(const profile of profiles){
  const discordant=discovery.positions.filter(p=>p.profile===profile).map(pos=>({pos,pick:choose(late.candidateMeta(pos))})).filter(x=>x.pick.own.key!==x.pick.risk.key);
  available[profile]=discordant.length;selected.push(...discordant.slice(0,limit));
 }
 const rows=[];let continuations=0;
 for(const {pos,pick} of selected){
  const original=JSON.stringify(pos.state),own=[],risk=[];
  for(let i=0;i<worlds;i++){
   const seed=e.mixSeed32((pos.seed^Math.imul(pos.turn+1,0x9e3779b9)^Math.imul(pos.seat+1,0x85ebca6b)^Math.imul(i+1,0xc2b2ae35)^(pos.profile===profiles[0]?0x1324:0x9876))>>>0);
   const world=conditionalWorld(pos,seed);
   own.push(late.rollout(world,pick.own.key,pos.profile,seed,pos.seat));
   risk.push(late.rollout(world,pick.risk.key,pos.profile,seed,pos.seat));
   continuations+=2;
  }
  if(JSON.stringify(pos.state)!==original)throw Error('visible state mutated');
  const diff=k=>mean(own.map((v,i)=>v[k]-risk[i][k]));
  const minusCounts=a=>Object.fromEntries([-10,-20,-30,-40].map(k=>[k,a.filter(x=>x.win&&x.minusValue===k).length]));
  rows.push({profile:pos.profile,seed:pos.seed,seat:pos.seat,turn:pos.turn,hand:pos.state.hands[pos.seat].map(e.tileKey),
   handSize:pos.state.hands[pos.seat].length,opened:[...pos.state.openingState.openedNumbers].sort(),
   ends:e.SIDES.map(s=>pos.state.branchState.branches[s].end),tile:pos.tile,forbiddenCounts:pos.forbidden.map(x=>x.length),
   ownChoice:pick.own,riskChoice:pick.risk,worlds,ownWin:mean(own.map(x=>x.win)),riskWin:mean(risk.map(x=>x.win)),
   winDeltaPP:100*diff('win'),pipsDelta:diff('pips'),minusDeltaPP:100*diff('minus'),
   blockDeltaPP:100*diff('block'),turnDelta:diff('turns'),nextAccessDelta:diff('nextAccess'),
   otherAccessDelta:diff('otherAccess'),endingDoublesDelta:diff('endingDoubles'),
   ownMedianPips:median(own.map(x=>x.pips)),riskMedianPips:median(risk.map(x=>x.pips)),
   ownMinusCounts:minusCounts(own),riskMinusCounts:minusCounts(risk)});
 }
 const summaries=profiles.map(profile=>{
  const a=rows.filter(x=>x.profile===profile);
  const sumMinus=side=>Object.fromEntries([-10,-20,-30,-40].map(k=>[k,a.reduce((s,x)=>s+x[side][k],0)]));
  return{profile,positions:a.length,discordantDiscovered:available[profile],worldsPerPosition:worlds,
   winDeltaPP:mean(a.map(x=>x.winDeltaPP)),positionClusterExploratory95HalfWidthPP:half(a.map(x=>x.winDeltaPP)),
   pipsDelta:mean(a.map(x=>x.pipsDelta)),minusDeltaPP:mean(a.map(x=>x.minusDeltaPP)),
   blockDeltaPP:mean(a.map(x=>x.blockDeltaPP)),turnDelta:mean(a.map(x=>x.turnDelta)),
   nextAccessDelta:mean(a.map(x=>x.nextAccessDelta)),otherAccessDelta:mean(a.map(x=>x.otherAccessDelta)),
   ownBetter:a.filter(x=>x.winDeltaPP>0).length,riskBetter:a.filter(x=>x.winDeltaPP<0).length,
   ties:a.filter(x=>x.winDeltaPP===0).length,
   ownMinusCounts:sumMinus('ownMinusCounts'),riskMinusCounts:sumMinus('riskMinusCounts'),
   byHandSize:Object.fromEntries([2,3].map(n=>[n,{positions:a.filter(x=>x.handSize===n).length,
    winDeltaPP:mean(a.filter(x=>x.handSize===n).map(x=>x.winDeltaPP))}]))};
 });
 const actualUniqueDealsScanned=Math.max(...Object.values(discovery.scanned));
 return{schema:'qosa-late-discordant-holdout/v1',timestampBaku:'2026-10-24 09:50 (+04)',
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0; branch locking provisional',mode:'3x9',
  requestedScanEnvelope:[start,start+count-1],actualUniqueDealsScanned,
  actualSeedSpan:[start,start+actualUniqueDealsScanned-1],scannedByPolicy:discovery.scanned,
  preselectedPositions:discovery.positions.length,discordantDiscovered:available,
  positions:rows.length,worldsPerPosition:worlds,matchedHiddenAllocations:rows.length*worlds,
  forcedContinuations:continuations,fullRounds:0,profiles,
  comparison:'highest own immediate mobility vs lowest visible-uniform next-opponent legal estimate; only discordant choices, SAME ordinary tile, matched hidden worlds and continuation policy',
  selection:'first eligible late 2-3-stone same-tile multi-side choice per trajectory, deterministic hashed tile group; oversample discordant; cap per policy',
  assumptions:'uniform unknown allocation conditioned on observed stock-empty passes, simplistic fixed continuation bots, provisional 4-branch opening; prior opponent policy likelihood omitted',
  limitations:'position-cluster intervals exploratory, correlated positions and worlds, selection on disagreement, first-eligible trajectory, no match winner/block winner, no multiplicity correction',
  summaries,rows,next:'Pre-register 2-vs-3 stone interaction, replicate on independent seeds; independently obtain authentic locked/open four-branch fixture.'};
}
function test(){
 const a=run(1383640,80,2,4),b=run(1383640,80,2,4);
 if(JSON.stringify(a)!==JSON.stringify(b))throw Error('determinism');
 if(a.forcedContinuations!==2*a.positions*4)throw Error('counts');
 for(const row of a.rows)if(row.ownChoice.key===row.riskChoice.key||row.handSize<2||row.handSize>3)throw Error('selection');
 return{passed:true,positions:a.positions,continuations:a.forcedContinuations};
}
if(require.main===module){
 const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1383640),+(a[1]||2200),+(a[2]||40),+(a[3]||256)),null,2));
}
module.exports={choose,run,test};