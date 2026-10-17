'use strict';
// Stratify reproducible paired exact-pass outcomes by next opponent hand size.
// Usage: node qosha-research/simulator/pass-outcome-strata-runner.js 860000 890000 24 64
const {run:base}=require('./pass-outcome-holdout');
const {collect}=require('./two-opponent-conditional-holdout');
const {evaluate}=require('./exact-next-pass-hypergeom');
const policies=['closed-branch-control','min-hand-pips','fast-doubles'];
const avg=xs=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;
function aggregate(rows){
 return {positions:rows.length,byPolicy:Object.fromEntries(policies.map(k=>[k,Object.fromEntries(['win','pips','minus'].map(m=>[m,avg(rows.map(r=>r.byPolicy[k][m]))]))]))};
}
function run(start=860000,end=890000,limit=24,n=64){
 const a=base(start,end,limit,n),positions=collect(start,end,limit).out;
 if(a.rows.length!==positions.length)throw Error('position mismatch');
 const rows=a.rows.map((r,i)=>{
  const p=positions[i];if(p.seed!==r.seed||p.turn!==r.turn)throw Error('replay mismatch');
  const x=evaluate(p),s=p.state;
  return {...r,nextHandSize:s.hands[(s.currentPlayer+1)%3].length,
   sameEnds:x.connector.ends.every((v,j)=>v===x.unrelated.ends[j]),
   sameOpened:JSON.stringify(x.connector.opened)===JSON.stringify(x.unrelated.opened)};
 });
 const informative=rows.filter(r=>r.highPass!=='tie');
 return {schema:'qosa-pass-strata/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
  seedRange:[start,end-1],scannedDeals:a.scannedDeals,positions:rows.length,
  hiddenWorlds:a.hiddenWorlds,continuations:a.continuations,worldSeedFormula:a.worldSeedFormula,
  policies,overall:aggregate(informative),nextHand1:aggregate(informative.filter(r=>r.nextHandSize===1)),
  nextHand2:aggregate(informative.filter(r=>r.nextHandSize===2)),
  sameGeometry:aggregate(informative.filter(r=>r.sameEnds&&r.sameOpened)),
  changedGeometry:aggregate(informative.filter(r=>!(r.sameEnds&&r.sameOpened))),
  passTiesConnectorMinusUnrelated:aggregate(rows.filter(r=>r.highPass==='tie')),
  limitations:'Selected positions, uniform hidden allocations, assumed branch rules, fixed bots; post-action geometry not causal; block winner unassigned.',rows};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(run(+(a[0]||860000),+(a[1]||890000),+(a[2]||24),+(a[3]||64)),null,2));}
module.exports={run};
