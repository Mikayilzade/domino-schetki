'use strict';
// Signed-gap control: node qosha-research/simulator/connector-signed-gap-holdout.js test
// node qosha-research/simulator/connector-signed-gap-holdout.js 1331840 3000 60 128
const e=require('./engine'),c=require('./connector-lock-control');
const POLICIES=['min-hand-pips','closed-branch-control','fast-doubles'];
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
function cluster3se(rows,field){
 if(rows.length<2)return null;
 const m=mean(rows.map(x=>x[field])),groups=new Map();
 for(const x of rows){if(!groups.has(x.seed))groups.set(x.seed,[]);groups.get(x.seed).push(x[field]);}
 if(groups.size<2)return null;
 let ss=0;for(const g of groups.values())ss+=Math.pow(g.reduce((s,v)=>s+v-m,0),2);
 const se=Math.sqrt(groups.size/(groups.size-1)*ss/(rows.length*rows.length));
 return [100*(m-3*se),100*(m+3*se)];
}
function summarize(rows){
 if(!rows.length)return null;
 return {positions:rows.length,uniqueSeeds:new Set(rows.map(x=>x.seed)).size,
  firstPlaceGainPP:100*mean(rows.map(x=>x.win)),
  exploratorySeedCluster3SEPP:cluster3se(rows,'win'),
  nextPassGainPP:100*mean(rows.map(x=>x.pass)),
  meanRemainderDelta:mean(rows.map(x=>x.pips)),
  blockGainPP:100*mean(rows.map(x=>x.block)),
  minusFinishGainPP:100*mean(rows.map(x=>x.minus))};
}
function select(found){
 const positions=[],strata=[];
 for(const profile of ['min-hand-pips','closed-branch-control'])for(const n of [3,5]){
  const pool=found.positions.filter(p=>p.profile===profile&&p.number===n&&Math.abs(p.pipGap)===1);
  const plus=pool.filter(p=>p.pipGap===1),minus=pool.filter(p=>p.pipGap===-1);
  const k=Math.min(plus.length,minus.length);
  strata.push({profile,double:n,availablePositive:plus.length,availableNegative:minus.length,selectedPerSign:k});
  positions.push(...plus.slice(0,k),...minus.slice(0,k));
 }
 return {positions,strata};
}
function run(start=1331840,count=3000,cap=60,limit=128){
 const found=c.collect(start,count,cap),chosen=select(found),rows=[],positions=[];
 let worlds=0,exact=0;
 for(const p of chosen.positions){
  const frozen=JSON.stringify(p.state),w=c.worlds(p,limit);
  worlds+=w.states.length;exact+=+w.exact;
  const next=(p.seat+1)%3;
  const accessible=new Set(e.SIDES.filter(side=>p.state.branchState.branches[side].active)
   .map(side=>p.state.branchState.branches[side].end)
   .filter(n=>e.isNumberOpened(p.state.openingState,n)));
  positions.push({seed:p.seed,seat:p.seat,profile:p.profile,double:p.number,pipGap:p.pipGap,
   connectorEnd:Number(p.connector.split('|')[2]),nonconnectorEnd:Number(p.nonconnector.split('|')[2]),
   retainedOtherConnector:p.remainingConnectors>0,accessibleNumbers:accessible.size,
   focalHandSize:p.state.hands[p.seat].length,nextHandSize:p.state.hands[next].length,
   worlds:w.states.length,support:w.support,exact:w.exact});
  for(const policy of POLICIES){
   const metrics={win:[],pass:[],pips:[],block:[],minus:[]};
   for(const world of w.states){
    const a=c.rollout(world,p.connector,policy,p.seat),b=c.rollout(world,p.nonconnector,policy,p.seat);
    metrics.win.push(a.win-b.win);metrics.pass.push(a.nextPass-b.nextPass);
    metrics.pips.push(a.pips-b.pips);metrics.block.push(a.block-b.block);
    metrics.minus.push(a.minus-b.minus);
   }
   rows.push({seed:p.seed,seat:p.seat,profile:p.profile,double:p.number,
    pipGap:p.pipGap,policy,worlds:w.states.length,retainedOtherConnector:p.remainingConnectors>0,
    ...Object.fromEntries(Object.entries(metrics).map(([k,v])=>[k,mean(v)]))});
  }
  if(JSON.stringify(p.state)!==frozen)throw Error('source position mutated');
 }
 const summary={};
 for(const policy of POLICIES){
  const a=rows.filter(x=>x.policy===policy);
  summary[policy]={all:summarize(a),positiveGap:summarize(a.filter(x=>x.pipGap>0)),
   negativeGap:summarize(a.filter(x=>x.pipGap<0)),
   extraConnector:summarize(a.filter(x=>x.retainedOtherConnector)),
   noExtraConnector:summarize(a.filter(x=>!x.retainedOtherConnector)),
   byDouble:Object.fromEntries([3,5].map(n=>[n,{
    positive:summarize(a.filter(x=>x.double===n&&x.pipGap>0)),
    negative:summarize(a.filter(x=>x.double===n&&x.pipGap<0))}]))};
 }
 return {schema:'qosa-connector-signed-gap-holdout/v1',engine:'qosa-research-0.5.3',
  rules:'qosa-1.0.0',mode:'3x9',timestampBaku:'2026-10-22T12:50:10+04:00',
  startSeed:start,endSeed:start+count-1,cap,worldLimit:limit,scanned:found.scanned,
  discoveredPositions:found.positions.length,selectedStrata:chosen.strata,
  selectedPositions:chosen.positions.length,
  uniqueSelectedSeeds:new Set(chosen.positions.map(x=>x.seed)).size,
  uniqueHiddenAllocations:worlds,exactPositions:exact,
  forcedCounterfactualContinuations:worlds*2*POLICIES.length,fullStrategyRoundsAdded:0,
  continuationPolicies:POLICIES,summary,positions,rows,
  selection:'Within each discovery profile and double (3 or 5), equal counts of pip gaps +1 and -1; same absolute discarded-pip difference, not same resulting endpoints.',
  limitations:'Provisional branch opening; no block winner; first eligible selected; uniform pass-compatible allocations without earlier action likelihood; fixed bots; different resulting endpoint values; exploratory seed-cluster 3SE, no multiplicity correction.',
  next:'Fresh seeds >=1334840, explicit endpoint-pair reversal and independent full-deal policy holdout; Node CLI regression.'};
}
function test(){
 const a=run(1331840,3000,60,2),b=run(1331840,3000,60,2);
 if(JSON.stringify(a)!==JSON.stringify(b)||!a.selectedPositions||
  a.selectedStrata.some(x=>!x.selectedPerSign)||
  a.forcedCounterfactualContinuations!==a.uniqueHiddenAllocations*6||
  a.rows.some(x=>!Number.isFinite(x.win)||!Number.isFinite(x.pass)))throw Error('deterministic replay');
 for(const s of a.selectedStrata){
  const q=a.positions.filter(p=>p.profile===s.profile&&p.double===s.double);
  if(q.filter(p=>p.pipGap===1).length!==s.selectedPerSign||
   q.filter(p=>p.pipGap===-1).length!==s.selectedPerSign)throw Error('signed gap balance');
 }
 return {passed:true,positions:a.selectedPositions,worlds:a.uniqueHiddenAllocations};
}
if(require.main===module){const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1331840),+(a[1]||3000),+(a[2]||60),+(a[3]||128)),null,2));}
module.exports={run,test,select,summarize};
