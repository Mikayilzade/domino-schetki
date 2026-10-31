'use strict';
// 2026-10-31 05:50 Asia/Baku. Exact reachable 3x9 opening sensitivity.
// Reproduce: node qosha-research/simulator/reachable-opening-hand-sensitivity.js
// Recovered qosa-1.0.0; global-ever-open branch semantics PROVISIONAL.
const e=require('./engine'),d=require('./turn-dispatcher');
const check=(x,m)=>{if(!x)throw Error(m);};
const key=e.tileKey, played=[[1,1],[1,2]], stock=[1,2];
const core=[[0,1],[1,3],[1,4],[1,5],[1,6],[2,2]];
const variants=[
 ['baseline',[[0,2],[2,3]],715,55],
 ['zero-and-bridge',[[0,0],[2,3]],715,55],
 ['three-four-bridge',[[2,3],[3,4]],2002,220],
 ['four-rich',[[0,4],[2,4]],220,715],
 ['three-rich',[[0,3],[2,3]],2002,55],
 ['zero-pair',[[0,0],[0,2]],220,55]
];
function choose(n,k){let v=1;for(let i=1;i<=k;i++)v=v*(n-k+i)/i;return Math.round(v);}
function popcount(n){let c=0;while(n){n&=n-1;c++;}return c;}
function hasOrdinary(hand,n){return hand.some(t=>t[0]!==t[1]&&(t[0]===n||t[1]===n));}
function census(name,extras,expectedA,expectedB){
 const focal=[...core,...extras], initial=[[1,1],...focal];
 check(initial.length===9&&focal.length===8,'3x9 starter chronology');
 check(!initial.some(t=>key(t)===key(stock)),'draw must be sole separate stock');
 const known=new Set([...played,...focal].map(key));
 check(known.size===10,'ten distinct public/focal tiles');
 const unknown=e.createDoubleSixDeck().filter(t=>!known.has(key(t)));
 check(unknown.length===18&&unknown.some(t=>key(t)==='3-3'),'hidden count');
 const pool=unknown.filter(t=>key(t)!=='3-3');
 check(pool.length===17&&pool.some(t=>key(t)==='4-4'),'known seat1 3-3, unknown 4-4');
 const branch=e.applySinglePlacement(e.createBranchState([1,1]),{tile:stock,side:'up',to:2});
 const opened=e.createOpeningState([1]);
 const actions=d.actionsForHand(branch,opened,focal);
 const a=actions.find(x=>x.type==='single'&&key(x.tile)==='1-3'&&x.side==='left');
 const z=actions.find(x=>x.type==='single'&&key(x.tile)==='1-4'&&x.side==='left');
 check(a&&z,'paired candidate actions must both be legal');
 const branches=[e.applySinglePlacement(branch,a),e.applySinglePlacement(branch,z)];
 const s={worlds:0,seat1PassA:0,seat1PassB:0,seat2PassA:0,seat2PassB:0,
  pairedSeat2:{Aonly:0,Bonly:0,both:0,neither:0},engineWorldChecks:0};
 for(let mask=0;mask<2**17;mask++){
  if(popcount(mask)!==8)continue;
  const h1=[[3,3]],h2=[];
  for(let i=0;i<17;i++)(mask&(1<<i)?h1:h2).push(pool[i]);
  check(h1.length===9&&h2.length===9,'opponent capacities');
  const has44=h1.some(t=>key(t)==='4-4');
  // Independent exact oracle: all unplayed 1-X connectors and 2-2 are
  // in focal hand. After A seat1 must open 3-3; after B seat1 can only
  // open 4-4 (or pass). Seat2 ordinary access is then 3-X / 4-X.
  const p1a=false,p1b=!has44;
  const p2a=!hasOrdinary(h2,3);
  const p2b=has44&&!hasOrdinary(h2,4);
  s.seat1PassA+=+p1a;s.seat1PassB+=+p1b;
  s.seat2PassA+=+p2a;s.seat2PassB+=+p2b;
  s.pairedSeat2[p2a?(p2b?'both':'Aonly'):(p2b?'Bonly':'neither')]++;
  // Cross-check the independent oracle against the real research dispatcher
  // on a deterministic 1/37 subset of *every* 24,310-world cohort.
  if(s.worlds%37===0){
   check(new Set([...played,...focal,...h1,...h2].map(key)).size===28,'28-tile integrity');
   check(d.turnOptions(branch,opened,h1,[]).phase==='pass','seat1 forced opening pass');
   check(d.turnOptions(branch,opened,h2,[]).phase==='pass','seat2 forced opening pass');
   for(let j=0;j<2;j++){
    const replies=d.actionsForHand(branches[j],opened,h1);
    check(replies.every(x=>x.type==='double-sequence'&&x.numbers.length===1),'seat1 only one double');
    const r=d.applyTurn(branches[j],opened,h1,[],replies.length?replies[0]:null);
    const second=d.actionsForHand(r.branchState,r.openingState,h2);
    check(r.passed===(j===0?p1a:p1b),'seat1 pass oracle vs dispatcher');
    check((second.length===0)===(j===0?p2a:p2b),'seat2 pass oracle vs dispatcher');
   }
   s.engineWorldChecks++;
  }
  s.worlds++;
 }
 check(s.worlds===choose(17,8)&&s.worlds===24310,'exact conditional worlds');
 check(s.seat1PassA===0&&s.seat1PassB===12870,'seat1 invariant across hands');
 check(s.seat2PassA===expectedA&&s.seat2PassB===expectedB,'seat2 exact expected counts '+name);
 check(Object.values(s.pairedSeat2).reduce((a,b)=>a+b,0)===s.worlds,'paired categories');
 return {name,extraFocalTiles:extras.map(key),focalHand:focal.map(key),stats:s};
}
function run(){
 const rows=variants.map(v=>census(...v));
 check(rows[0].stats.seat2PassA>rows[0].stats.seat2PassB,'baseline direction');
 check(rows[3].stats.seat2PassA<rows[3].stats.seat2PassB,'four-rich reversal');
 return {schema:'qosha-reachable-opening-hand-sensitivity/v1',
  timestampAsiaBaku:'2026-10-31 05:50 +04',engine:'qosa-research-0.5.3 + dispatcher cross-check',
  rules:'recovered qosa-1.0.0 3x9; PROVISIONAL global-ever-open',
  newDeals:0,newSeededWorlds:0,newFullRounds:0,newForcedContinuations:0,
  exactConditionalAssignments:rows.reduce((n,r)=>n+r.stats.worlds,0),
  crossCheckedWorlds:rows.reduce((n,r)=>n+r.stats.engineWorldChecks,0),
  seeds:null,candidates:['1-3 left','1-4 left'],
  policy:'seat1 forced unique double or pass; seat2 pass measured before choosing action',
  rows,limitations:'Six deliberately constructed chronological starter hands; conditional known seat1 3-3, uniform compatible allocations; cohorts overlap and are NOT independent random samples. Physical late-arrival branch/tie scoring unresolved. No first-place/minus/regret claim.'};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run,census};