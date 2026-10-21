'use strict';
// Independent equal-pip double-opening holdout by number, X-connectors and next-player hand size.
// node qosha-research/simulator/equal-pip-number-support.js test
// node qosha-research/simulator/equal-pip-number-support.js 1321000 1329000 200 40
const base=require('./equal-pip-double-mobility'),e=require('./engine');
const policies=['min-hand-pips','closed-branch-control'];
function stat(a){if(!a.length)return{n:0};const m=a.reduce((s,x)=>s+x,0)/a.length;
 const sd=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):0;
 return{n:a.length,mean:m,ci95:[m-1.96*sd/Math.sqrt(a.length),m+1.96*sd/Math.sqrt(a.length)],
 positive:a.filter(x=>x>1e-10).length,negative:a.filter(x=>x< -1e-10).length,ties:a.filter(x=>Math.abs(x)<=1e-10).length};}
function features(p){const f=p.focal,x=p.pair.double.numbers[0],hand=p.state.hands[f],single=p.pair.single.tile;
 const xConnectors=hand.filter(t=>t[0]!==t[1]&&(t[0]===x||t[1]===x)).length;
 const otherDoubles=hand.filter(t=>t[0]===t[1]&&t[0]!==x).length;
 const singleLinks=hand.filter(t=>e.tileKey(t)!==e.tileKey(single)&&
   (t.includes(single[0])||t.includes(single[1]))).length;
 return{xConnectors,otherDoubles,singleLinks,nextHandSize:p.state.hands[p.next].length,
 focalHandSize:hand.length,doubleNumber:x};}
function grouped(rows){
 const groups={all:rows,support0:rows.filter(r=>r.xConnectors===0),
  support1:rows.filter(r=>r.xConnectors===1),support2plus:rows.filter(r=>r.xConnectors>=2),
  nextAtMostTwo:rows.filter(r=>r.nextHandSize<=2),nextThreePlus:rows.filter(r=>r.nextHandSize>=3),
  focalAtMostFour:rows.filter(r=>r.focalHandSize<=4),focalFivePlus:rows.filter(r=>r.focalHandSize>=5),
  mobilityIncrease:rows.filter(r=>r.immediate.tileTypes>0),
  mobilityNonIncrease:rows.filter(r=>r.immediate.tileTypes<=0)};
 for(let x=1;x<=5;x++){groups['double'+x]=rows.filter(r=>r.doubleNumber===x);
  groups['double'+x+'Support0']=rows.filter(r=>r.doubleNumber===x&&r.xConnectors===0);
  groups['double'+x+'Support1plus']=rows.filter(r=>r.doubleNumber===x&&r.xConnectors>=1);}
 return Object.fromEntries(Object.entries(groups).map(([name,rr])=>[name,{
  positions:rr.length,mobility:stat(rr.map(r=>r.immediate.tileTypes)),
  firstFinisher:Object.fromEntries(policies.map(p=>[p,stat(rr.map(r=>r.policies[p].win))])),
  remainingPips:Object.fromEntries(policies.map(p=>[p,stat(rr.map(r=>r.policies[p].pips))])),
  minusFinish:Object.fromEntries(policies.map(p=>[p,stat(rr.map(r=>r.policies[p].minus))]))
 }]));}
function run(start=1321000,end=1329000,limit=200,worlds=40){
 const mid=start+Math.floor((end-start)/2);
 const first=base.collect(start,mid,Math.ceil(limit/2),'min-hand-pips');
 const second=base.collect(mid,end,Math.floor(limit/2),'closed-branch-control');
 const positions=[...first.positions,...second.positions];
 const rows=positions.map(p=>({...base.analyze(p,worlds),...features(p)}));
 const seeds=new Set(rows.map(r=>r.seed));if(seeds.size!==rows.length)throw Error('seed overlap');
 return{schema:'qosa-equal-pip-number-support/v1',
  timestampBaku:new Date(Date.now()+4*3600000).toISOString().slice(0,19)+' +04:00',
  engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
  seedSets:{minPips:[start,start+first.scanned],branchControl:[mid,mid+second.scanned]},
  scannedDeals:first.scanned+second.scanned,positions:rows.length,worldsPerPosition:worlds,
  hiddenAllocations:rows.length*worlds,candidateContinuations:rows.reduce((n,r)=>n+r.continuations,0),
  unresolved:0,fullStrategyRoundsAdded:0,policies,
  comparison:'Opening one X-X vs ordinary A-B with A+B=2X; same initial state, equal discarded pips, matched hidden worlds; first eligible deterministic pair per seed.',
  worldSeedFormula:'mixSeed32((dealSeed + imul(worldIndex+1,0x9e3779b9)) >>> 0)',
  supportDefinition:'xConnectors is count of other non-double X-linked tiles in focal hand BEFORE decision; support0/1/2plus.',
  caveats:'Exploratory subgroup analyses, not randomized causal double-opening effect; only X=1..5 eligible under equal-pip rule; first-eligible selection; two fixed bot policies; provisional branch semantics; uniform hidden worlds, no opponent choice history; no block winner; position-level normal CIs; finish-first not match win.',
  summary:grouped(rows),rows};}
function test(){
 const f=base.collect(1321000,1321050,3);
 if(f.positions.length!==3)throw Error('discovery');
 for(const p of f.positions){const x=features(p);
  if(x.xConnectors<0||x.xConnectors>p.state.hands[p.focal].length-1||x.doubleNumber<1||x.doubleNumber>5)throw Error('feature bounds');
  if(e.pipSum(p.pair.double.tiles)!==e.pipSum([p.pair.single.tile]))throw Error('unequal pips');}
 const a=run(1321000,1321100,4,3),b=run(1321000,1321100,4,3);
 if(JSON.stringify(a)!==JSON.stringify(b)||a.candidateContinuations!==48)throw Error('replay');
 return{passed:true,positions:a.positions,continuations:a.candidateContinuations};}
if(require.main===module){const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1321000),+(a[1]||1329000),+(a[2]||200),+(a[3]||40)),null,2));}
module.exports={features,grouped,run,test};
