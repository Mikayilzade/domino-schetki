'use strict';
// Reproducible exact-world policy-robustness check of previously flagged isolated-double exceptions.
// node qosha-research/simulator/isolated-exception-random-holdout.js [200]
// node qosha-research/simulator/isolated-exception-random-holdout.js test
const iso=require('./isolated-double-exact-runner');
const exact=require('./exact-late-double-runner');
const regret=require('./decision-regret');
const engine=require('./engine');
const groups={
  flaggedExceptions:[110698,111828,111837,112162],
  comparisonControls:[110287,110398,110594,110919]
};
const mean=a=>a.reduce((s,v)=>s+v,0)/a.length;
function loadPosition(seed){
  const p=iso.collect(seed,seed+1,1).positions[0];
  if(!p||p.seed!==seed)throw Error('position not reproducible '+seed);
  return p;
}
function analyze(seed,salts){
  const p=loadPosition(seed),before=JSON.stringify(p.state),worlds=exact.exactWorlds(p);
  const baseline=iso.analyze(p).preserveMinusOpen;
  const metrics=['finish','pips','minus','block'];
  const bySalt=[];
  let continuations=0,unresolved=0;
  for(let salt=0;salt<salts;salt++){
    const sums=Object.fromEntries(metrics.map(k=>[k,0]));
    for(let i=0;i<worlds.length;i++){
      const ev=regret.evaluateDecisionInWorld(worlds[i],{
        focalPlayer:p.focal,continuationStrategy:'random-legal',
        seed:23000000+1000*seed+i,salt,maxTurns:200
      });
      if(ev.kind!=='paired-world')throw Error('no choice '+seed);
      continuations+=ev.candidates.length;
      const byKey=new Map(ev.candidates.map(x=>[x.actionKey,x]));
      for(const k of [...p.group.open,...p.group.keep])
        if(!byKey.has(k))throw Error('missing action '+k);
      if(ev.candidates.some(x=>x.outcome==='unresolved')){unresolved++;throw Error('unresolved '+seed);}
      const avg=(keys,fn)=>mean(keys.map(k=>fn(byKey.get(k))));
      const delta={
        finish:avg(p.group.keep,x=>+x.focalFinishedFirst)-avg(p.group.open,x=>+x.focalFinishedFirst),
        pips:avg(p.group.keep,x=>x.focalRemainder)-avg(p.group.open,x=>x.focalRemainder),
        minus:avg(p.group.keep,x=>+(x.focalMinus<0))-avg(p.group.open,x=>+(x.focalMinus<0)),
        block:avg(p.group.keep,x=>+(x.outcome==='block'))-avg(p.group.open,x=>+(x.outcome==='block'))
      };
      for(const k of metrics)sums[k]+=delta[k];
    }
    bySalt.push(Object.fromEntries(metrics.map(k=>[k,sums[k]/worlds.length])));
  }
  if(JSON.stringify(p.state)!==before)throw Error('source state mutated');
  const sorted=bySalt.map(x=>x.finish).sort((a,b)=>a-b);
  return {
    seed,turn:p.turn,focal:p.focal,targetDouble:p.group.x,
    hand:p.state.hands[p.focal].map(engine.tileKey),
    opponentHandSizes:p.state.hands.map(h=>h.length),
    ends:engine.SIDES.map(side=>p.state.branchState.branches[side].end),
    openActionKeys:p.group.open,keepActionKeys:p.group.keep,
    exactAllocations:worlds.length,policySalts:salts,continuations,unresolved,
    fixedPoliciesPreserveMinusOpenFinish:Object.fromEntries(Object.entries(baseline).map(([k,v])=>[k,v.finish])),
    randomLegalPreserveMinusOpen:Object.fromEntries(metrics.map(k=>[k,mean(bySalt.map(x=>x[k]))])),
    randomLegalFinishSaltDistribution:{
      q05:sorted[Math.floor((salts-1)*0.05)],median:sorted[Math.floor((salts-1)*0.5)],
      q95:sorted[Math.floor((salts-1)*0.95)],
      openingFavoredSaltFraction:sorted.filter(x=>x<0).length/salts
    }
  };
}
function run({salts=200}={}){
  if(!Number.isInteger(salts)||salts<1||salts>1000)throw Error('salts 1..1000');
  const rows=Object.fromEntries(Object.entries(groups).map(([name,seeds])=>[name,seeds.map(s=>analyze(s,salts))]));
  const all=Object.values(rows).flat();
  const summary=Object.fromEntries(Object.entries(rows).map(([name,rr])=>[name,{
    n:rr.length,meanPreserveMinusOpenFinish:mean(rr.map(r=>r.randomLegalPreserveMinusOpen.finish)),
    openingFavoredPositions:rr.filter(r=>r.randomLegalPreserveMinusOpen.finish<0).length,
    preservingFavoredPositions:rr.filter(r=>r.randomLegalPreserveMinusOpen.finish>0).length
  }]));
  return {
    schema:'qosa-isolated-exception-random-policy/v1',
    timestampAsiaBaku:'2026-10-10 21:46 (+04)',
    engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
    deals:all.length,selectedDealSeeds:groups,
    newFullStrategyRounds:0,
    distinctExactHiddenAllocations:all.reduce((s,r)=>s+r.exactAllocations,0),
    pairedWorldSaltEvaluations:all.reduce((s,r)=>s+r.exactAllocations*r.policySalts,0),
    candidateContinuations:all.reduce((s,r)=>s+r.continuations,0),
    unresolved:all.reduce((s,r)=>s+r.unresolved,0),
    strategies:['closed-branch-control','min-hand-pips','fast-doubles','random-legal'],
    continuationSeedFormula:'23000000+1000*dealSeed+lexicographicAllocationIndex; random-legal salt=0..salts-1',
    comparison:'opening isolated X-X vs ordinary single preserving X-X; equal action-class, hidden allocation and position weights; matched worlds/policy salt',
    selection:'four previously flagged exceptions and four hand-picked 2-2 controls from 110000..115000; not independent discovery, no prevalence estimate',
    summary,rows,
    confidence:'exact uniform hidden allocations for these states; policy-salt variation descriptive, not independent deals or confidence intervals',
    limitations:'assumed locked/open branch semantics; bot policy, unconditioned opponent history; selection bias; block has no winner; RNG salts correlated; no general human-play conclusion',
    next:'replicate policy sensitivity on fresh seeds >=125000 and compare matched non-pattern controls; characterize geometry/next-opponent mobility for robust counterconditions'
  };
}
function selfTest(){
  const a=analyze(110698,2),b=analyze(110698,2);
  if(JSON.stringify(a)!==JSON.stringify(b)||a.exactAllocations!==10||a.unresolved)throw Error('regression failed');
  return{passed:true,seed:110698,exactAllocations:10,deterministic:true};
}
if(require.main===module){
  const arg=process.argv[2];
  console.log(JSON.stringify(arg==='test'?selfTest():run({salts:Number(arg||200)}),null,2));
}
module.exports={groups,loadPosition,analyze,run,selfTest};
