'use strict';
// Reproduce: node qosha-research/simulator/late-double-connector-strata.js test
// node qosha-research/simulator/late-double-connector-strata.js 1071000 1800 65 40
const e=require('./engine'),d=require('./turn-dispatcher'),init=require('./initializer');
const late=require('./pass-pip-late-holdout'),study=require('./pass-pip-decision-strata');
const {actionKey}=require('./decision-regret');
const policies=['closed-branch-control','moderate-double-hold'];
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
function ci(a){if(a.length<2)return null;const m=mean(a);const se=Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length*(a.length-1)));return[m-1.96*se,m+1.96*se];}
function characterize(c){
 const s=c.state,o=d.turnOptions(s.branchState,s.openingState,s.hands[c.seat],s.stock);
 const pa=o.actions.find(a=>actionKey(a)===c.pass.key),ha=o.actions.find(a=>actionKey(a)===c.hybrid.key);
 if(!pa||!ha)throw Error('missing candidate');
 const kind=a=>a.type==='double-sequence'?'double':a.type==='mixed-finish'?'mixed':'single';
 const ptiles=pa.tiles||[pa.tile],htiles=ha.tiles||[ha.tile];
 const spent=htiles.find(t=>t&&t[0]===t[1]&&!ptiles.some(u=>u&&e.tileKey(u)===e.tileKey(t)));
 let connector=null,ends=null,doubleNumber=null;
 if(spent){
  doubleNumber=spent[0];
  const after=d.applyTurn(s.branchState,s.openingState,s.hands[c.seat],s.stock,pa);
  if(!after.hand.some(t=>e.tileKey(t)===e.tileKey(spent)))throw Error('retention mismatch');
  connector=after.hand.some(t=>t[0]!==t[1]&&t.includes(doubleNumber));
  ends=e.sidesEndingIn(s.branchState,doubleNumber).length;
 }
 return{transition:kind(pa)+'-to-'+kind(ha),doubleNumber,connectorAfterPass:connector,accessibleEnds:ends,pipGap:c.hybrid.pips-c.pass.pips,handSize:c.handSize};
}
function groups(rows,fn){
 const g={};for(const x of rows)(g[fn(x)]||(g[fn(x)]=[])).push(x);
 return Object.fromEntries(Object.entries(g).map(([k,xs])=>[k,{n:xs.length,
  metrics:Object.fromEntries(policies.map(p=>[p,Object.fromEntries(['first','pips','minus','block','turns'].map(m=>{
   const a=xs.map(x=>x.byPolicy[p][m]);return[m,{mean:mean(a),ci95:ci(a)}];
  }))]))}]));
}
function run(start=1071000,scan=1800,limit=65,worlds=40){
 if(![start,scan,limit,worlds].every(Number.isInteger)||scan<1||limit<1||worlds<1)throw Error('invalid args');
 const rows=[];let scanned=0;
 for(let seed=start;seed<start+scan&&rows.length<limit;seed++){
  scanned++;const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(base.kind!=='ready')throw Error('initializer');
  let best=null;
  for(let seat=0;seat<3;seat++){
   const c=late.findLate(base,seat,seed);
   if(c&&(!best||c.handSize<best.handSize||(c.handSize===best.handSize&&c.turn<best.turn)))best=c;
  }
  if(best)rows.push({...study.evaluate(best,worlds),...characterize(best)});
 }
 return{schema:'qosa-late-double-connector-strata/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
  timestampAsiaBaku:'2026-10-18 13:53 +04',mode:'3x9 later-round',
  seedScanRequested:[start,start+scan-1],seedScanActual:[start,start+scanned-1],
  scannedDeals:scanned,selectedPositions:rows.length,selectedSeeds:rows.map(x=>x.seed),
  worldsPerPosition:worlds,hiddenAllocations:rows.length*worlds,
  forcedContinuations:rows.length*worlds*4,newFullStrategyRounds:0,
  strategies:['public-next-pass','pass-pip-0.01'],continuationPolicies:policies,
  limitations:'uniform hidden worlds ignore history; provisional branch semantics; block winner unassigned; selected disagreements; observational connector strata not equal-pip matched; exploratory uncorrected intervals',
  summary:{all:groups(rows,()=> 'all'),transition:groups(rows,x=>x.transition),
   connector:groups(rows,x=>x.doubleNumber===null?'no-distinct-double-spent':x.connectorAfterPass?'connector-retained':'no-connector-retained'),
   accessibleEnds:groups(rows,x=>x.doubleNumber===null?'no-distinct-double-spent':String(x.accessibleEnds)),
   handSize:groups(rows,x=>String(x.handSize))},positions:rows};
}
function test(){const a=run(1071000,25,2,2),b=run(1071000,25,2,2);
 if(JSON.stringify(a)!==JSON.stringify(b)||!a.selectedPositions||a.forcedContinuations!==a.selectedPositions*8)throw Error('replay');return{passed:true,positions:a.selectedPositions};}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1071000),+(a[1]||1800),+(a[2]||65),+(a[3]||40)),null,2));}
module.exports={run,test,characterize,groups};
