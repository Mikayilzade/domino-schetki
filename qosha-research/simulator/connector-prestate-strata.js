'use strict';
// Independent pre-action strata of connector-vs-nonconnector paired continuations.
// node qosha-research/simulator/connector-prestate-strata.js test
// node qosha-research/simulator/connector-prestate-strata.js 1328840 3000 20 48
const e=require('./engine');
const c=require('./connector-lock-control');
const POLICIES=['min-hand-pips','closed-branch-control','fast-doubles'];
const mean=a=>a.reduce((s,v)=>s+v,0)/a.length;
function interval(rows,field){
 if(rows.length<2)return null;
 const mu=mean(rows.map(x=>x[field])),g=new Map();
 for(const row of rows){if(!g.has(row.seed))g.set(row.seed,[]);g.get(row.seed).push(row[field]);}
 if(g.size<2)return null;
 let ss=0;for(const a of g.values())ss+=Math.pow(a.reduce((s,v)=>s+v-mu,0),2);
 const se=Math.sqrt(g.size/(g.size-1)*ss/(rows.length*rows.length));
 return [100*(mu-3*se),100*(mu+3*se)];
}
function group(rows){
 if(!rows.length)return null;
 return {positions:rows.length,uniqueSeeds:new Set(rows.map(x=>x.seed)).size,
  nextPassGainPP:100*mean(rows.map(x=>x.pass)),
  firstPlaceGainPP:100*mean(rows.map(x=>x.win)),
  exploratorySeedCluster3SEPP:interval(rows,'win'),
  finalPipsDelta:mean(rows.map(x=>x.pips)),
  nextLegalActionsDelta:mean(rows.map(x=>x.nextActions)),
  blockDeltaPP:100*mean(rows.map(x=>x.block)),
  minusFinishDeltaPP:100*mean(rows.map(x=>x.minus))};
}
function run(start=1328840,count=3000,cap=20,worldLimit=48){
 const found=c.collect(start,count,cap),rows=[],perPosition=[],byNumber={3:0,5:0};
 let allocations=0,exactPositions=0;
 for(const p of found.positions){
  const frozen=JSON.stringify(p.state),w=c.worlds(p,worldLimit);
  allocations+=w.states.length;exactPositions+=+w.exact;byNumber[p.number]++;
  const next=(p.seat+1)%3,hand=p.state.hands[p.seat];
  const active=e.SIDES.filter(side=>p.state.branchState.branches[side].active);
  const accessible=new Set(active.map(side=>p.state.branchState.branches[side].end)
   .filter(n=>e.isNumberOpened(p.state.openingState,n)));
  const features={focalHandSize:hand.length,nextHandSize:p.state.hands[next].length,
   thirdHandSize:p.state.hands[(p.seat+2)%3].length,
   accessibleEndNumbers:accessible.size,remainingConnectors:p.remainingConnectors,
   pipGap:p.pipGap,turn:p.turn};
  perPosition.push({seed:p.seed,seat:p.seat,profile:p.profile,number:p.number,
   ...features,worlds:w.states.length,exact:w.exact,support:w.support});
  for(const policy of POLICIES){
   const vals={win:[],pips:[],minus:[],block:[],pass:[],nextActions:[]};
   for(const world of w.states){
    const a=c.rollout(world,p.connector,policy,p.seat);
    const b=c.rollout(world,p.nonconnector,policy,p.seat);
    for(const metric of Object.keys(vals)){
     const field={win:'win',pips:'pips',minus:'minus',block:'block',pass:'nextPass',nextActions:'nextActions'}[metric];
     vals[metric].push(a[field]-b[field]);
    }
   }
   rows.push({seed:p.seed,seat:p.seat,discoveryProfile:p.profile,number:p.number,
    continuationPolicy:policy,...features,worlds:w.states.length,exact:w.exact,
    ...Object.fromEntries(Object.entries(vals).map(([k,v])=>[k,mean(v)]))});
  }
  if(JSON.stringify(p.state)!==frozen)throw Error('source position mutated');
 }
 const summaries={};
 const conditions={
  all:x=>true,
  nextAtMostTwo:x=>x.nextHandSize<=2,
  nextThreePlus:x=>x.nextHandSize>=3,
  focalAtMostThree:x=>x.focalHandSize<=3,
  focalFourPlus:x=>x.focalHandSize>=4,
  connectorStillHeld:x=>x.remainingConnectors>=1,
  noOtherConnector:x=>x.remainingConnectors===0,
  atMostTwoAccessibleNumbers:x=>x.accessibleEndNumbers<=2,
  threePlusAccessibleNumbers:x=>x.accessibleEndNumbers>=3,
  connectorDiscardsMorePips:x=>x.pipGap>0,
  connectorDiscardsFewerPips:x=>x.pipGap<0
 };
 for(const policy of POLICIES){
  summaries[policy]={};
  const rs=rows.filter(x=>x.continuationPolicy===policy);
  for(const [name,fn] of Object.entries(conditions))summaries[policy][name]=group(rs.filter(fn));
 }
 return {schema:'qosa-connector-prestate-strata/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
  mode:'3x9',startSeed:start,endSeed:start+count-1,cap,worldLimit,
  selectedPositions:found.positions.length,uniqueSelectedSeeds:new Set(found.positions.map(x=>x.seed)).size,
  selectedByDouble:byNumber,scanned:found.scanned,uniqueHiddenAllocations:allocations,
  exactPositions,forcedCounterfactualContinuations:allocations*2*POLICIES.length,
  fullStrategyRoundsAdded:0,continuationPolicies:POLICIES,
  comparison:'same-side connector X-Y versus U-Y nonconnector, both defer X-X; paired pass-compatible worlds; same continuation policy',
  strata:'Pre-action features only; overlapping exploratory subgroups, not causal isolation. Different endpoint and discarded pips confound.',
  assumptions:'Provisional branch opening; block winner unassigned; equal-weight pass-compatible hidden allocations without prior action likelihood; first eligible position; deterministic bots; exploratory cluster 3SE, no multiplicity claim.',
  next:'Fresh disjoint seeds, sign-balanced comparator selection and endpoint-pair matching; verify if any hand-size subgroup has stable win gain, not just next-pass gain.',
  summaries,perPosition,rows};
}
function test(){
 const a=run(1315640,500,1,2),b=run(1315640,500,1,2);
 if(JSON.stringify(a)!==JSON.stringify(b)||a.selectedPositions!==4||
 a.forcedCounterfactualContinuations!==a.uniqueHiddenAllocations*6||
 a.rows.some(x=>!Number.isFinite(x.win)||!Number.isFinite(x.pass)))throw Error('prestate deterministic replay');
 return {passed:true,positions:a.selectedPositions,allocations:a.uniqueHiddenAllocations};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1328840),+(a[1]||3000),+(a[2]||20),+(a[3]||48)),null,2));}
module.exports={run,test,group,interval};
