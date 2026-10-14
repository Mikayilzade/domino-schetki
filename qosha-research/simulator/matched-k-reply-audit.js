'use strict';
// Reproduce: node qosha-research/simulator/matched-k-reply-audit.js test
// Reproduce: node qosha-research/simulator/matched-k-reply-audit.js 4100000 4199999 60 20
const e=require('./engine'),d=require('./turn-dispatcher'),h=require('./hidden-world');
const b=require('./matched-k-outcome-runner'),{chooseBy}=require('./strategy-runner');
const {actionKey}=require('./decision-regret');
const POLICIES=['closed-branch-control','min-hand-pips','fast-doubles'];
const avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
function stat(a){const m=avg(a),n=a.length,sd=n>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(n-1)):0;
 return{n,mean:m,exploratoryCI95:n>1?[m-1.96*sd/Math.sqrt(n),m+1.96*sd/Math.sqrt(n)]:null};}
function summarize(raw){
 const groups={all:raw.positions,noObservedPassFlip:raw.positions.filter(r=>r.immediate.passFlips===0),
  observedPassFlip:raw.positions.filter(r=>r.immediate.passFlips>0),
  singleRestrictsMajority:raw.positions.filter(r=>r.immediate.singleRestricts>raw.worldsPerPosition/2),
  otherMobility:raw.positions.filter(r=>r.immediate.singleRestricts<=raw.worldsPerPosition/2)};
 return Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,{
  positions:v.length,observedPassFlips:v.reduce((s,r)=>s+r.immediate.passFlips,0),
  policy:Object.fromEntries(POLICIES.map(p=>[p,Object.fromEntries(['win','pips','minus','block'].map(m=>[m,stat(v.map(r=>r.metrics[p][m]))]))]))
 }]));
}
function replyAudit(raw){
 const [start,last]=raw.discoverySeeds,found=b.discover(start,last+1,raw.selectedPositions,raw.discoveryPolicy);
 if(found.positions.length!==raw.positions.length||found.positions.some((p,i)=>p.seed!==raw.positions[i].seed))throw Error('discovery mismatch');
 const counts=Object.fromEntries(POLICIES.map(p=>[p,{sameAction:0,sameTileDifferentPlacement:0,differentTile:0,passFlip:0,bothPass:0}]));
 let worlds=0,unique=0,endsEqual=0;
 for(const pos of found.positions){
  const s=pos.state,f=pos.focal,original=JSON.stringify(s);
  const used=new Set(s.hands.flat().concat(s.stock).map(e.tileKey));
  const spec={focalPlayer:f,focalHand:s.hands[f],knownTiles:e.createDoubleSixDeck().filter(t=>!used.has(e.tileKey(t))),
   hiddenHandSizes:s.hands.map(x=>x.length),stockSize:s.stock.length,visibleState:s};
  const allocations=new Set();
  for(let wi=0;wi<raw.worldsPerPosition;wi++){
   const seed=(1500000000+Math.imul(pos.seed,73)+wi)>>>0,w=h.sampleWorld(spec,seed);
   allocations.add(JSON.stringify(w.hands.map((hand,i)=>i===f?[]:hand.map(e.tileKey).sort()).concat([w.stock.map(e.tileKey).sort()])));
   const options=d.turnOptions(w.branchState,w.openingState,w.hands[f],w.stock);
   const actions=new Map(options.actions.map(a=>[actionKey(a),a]));
   const applied=[pos.pair.single,pos.pair.double].map(k=>{const a=actions.get(k);if(!a)throw Error('candidate mismatch');return d.applyTurn(w.branchState,w.openingState,w.hands[f],w.stock,a);});
   if(e.SIDES.every(side=>applied[0].branchState.branches[side].end===applied[1].branchState.branches[side].end))endsEqual++;
   const next=(f+1)%3,opts=applied.map(a=>d.turnOptions(a.branchState,a.openingState,w.hands[next],a.stock));
   for(const policy of POLICIES){
    const keys=opts.map(o=>o.phase==='pass'?'PASS':actionKey(chooseBy(policy,o,{seed,turns:w.turns+1,player:next})));
    const c=counts[policy];
    if(keys[0]==='PASS'&&keys[1]==='PASS')c.bothPass++;
    else if(keys[0]==='PASS'||keys[1]==='PASS')c.passFlip++;
    else if(keys[0]===keys[1])c.sameAction++;
    else if(keys[0].split('|').at(-1)===keys[1].split('|').at(-1))c.sameTileDifferentPlacement++;
    else c.differentTile++;
   }
   worlds++;
  }
  unique+=allocations.size;
  if(JSON.stringify(s)!==original)throw Error('visible source mutated');
 }
 for(const p of POLICIES)if(Object.values(counts[p]).reduce((a,b)=>a+b,0)!==worlds)throw Error('reply category partition');
 if(worlds!==raw.global.worlds||unique!==raw.global.uniqueAllocations)throw Error('world/replay mismatch');
 return{worlds,uniqueAllocations:unique,endsEqual,counts};
}
function run(start=4100000,end=4199999,limit=60,worlds=20){
 const raw=b.run(start,end,limit,worlds,POLICIES,'min-hand-pips');
 if(!raw.selectedPositions)throw Error('no eligible positions');
 return{schema:'qosa-matched-k-reply-audit/v1',engine:raw.engine,rules:raw.rules,mode:'3x9',
  discoverySeeds:raw.discoverySeeds,scannedDeals:raw.scannedDeals,positions:raw.selectedPositions,
  worlds:raw.global.worlds,uniqueAllocations:raw.global.uniqueAllocations,continuations:raw.global.continuations,
  worldSeedFormula:raw.worldSeedFormula,discoveryPolicy:raw.discoveryPolicy,policies:POLICIES,
  global:raw.global,strata:summarize(raw),reply:replyAudit(raw),positionRows:raw.positions,
  newFullStrategyRounds:0,verifiedPriorFullStrategyRounds:180000,
  limitations:'First eligible positions and pairs; sampled hidden worlds with replacement; no observed pass flips means none among sampled worlds, NOT impossible. Opponent replies are post-action mediators; different full branch geometry; bot policies, assumed branch rules, no block winner; exploratory position CIs, not causal.',
  next:'Repeat on disjoint seeds and examine concrete move/number patterns where double opening wins despite restricting opponent options.'};
}
function test(){const x=run(3650080,3650081,1,2),y=run(3650080,3650081,1,2);
 if(JSON.stringify(x)!==JSON.stringify(y)||x.worlds!==2||x.continuations!==12)throw Error('replay');
 return{passed:true,fixture:3650080,worlds:2};}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||4100000),+(a[1]||4199999),+(a[2]||60),+(a[3]||20)),null,2));}
module.exports={run,test,summarize,replyAudit};