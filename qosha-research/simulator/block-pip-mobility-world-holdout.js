'use strict';
// Reproduce: node qosha-research/simulator/block-pip-mobility-world-holdout.js 100
// New hidden allocations on 30 previously selected positions, NOT new independent positions.
const base=require('./block-pip-choice-replay'),mob=require('./block-pip-mobility-replication');
const e=require('./engine'),r=require('./round-driver');
const {sampleWorld}=require('./hidden-world'),{actionKey}=require('./decision-regret');
const {neutralChoose}=require('./side-equivariance-audit'),{blockRank}=require('./block-remainder-holdout');
const POLICIES=['closed-branch-control','min-hand-pips','random-legal'],WORLD_PREFIX=33000000;
function forced(w,key){return r.stepRound(w,o=>{const a=o.actions.find(x=>actionKey(x)===key);if(!a)throw Error('candidate missing');return a;});}
function finish(s,policy,seed){
 s=r.cloneRoundState(s);
 while(!s.outcome&&s.turns<200)s=r.stepRound(s,(o,t)=>neutralChoose(policy,o,{seed,turns:t.turns,player:t.currentPlayer}));
 if(!s.outcome||s.outcome.kind==='unresolved')throw Error('unresolved continuation');return s;
}
function stats(s,f){const b=blockRank(s.outcome,f);return{block:!!b,pips:e.pipSum(s.hands[f]),
 first:s.outcome.kind==='finish'&&s.outcome.playerIndex===f,strict:!!(b&&b.strictMin)};}
function empty(){return{finishDiff:0,pipsDiff:0,blockDiff:0,both:0,bothPipsDiff:0,
 highLower:0,highHigher:0,equal:0,strictGain:0,strictLoss:0};}
function replay(p,worlds){
 const s=p.state,original=JSON.stringify(s),f=p.focal;
 const spec={focalPlayer:f,focalHand:s.hands[f],knownTiles:p.known,
 hiddenHandSizes:s.hands.map(h=>h.length),stockSize:s.stock.length,visibleState:s};
 const sums=Object.fromEntries(POLICIES.map(x=>[x,empty()]));
 for(let i=0;i<worlds;i++){
  const seed=WORLD_PREFIX+1000*p.seed+i,w=sampleWorld(spec,seed),after=p.choice.keys.map(k=>forced(w,k));
  for(const policy of POLICIES){
   const a=stats(finish(after[0],policy,seed),f),b=stats(finish(after[1],policy,seed),f),z=sums[policy];
   z.finishDiff+=+b.first-+a.first;z.pipsDiff+=b.pips-a.pips;z.blockDiff+=+b.block-+a.block;
   if(a.block&&b.block){
    z.both++;z.bothPipsDiff+=b.pips-a.pips;
    z.highLower+=+(b.pips<a.pips);z.highHigher+=+(b.pips>a.pips);z.equal+=+(b.pips===a.pips);
    z.strictGain+=+(!a.strict&&b.strict);z.strictLoss+=+(a.strict&&!b.strict);
   }
  }
 }
 if(original!==JSON.stringify(s))throw Error('visible state mutated');
 for(const z of Object.values(sums))if(z.highLower+z.highHigher+z.equal!==z.both)throw Error('both-block partition');
 return sums;
}
function ci(xs){if(!xs.length)return null;const n=xs.length,m=xs.reduce((a,b)=>a+b,0)/n;
 const v=n>1?xs.reduce((a,b)=>a+(b-m)**2,0)/(n-1):0,h=1.96*Math.sqrt(v/n);
 return{n,mean:m,ci95:[m-h,m+h]};}
function summarize(rows,worlds){
 const groups=['all','urgent/highMore','urgent/highNotMore','normal/highMore','normal/highNotMore'],out={};
 for(const group of groups){
  const rr=rows.filter(x=>group==='all'||x.group===group);out[group]={positions:rr.length,policies:{}};
  for(const policy of POLICIES){
   const xs=rr.map(x=>x.policies[policy]),sum=k=>xs.reduce((a,x)=>a+x[k],0);
   const both=sum('both'),nonzero=xs.filter(x=>x.both);
   out[group].policies[policy]={
    finishHighMinusLow:ci(xs.map(x=>x.finishDiff/worlds)),
    remainderHighMinusLow:ci(xs.map(x=>x.pipsDiff/worlds)),
    blockHighMinusLow:ci(xs.map(x=>x.blockDiff/worlds)),
    bothBlockWorlds:both,bothBlockPositions:nonzero.length,
    bothBlockHighMinusLowPips:both?sum('bothPipsDiff')/both:null,
    bothBlockPositionPipDelta:ci(nonzero.map(x=>x.bothPipsDiff/x.both)),
    highLower:sum('highLower'),highHigher:sum('highHigher'),equal:sum('equal'),
    strictGain:sum('strictGain'),strictLoss:sum('strictLoss')};
  }
 }
 return out;
}
function run(worlds=100){
 if(!Number.isInteger(worlds)||worlds<1||worlds>500)throw Error('world count 1..500');
 base.selfTest();const rows=[],seeds=new Set();
 for(const [discovery,groups] of Object.entries(mob.SETS))
  for(const [group,values] of Object.entries(groups))
   for(const seed of values){
    if(seeds.has(seed))throw Error('duplicate seed');seeds.add(seed);
    const p=base.position(seed,discovery),m=mob.mobility(p);
    const actual=(Math.min(...p.opponentSizes)<=2?'urgent':'normal')+'/'+(m[1]>m[0]?'highMore':'highNotMore');
    if(actual!==group)throw Error('stratum mismatch '+seed);
    rows.push({seed,discovery,group,hand:p.hand,opponentSizes:p.opponentSizes,tiles:p.choice.tiles,
     mobilityLow:m[0],mobilityHigh:m[1],policies:replay(p,worlds)});
   }
 return{schema:'qosa-block-pip-mobility-world-holdout/v1',
  timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'})+' +04:00',
  engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
  seedSets:mob.SETS,selectedPositions:rows.length,
  selectedWorlds:rows.length*worlds,worldsPerPosition:worlds,
  worldSeedFormula:'33000000+1000*dealSeed+worldIndex; index 0..(worlds-1)',
  continuations:rows.length*worlds*2*POLICIES.length,
  selection:'Previously frozen block-prone positions from 20:53; NO reselection on new hidden worlds',
  strategies:['low-pip single','high-pip single'],continuationPolicies:POLICIES,
  summary:summarize(rows,worlds),rows,fullStrategyRounds:0,
  limitations:['Same positions as 20:53; independent hidden worlds only','Original selection favors block-prone states',
   'Official winner at block unknown','Assumed branch semantics','Handcrafted bots',
   'Exploratory position-level CIs without multiplicity adjustment','No pass-history conditioning'],
  exactNextAction:'Select fresh independent deal seeds and same-side matched actions to separate mobility from side/tile confounding; clarify official block rule.'};
}
if(require.main===module)console.log(JSON.stringify(run(Number(process.argv[2]||100)),null,2));
module.exports={run,replay,summarize};
