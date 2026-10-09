'use strict';
// Reproduce: node qosha-research/simulator/block-pip-mobility-replication.js [worlds=60]
// Independent 3x9 block-prone matched hidden-world holdout, no official block winner assumed.
const base=require('./block-pip-choice-replay'),e=require('./engine'),r=require('./round-driver');
const d=require('./turn-dispatcher'),{actionKey}=require('./decision-regret');
const SETS={
 'closed-branch-control':{
  'urgent/highMore':[300169,301290,302070,302753],
  'urgent/highNotMore':[300153,300377,300990,301114],
  'normal/highMore':[300037,300119,300324,300425],
  'normal/highNotMore':[300005,300011,300075,300080]},
 'min-hand-pips':{
  'urgent/highMore':[313510,317812],
  'urgent/highNotMore':[310864,311305,311728,312114],
  'normal/highMore':[310081,310101,310256,310280],
  'normal/highNotMore':[310000,310008,310010,310063]}
};
const POLICIES=['closed-branch-control','min-hand-pips','random-legal'];
function futureMobility(s,f){if(s.outcome)return 0;return new Set(d.actionsForHand(s.branchState,s.openingState,s.hands[f]).flatMap(a=>(a.tiles||[a.tile]).map(e.tileKey))).size;}
function mobility(p){return p.choice.keys.map(k=>{const s=r.stepRound(p.state,o=>o.actions.find(a=>actionKey(a)===k));return futureMobility(s,p.focal);});}
function ci(a){if(!a.length)return null;const n=a.length,m=a.reduce((s,x)=>s+x,0)/n,v=n>1?a.reduce((s,x)=>s+(x-m)**2,0)/(n-1):0,h=1.96*Math.sqrt(v/n);return{n,mean:m,ci95:[m-h,m+h]};}
function summarize(rows,worlds){
 const groups=['all','urgent','normal','highMore','highNotMore',...new Set(rows.map(x=>x.group))],out={};
 for(const g of groups){const a=rows.filter(x=>g==='all'||x.group===g||x.group.startsWith(g+'/')||x.group.endsWith('/'+g));out[g]={positions:a.length,policies:{}};
  for(const policy of POLICIES){const ds=a.map(x=>x.policies[policy]),sum=k=>ds.reduce((s,x)=>s+x[k],0),both=sum('both');
   out[g].policies[policy]={evaluatedWorlds:a.length*worlds,finishFirstHighMinusLow:ci(ds.map(x=>x.firstDiff/worlds)),
    remainderHighMinusLow:ci(ds.map(x=>x.pipsDiff/worlds)),blockHighMinusLow:ci(ds.map(x=>x.blockDiff/worlds)),
    minusHighMinusLow:ci(ds.map(x=>x.minusDiff/worlds)),bothBlockWorlds:both,
    distinctBothBlockPositions:ds.filter(x=>x.both).length,
    meanPipsHighMinusLowBothBlock:both?sum('bothPipsDiff')/both:null,
    bothBlockHighLower:sum('highLower'),bothBlockHighHigher:sum('highHigher'),bothBlockEqual:sum('equal'),
    strictMinProxyGain:sum('strictGain'),strictMinProxyLoss:sum('strictLoss')};
  }
 }return out;
}
function run(worlds=60){if(!Number.isInteger(worlds)||worlds<1||worlds>500)throw Error('world count');
 base.selfTest();const rows=[],seeds=new Set();
 for(const [policy,groups] of Object.entries(SETS))for(const [group,gs] of Object.entries(groups))for(const seed of gs){
  if(seeds.has(seed))throw Error('duplicate seed');seeds.add(seed);
  const p=base.position(seed,policy),m=mobility(p);
  const actual=(Math.min(...p.opponentSizes)<=2?'urgent':'normal')+'/'+(m[1]>m[0]?'highMore':'highNotMore');
  if(actual!==group)throw Error('stratum mismatch '+seed+' '+actual+' != '+group);
  const out=base.replay(p,worlds);if(out.trainHits<1)throw Error('training eligibility '+seed);
  rows.push({...out,group,mobilityLow:m[0],mobilityHigh:m[1]});
 }
 return{schema:'qosa-block-pip-mobility-replication/v1',
  timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'})+' +04:00',
  engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
  seedSets:SETS,seedScans:[{policy:'closed-branch-control',range:[300000,309999],screened:2754},
    {policy:'min-hand-pips',range:[310000,319999],screened:10000}],
  selection:'first eligible position per seed; distinct ordinary low/high pips gap >=3; 4 screening hidden worlds with >=1 BOTH-block under closed-control; quota by opponent min <=2 vs 3..4 and high-move future distinct playable tiles > low-move vs not',
  selectedPositions:rows.length,trainingWorldsPerPosition:4,evaluationWorldsPerPosition:worlds,
  newHiddenWorlds:rows.length*(4+worlds),candidateContinuations:rows.length*worlds*2*POLICIES.length,
  worldSeedFormula:'22000000+1000*dealSeed+worldIndex; 0..3 screening, 4..(3+worlds) evaluation',
  strategies:['low-pip single','high-pip single'],continuationPolicies:POLICIES,
  summary:summarize(rows,worlds),rows,fullStrategyRounds:0,
  limitations:['Training selected block-prone states','Official winner at block unknown; strict-min pips only descriptive',
   'Assumed branch semantics','First eligible state per seed','Simple bots','Unadjusted exploratory position-level CIs','No pass-history conditioning'],
  exactNextAction:'Confirm any mobility interaction on disjoint seeds and same-side choices; resolve official block rule.'};
}
if(require.main===module)console.log(JSON.stringify(run(Number(process.argv[2]||60)),null,2));
module.exports={run,mobility,SETS};
