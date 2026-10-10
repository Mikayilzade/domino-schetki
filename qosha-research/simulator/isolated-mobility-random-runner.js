'use strict';
// Independent exact-hidden-world holdout of isolated doubles with random-policy salts.
// node qosha-research/simulator/isolated-mobility-random-runner.js [start=135000] [end=139500] [limit=28] [salts=16]
// node qosha-research/simulator/isolated-mobility-random-runner.js test
const iso=require('./isolated-double-exact-runner');
const exact=require('./exact-late-double-runner');
const e=require('./engine'),d=require('./turn-dispatcher');
const regret=require('./decision-regret');
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
const near=(x,y)=>Math.abs(x-y)<1e-12;
function classMean(map,keys,fn){return mean(keys.map(k=>{const v=map.get(k);if(!v)throw Error('missing candidate '+k);return fn(v);}));}
function mobility(w,a,next){
 const f=w.currentPlayer,after=d.applyTurn(w.branchState,w.openingState,w.hands[f],w.stock,a);
 if(after.hand.length===0)return{unique:0,canPlay:0};
 const opts=d.turnOptions(after.branchState,after.openingState,w.hands[next],after.stock);
 const keys=new Set(opts.actions.flatMap(x=>(x.tiles||[x.tile]).filter(Boolean)).map(e.tileKey));
 return{unique:keys.size,canPlay:+(opts.phase==='play')};
}
function analyze(p,salts=16){
 const worlds=exact.exactWorlds(p),s=p.state,before=JSON.stringify(s);
 const opts=d.turnOptions(s.branchState,s.openingState,s.hands[p.focal],s.stock);
 const acts=new Map(opts.actions.map(a=>[regret.actionKey(a),a]));
 const open=p.group.open,keep=p.group.keep,keys=[...new Set([...open,...keep])];
 for(const k of keys)if(!acts.has(k))throw Error('candidate drift');
 const perSalt=Array.from({length:salts},()=>({finish:0,pips:0,minus:0,block:0}));
 let mobilityUnique=0,mobilityCanPlay=0,continuations=0;
 for(let i=0;i<worlds.length;i++){
  const w=worlds[i],m=new Map(keys.map(k=>[k,mobility(w,acts.get(k),p.next)]));
  mobilityUnique+=classMean(m,open,x=>x.unique)-classMean(m,keep,x=>x.unique);
  mobilityCanPlay+=classMean(m,open,x=>x.canPlay)-classMean(m,keep,x=>x.canPlay);
  for(let salt=0;salt<salts;salt++){
   const ev=regret.evaluateDecisionInWorld(w,{focalPlayer:p.focal,continuationStrategy:'random-legal',
    seed:23000000+1000*p.seed+i,salt,maxTurns:200});
   if(ev.kind!=='paired-world')throw Error('not paired');
   continuations+=ev.candidates.length;
   if(ev.candidates.some(x=>x.outcome==='unresolved'))throw Error('unresolved');
   const by=new Map(ev.candidates.map(x=>[x.actionKey,x]));
   const delta=perSalt[salt];
   delta.finish+=classMean(by,keep,x=>+x.focalFinishedFirst)-classMean(by,open,x=>+x.focalFinishedFirst);
   delta.pips+=classMean(by,keep,x=>x.focalRemainder)-classMean(by,open,x=>x.focalRemainder);
   delta.minus+=classMean(by,keep,x=>+(x.focalMinus<0))-classMean(by,open,x=>+(x.focalMinus<0));
   delta.block+=classMean(by,keep,x=>+(x.outcome==='block'))-classMean(by,open,x=>+(x.outcome==='block'));
  }
 }
 if(JSON.stringify(s)!==before)throw Error('mutated visible state');
 const avg=Object.fromEntries(['finish','pips','minus','block'].map(k=>[k,mean(perSalt.map(v=>v[k]/worlds.length))]));
 return{seed:p.seed,turn:p.turn,x:p.group.x,hand:s.hands[p.focal].map(e.tileKey),
  ends:e.SIDES.map(side=>s.branchState.branches[side].end),handSizes:s.hands.map(h=>h.length),next:p.next,
  exactAllocations:worlds.length,salts,continuations,
  randomPreserveMinusOpen:avg,
  randomFinishBySalt:perSalt.map(v=>v.finish/worlds.length),
  immediateOpenMinusKeepUniquePlayable:mobilityUnique/worlds.length,
  immediateOpenMinusKeepCanPlay:mobilityCanPlay/worlds.length};
}
function stat(rows,fn){if(!rows.length)return null;const a=rows.map(fn),m=mean(a),
 sd=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):0;
 return{n:a.length,mean:m,exploratoryPositionCI95:[m-1.96*sd/Math.sqrt(a.length),m+1.96*sd/Math.sqrt(a.length)],
  positive:a.filter(x=>x>1e-9).length,negative:a.filter(x=>x< -1e-9).length,ties:a.filter(x=>Math.abs(x)<=1e-9).length};}
