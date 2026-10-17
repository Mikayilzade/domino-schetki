'use strict';
// Paired high-exact-pass versus low-exact-pass, stratified by ACTUAL next opponent pass.
// Reproduce: node qosha-research/simulator/pass-mechanism-strata.js test
//            node qosha-research/simulator/pass-mechanism-strata.js 860000 890000 30 64
const {collect}=require('./two-opponent-conditional-holdout');
const {evaluate}=require('./exact-next-pass-hypergeom');
const {sampleWorld}=require('./hidden-world');
const {actionKey}=require('./decision-regret');
const {rollout}=require('./pass-outcome-holdout');
const d=require('./turn-dispatcher');
const e=require('./engine');
const policies=['closed-branch-control','min-hand-pips','fast-doubles'];
const metrics=['win','pips','minus'];
const groups=['highOnly','lowOnly','both','neither'];
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
function stat(xs){
 if(!xs.length)return {n:0,mean:null,ci95:null};
 const m=mean(xs),sd=xs.length>1?Math.sqrt(xs.reduce((s,x)=>s+(x-m)**2,0)/(xs.length-1)):0);
 return {n:xs.length,mean:m,ci95:xs.length>1?[m-1.96*sd/Math.sqrt(xs.length),m+1.96*sd/Math.sqrt(xs.length)]:null};
}
function boardSignature(t){
 return JSON.stringify({ends:e.SIDES.map(side=>[t.branchState.branches[side].active,t.branchState.branches[side].end]),opened:[...t.openingState.openedNumbers].sort((a,b)=>a-b)});
}
function run(start=860000,end=890000,limit=30,n=64){
 const found=collect(start,end,limit),rows=[];
 let continuations=0,worlds=0;
 for(const p of found.out){
  const s=p.state,f=s.currentPlayer,next=(f+1)%3,x=evaluate(p);
  const high=x.passDelta>1e-12?0:x.passDelta< -1e-12?1:-1;
  const keys=[p.pair.connector,p.pair.other];
  const opts=d.turnOptions(s.branchState,s.openingState,s.hands[f],s.stock);
  const actions=keys.map(key=>opts.actions.find(a=>actionKey(a)===key));
  if(actions.some(a=>!a||a.type!=='single')||s.stock.length)throw Error('invalid candidate/stock');
  const boards=actions.map(a=>d.applyTurn(s.branchState,s.openingState,s.hands[f],s.stock,a));
  const geometrySame=boardSignature(boards[0])===boardSignature(boards[1]);
  const counts=Object.fromEntries(groups.map(k=>[k,0]));
  const values=Object.fromEntries(policies.map(k=>[k,Object.fromEntries(groups.map(g=>[g,[]]))]));
  const spec={focalPlayer:f,focalHand:s.hands[f],knownTiles:p.known,
   hiddenHandSizes:s.hands.map(h=>h.length),stockSize:0,visibleState:s};
  if(high!==-1){
   for(let j=0;j<n;j++){
    const seed=(1900000000+Math.imul(p.seed,107)+j)>>>0,w=sampleWorld(spec,seed);
    worlds++;
    const passed=boards.map(b=>d.actionsForHand(b.branchState,b.openingState,w.hands[next]).length===0);
    const hi=passed[high],lo=passed[1-high];
    const group=hi?(lo?'both':'highOnly'):(lo?'lowOnly':'neither');
    counts[group]++;
    for(const policy of policies){
     const a=rollout(w,keys[high],policy,seed),b=rollout(w,keys[1-high],policy,seed);
     continuations+=2;
     values[policy][group].push(Object.fromEntries(metrics.map(m=>[m,a[m]-b[m]])));
    }
   }
  }
  rows.push({seed:p.seed,turn:p.turn,nextHandSize:s.hands[next].length,
   exactPassHigh:high===-1?x.connector.pass:Math.max(x.connector.pass,x.unrelated.pass),
   exactPassLow:high===-1?x.unrelated.pass:Math.min(x.connector.pass,x.unrelated.pass),
   informative:high!==-1,highCandidate:high===0?'connector':high===1?'unrelated':'tie',
   geometrySame,counts,byPolicy:Object.fromEntries(policies.map(k=>[k,Object.fromEntries(groups.map(g=>[g,Object.fromEntries(metrics.map(m=>[m,mean(values[k][g].map(v=>v[m]))]))]))]))});
 }
 const informative=rows.filter(r=>r.informative);
 function summarize(subset){
  const total=Object.fromEntries(groups.map(g=>[g,subset.reduce((s,r)=>s+r.counts[g],0)]));
  return {positions:subset.length,worlds:subset.reduce((s,r)=>s+Object.values(r.counts).reduce((a,b)=>a+b,0),0),
   counts:total,policy:Object.fromEntries(policies.map(k=>[k,Object.fromEntries(groups.map(g=>[g,
    Object.fromEntries(metrics.map(m=>[m,stat(subset.filter(r=>r.counts[g]>0).map(r=>r.byPolicy[k][g][m]))]))]))]))};
 }
 return {schema:'qosa-pass-mechanism-strata/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
  seedRange:[start,end-1],scannedDeals:found.scanned,positions:rows.length,informativePositions:informative.length,
  sampledHiddenWorlds:worlds,candidateContinuations:continuations,worldsPerInformativePosition:n,
  worldSeedFormula:'(1900000000+Math.imul(dealSeed,107)+worldIndex)>>>0',discovery:'min-hand-pips',
  policies,geometrySameInformative:informative.filter(r=>r.geometrySame).length,
  summary:{all:summarize(informative),nextOne:summarize(informative.filter(r=>r.nextHandSize===1)),
   nextTwo:summarize(informative.filter(r=>r.nextHandSize===2))},rows,
  limitations:'Observed-pass strata are post-action selections, NOT causal controls; actions change geometry/tile identity; uniform hidden allocations ignore opponent history; first eligible positions; assumed branch opening; block winner not assigned; normal position-cluster CI exploratory.'};
}
function test(){
 const a=run(860000,861000,2,3),b=run(860000,861000,2,3);
 if(JSON.stringify(a.rows)!==JSON.stringify(b.rows)||a.candidateContinuations!==a.sampledHiddenWorlds*policies.length*2)throw Error('deterministic replay/count');
 const q=a.summary.all.counts;if(Object.values(q).reduce((s,v)=>s+v,0)!==a.sampledHiddenWorlds)throw Error('strata partition');
 return {passed:true,selectedSeeds:a.rows.map(r=>r.seed),informative:a.informativePositions,worlds:a.sampledHiddenWorlds,continuations:a.candidateContinuations};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||860000),+(a[1]||890000),+(a[2]||30),+(a[3]||64)),null,2));}
module.exports={run,test,boardSignature};
