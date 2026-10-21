'use strict';
// Independent exact late-endgame connectivity holdout. Only qosha-research/.
// node qosha-research/simulator/late-double-bridge-holdout.js test
// node qosha-research/simulator/late-double-bridge-holdout.js
const late=require('./late-equal-pip-holdout');
const exact=require('./late-equal-pip-exact-recheck');
const e=require('./engine');
const policies=['min-hand-pips','closed-branch-control','fast-doubles','moderate-double-hold'];
const cohorts=[{start:1360000,policy:'min-hand-pips'},{start:1365000,policy:'closed-branch-control'}];
function classify(p){
 const hand=p.state.hands[p.focal],ordinary=hand.filter(t=>t[0]!==t[1]);
 if(hand.length!==3||ordinary.length!==2)return null;
 const linked=ordinary[0].some(x=>ordinary[1].includes(x));
 const x=p.pair.double.numbers[0];
 return {connectedAfterOpen:linked,doubleNumber:x,
  xConnectors:ordinary.filter(t=>t.includes(x)).length,
  hand:hand.map(e.tileKey),single:e.tileKey(p.pair.single.tile)};
}
function select(perCell=14){
 const positions=[],scans=[];
 for(const c of cohorts){
  const z=late.collectLate(c.start,100,c.policy,4000);
  if(z.positions.length!==100)throw Error('discovery shortfall '+c.start);
  const eligible=z.positions.map(p=>({p,features:classify(p)})).filter(x=>x.features);
  const yes=eligible.filter(x=>x.features.connectedAfterOpen).slice(0,perCell);
  const no=eligible.filter(x=>!x.features.connectedAfterOpen).slice(0,perCell);
  if(yes.length!==perCell||no.length!==perCell)throw Error('stratum shortfall '+c.start);
  positions.push(...yes,...no);
  scans.push({start:c.start,endExclusive:c.start+z.scanned,policy:c.policy,
    eligibleLate:z.positions.length,threeTileOneDouble:eligible.length,
    connectedCandidates:eligible.filter(x=>x.features.connectedAfterOpen).length,
    disconnectedCandidates:eligible.filter(x=>!x.features.connectedAfterOpen).length,
    selectedConnected:yes.length,selectedDisconnected:no.length});
 }
 if(new Set(positions.map(x=>x.p.seed)).size!==positions.length)throw Error('seed collision');
 return {positions,scans};
}
function stat(a){
 if(!a.length)return {n:0,mean:null,ci95:null};
 const m=a.reduce((s,x)=>s+x,0)/a.length;
 const sd=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):0;
 return {n:a.length,mean:m,ci95:[m-1.96*sd/Math.sqrt(a.length),m+1.96*sd/Math.sqrt(a.length)]};
}
function group(rows){
 const groups={all:rows,connected:rows.filter(x=>x.connectedAfterOpen),
  disconnected:rows.filter(x=>!x.connectedAfterOpen),
  connectedXSupport0:rows.filter(x=>x.connectedAfterOpen&&x.xConnectors===0),
  connectedXSupport1plus:rows.filter(x=>x.connectedAfterOpen&&x.xConnectors>0),
  disconnectedXSupport0:rows.filter(x=>!x.connectedAfterOpen&&x.xConnectors===0),
  disconnectedXSupport1plus:rows.filter(x=>!x.connectedAfterOpen&&x.xConnectors>0)};
 for(const c of cohorts)for(const k of ['connected','disconnected'])
  groups[c.policy+'_'+k]=rows.filter(x=>x.discovery===c.policy&&x.connectedAfterOpen===(k==='connected'));
 return Object.fromEntries(Object.entries(groups).map(([name,rr])=>[name,{
  positions:rr.length,allocations:rr.reduce((s,x)=>s+x.exactAllocations,0),
  positiveAllFour:rr.filter(x=>policies.every(p=>x.policies[p].win>0)).length,
  negativeAllFour:rr.filter(x=>policies.every(p=>x.policies[p].win<0)).length,
  nextMobility:stat(rr.map(x=>x.nextMobility)),
  focalMobility:stat(rr.map(x=>x.focalMobility)),
  policies:Object.fromEntries(policies.map(p=>[p,{
   firstFinisher:stat(rr.map(x=>x.policies[p].win)),
   remainder:stat(rr.map(x=>x.policies[p].pips)),
   minusFinish:stat(rr.map(x=>x.policies[p].minus)),
   block:stat(rr.map(x=>x.policies[p].block))}]))}]));
}
function run(perCell=14){
 const {positions,scans}=select(perCell);
 const rows=positions.map(({p,features})=>({...exact.analyze(p),...features}));
 const alloc=rows.reduce((s,x)=>s+x.exactAllocations,0);
 return {schema:'qosa-late-double-bridge-exact/v1',engine:'qosa-research-0.5.3',
  rules:'qosa-1.0.0',mode:'3x9',scans,selection:'First 100 late equal-pip positions per discovery cohort; first 14 with 3-tile hand (one double, two ordinary) whose two ordinary stones share a number and first 14 whose ordinary stones do not; no outcome-based selection.',
  positions:rows.length,exactHiddenAllocations:alloc,candidateContinuations:alloc*policies.length*2,
  newFullStrategyRounds:0,unresolved:0,policies,
  weighting:'Uniform distinct unseen allocations within each position; equal weight per selected position and group.',
  metricDirection:'All differences opening X-X minus equal-pip ordinary single; minusFinish is BENEFICIAL (negative difference is lost minus opportunity).',
  caveats:'Observational feature grouping, not causal: after-action branch ends, held tiles, and immediate legal options differ. Four deterministic bots; provisional branch semantics; earlier opponent actions not used for hidden-world posterior; blocks unassigned; selected late 3-tile states; exploratory position intervals.',
  summary:group(rows),rows};
}
function test(){
 const a=select(2),b=select(2);
 if(JSON.stringify(a.scans)!==JSON.stringify(b.scans)||a.positions.length!==8)throw Error('selection replay');
 const seeds=a.positions.map(x=>x.p.seed);
 if(new Set(seeds).size!==8)throw Error('duplicate seeds');
 for(const {p,features} of a.positions){
  if(e.pipSum(p.pair.double.tiles)!==e.pipSum([p.pair.single.tile]))throw Error('pip mismatch');
  if(classify(p).connectedAfterOpen!==features.connectedAfterOpen)throw Error('connectivity mismatch');
 }
 const q=exact.analyze(a.positions[0].p);
 if(q.exactAllocations<1||policies.some(p=>!Number.isFinite(q.policies[p].win)))throw Error('exhaustive evaluation');
 return {passed:true,selected:8,seeds,firstExactAllocations:q.exactAllocations};
}
if(require.main===module)console.log(JSON.stringify(process.argv[2]==='test'?test():run(),null,2));
module.exports={classify,select,stat,group,run,test};