function run({start=135000,end=139500,limit=28,salts=16}={}){
 if(!Number.isInteger(salts)||salts<1||salts>1000)throw Error('salts 1..1000');
 const {positions,scanned}=iso.collect(start,end,limit);
 const rows=positions.map(p=>({fixed:iso.analyze(p),random:analyze(p,salts)}));
 const cells={all:rows,x2:rows.filter(r=>r.fixed.x===2),other:rows.filter(r=>r.fixed.x!==2),
  end1:rows.filter(r=>r.fixed.targetEndCount===1),end2plus:rows.filter(r=>r.fixed.targetEndCount>=2)};
 const summary=Object.fromEntries(Object.entries(cells).map(([name,rs])=>[name,{
  positions:rs.length,exactAllocations:rs.reduce((s,r)=>s+r.fixed.exactAllocations,0),
  fixedClosed:stat(rs,r=>r.fixed.preserveMinusOpen['closed-branch-control'].finish),
  fixedMinPips:stat(rs,r=>r.fixed.preserveMinusOpen['min-hand-pips'].finish),
  fixedFastDoubles:stat(rs,r=>r.fixed.preserveMinusOpen['fast-doubles'].finish),
  randomLegal:stat(rs,r=>r.random.randomPreserveMinusOpen.finish),
  immediateOpenMinusKeepUniquePlayable:stat(rs,r=>r.random.immediateOpenMinusKeepUniquePlayable),
  immediateOpenMinusKeepCanPlay:stat(rs,r=>r.random.immediateOpenMinusKeepCanPlay)
 }]));
 return{schema:'qosa-isolated-mobility-random-holdout/v1',timestampAsiaBaku:'2026-10-11 01:55 (+04)',
  engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
  start,end,limit,salts,scannedDeals:scanned,positions:rows.length,
  exactHiddenAllocations:rows.reduce((s,r)=>s+r.fixed.exactAllocations,0),
  pairedWorldSaltEvaluations:rows.reduce((s,r)=>s+r.fixed.exactAllocations*salts,0),
  candidateContinuations:rows.reduce((s,r)=>s+r.fixed.continuations+r.random.continuations,0),
  newFullStrategyRounds:0,priorVerifiedFullStrategyRounds:180000,
  policies:['closed-branch-control','min-hand-pips','fast-doubles','random-legal'],
  discovery:'closed-branch-control',selection:'first eligible state/deal, focal 3..5, next clockwise <=2, no stock, isolated X-X, legal ordinary alternative',
  comparison:'preserve isolated X-X by ordinary single versus opening X-X; equal action-class, hidden-world, position weights',
  hiddenWorlds:'all exact opponent allocations, equal weight; no opponent-history conditioning',
  randomSeed:'23000000+1000*dealSeed+lexicographicAllocationIndex; salt=0..salts-1',
  nextPlayerMobility:'distinct playable tiles, not duplicate placements; open minus preserve immediately after forced focal action',
  summary,rows,
  limitations:'Assumed locked/open branch semantics; first eligible selection; bot continuation; block winner unassigned; exploratory CI not adjusted for multiple tests; policy salts correlated, not independent deals; no claim for real-world opponent posteriors.',
  next:'Check seed 136271 (3-3) and random-policy reversals; test next-opponent 1-tile states and matched no-double controls on disjoint seeds.'};
}
function selfTest(){const p=iso.collect(90000,90200,1).positions[0],a=analyze(p,2),b=analyze(p,2);
 if(JSON.stringify(a)!==JSON.stringify(b)||a.exactAllocations<1||!near(a.randomPreserveMinusOpen.finish,b.randomPreserveMinusOpen.finish))throw Error('non-deterministic');
 return{passed:true,seed:p.seed,allocations:a.exactAllocations};}
if(require.main===module){const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?selfTest():run({start:+(a[0]||135000),end:+(a[1]||139500),limit:+(a[2]||28),salts:+(a[3]||16)}),null,2));}
module.exports={analyze,run,selfTest};