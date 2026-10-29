'use strict';
// Independent hand-level holdout for voluntary stop after EACH double.
// node qosha-research/simulator/multi-double-per-double-holdout.js [test|2048]
// Late-arrival branch models provisional; no full-round, match or win-rate claim.
const {select,shuffled,DECK,key,init,actions,choose,turn}=require('./opening-double-followup-new-hands');
const {response,evaluate,root}=require('./multi-double-per-double-stop');
const check=(x,m)=>{if(!x)throw Error(m||'assertion failed');};
const zero=()=>Array(8).fill(0);
const DEAL_START=3200280, DEAL_COUNT=30000, WORLD_START=3230280, WORLD_STRIDE=2048;
function interval(v){
  const n=v.length,mean=v.reduce((a,b)=>a+b,0)/n;
  const variance=v.reduce((a,b)=>a+(b-mean)**2,0)/(n-1);
  const e=1.96*Math.sqrt(variance/n);
  return [mean-e,mean+e];
}
function experiment(worldsPerHand=2048){
  check(Number.isInteger(worldsPerHand)&&worldsPerHand>=1&&worldsPerHand<=WORLD_STRIDE,'worldsPerHand 1..2048');
  const {selected,valid,eligible,strata}=select(DEAL_START,DEAL_COUNT);
  check(selected.length===24&&new Set(selected.map(x=>x.seed)).size===24,'24 distinct selected hands');
  const stats={};
  for(const policy of ['high','low'])for(const model of ['global','current'])
    stats[policy+'-'+model]={coeff:zero(),perHand:[],nonlinearWorlds:0};
  let allocations=0;
  for(let fi=0;fi<selected.length;fi++){
    const f=selected[fi],known=new Set(['1-1',...f.hand.map(key)]),pool=DECK.filter(t=>!known.has(key(t)));
    const spent=key([Math.min(1,f.x),Math.max(1,f.x)]),focal=f.hand.filter(t=>key(t)!==spent);
    check(known.size===10&&pool.length===18&&focal.length===8,'28-tile conservation before sampling');
    const local={};for(const k of Object.keys(stats))local[k]=zero();
    for(let wi=0;wi<worldsPerHand;wi++){
      const seed=WORLD_START+fi*WORLD_STRIDE+wi,d=shuffled(seed,pool),h1=d.slice(0,9),h2=d.slice(9);
      check(new Set([...known,...h1.map(key),...h2.map(key)]).size===28,'hidden tile collision');
      allocations++;
      for(const policy of ['high','low'])for(const model of ['global','current']){
        const k=policy+'-'+model,p1=turn(init(f.x),h1,policy,model),p2=turn(p1.b,h2,policy,model);
        const legal=actions(p2.b,focal),dbl=choose(legal.filter(x=>x.dbl),'high'),ord=choose(legal.filter(x=>!x.dbl),'high');
        check(dbl&&ord,'both focal choices legal');
        const pd=response(p2.b,p1.h,p2.h,dbl,policy,model);
        const po=response(p2.b,p1.h,p2.h,ord,policy,model);
        let nonlinear=false;
        for(let j=0;j<8;j++){
          const delta=pd[j]-po[j];stats[k].coeff[j]+=delta;local[k][j]+=delta;
          if(j>=2&&delta)nonlinear=true;
        }
        if(nonlinear)stats[k].nonlinearWorlds++;
      }
    }
    for(const k of Object.keys(stats))
      stats[k].perHand.push({dealSeed:f.seed,c:f.c,x:f.x,y:f.y,stratum:f.stratum,coeff:local[k]});
  }
  check(allocations===24*worldsPerHand,'allocation count');
  const summary={};
  for(const [k,v] of Object.entries(stats)){
    const means=v.perHand.map(h=>evaluate(h.coeff,0.5)/worldsPerHand);
    summary[k]={
      numeratorPolynomial:v.coeff,
      deltaOpponentStonesByP:Object.fromEntries([0,0.25,0.5,0.75,1].map(p=>[String(p),evaluate(v.coeff,p)/allocations])),
      breakEvenContinueProbability:root(v.coeff),
      nonlinearWorlds:v.nonlinearWorlds,
      halfContinueExploratoryHandCI95:interval(means),
      positiveHandsAtHalf:means.filter(x=>x>0).length,
      negativeHandsAtHalf:means.filter(x=>x<0).length,
      zeroHandsAtHalf:means.filter(x=>x===0).length,
      perHand:v.perHand
    };
  }
  for(const policy of ['high','low'])
    check(JSON.stringify(summary[policy+'-global'].numeratorPolynomial)===
      JSON.stringify(summary[policy+'-current'].numeratorPolynomial),'branch-model disagreement in short-window throughput');
  return {
    schema:'qosha-per-double-stop-new-hand-holdout/v1',
    engine:'qosa-research-0.5.3 + multi-double-per-double-holdout-1.0',
    rules:'recovered qosa-1.0.0 first-round 3x9; provisional global/current late-arrival branch rules',
    dealSeedRange:[DEAL_START,DEAL_START+DEAL_COUNT-1],valid,eligible,strata,
    selectedDealSeeds:selected.map(x=>x.seed),selectedHands:24,
    worldSeedFormula:'3230280 + fixtureIndex*2048 + worldIndex',
    worldSeedSpan:[WORLD_START,WORLD_START+(24-1)*WORLD_STRIDE+worldsPerHand-1],
    worldsPerHand,newDeals:DEAL_COUNT,newHiddenWorlds:allocations,
    newCompleteRounds:0,newForcedContinuations:0,
    compared:'same-world highest-pip legal double minus highest-pip legal ordinary on focal return',
    opponentPolicies:['high','low'],continuation:'independent probability p to continue after EACH double, up to four; ordinary-first never chains',
    summary,
    limitations:['24 selected sign/gap/connector-balanced hands, not population-weighted',
      'two opponent policies, not observed human play',
      'focal move pip cost and branch geometry confounded',
      'late-arrival branch unlocking, blocked ties, loneZero, 101 scoring provisional or unresolved',
      'no complete-round win, minus, median, block or regret claim']
  };
}
function test(){
  const a=experiment(2),b=experiment(2);
  check(JSON.stringify(a)===JSON.stringify(b),'deterministic replay');
  check(a.newHiddenWorlds===48&&a.newDeals===30000,'smoke accounting');
  check(a.valid===28919&&a.eligible===10747,'new deal seed census changed');
  check(a.selectedDealSeeds[0]===3205627&&a.selectedDealSeeds[23]===3227535,'selection fingerprint changed');
  for(const policy of ['high','low']){
    const s=a.summary[policy+'-global'];
    check(s.numeratorPolynomial.every(Number.isInteger),'integer polynomial');
    check(s.perHand.length===24,'hand-level replication');
  }
  return {passed:true,smokeHiddenWorlds:48,selectedHands:24,valid:a.valid,eligible:a.eligible};
}
if(require.main===module)console.log(JSON.stringify(process.argv[2]==='test'?test():experiment(process.argv[2]?Number(process.argv[2]):2048),null,2));
module.exports={experiment,test};
