'use strict';
// Exact next-pass holdout calibration, 3x9. Run: node qosha-research/simulator/pass-calibration-20261017.js
const {collect}=require('./two-opponent-conditional-holdout');
const {evaluate}=require('./exact-next-pass-hypergeom');
const {sampleWorld}=require('./hidden-world');
const {actionKey}=require('./decision-regret');
const d=require('./turn-dispatcher');
function run(start=780000,end=800000,limit=30,n=128){
 const f=collect(start,end,limit),rows=[];
 for(const p of f.out){
  const s=p.state,me=s.currentPlayer,opp=(me+1)%3;
  if(s.stock.length)throw Error('nonempty stock');
  const opts=d.turnOptions(s.branchState,s.openingState,s.hands[me],s.stock);
  const boards=[p.pair.connector,p.pair.other].map(key=>{
   const a=opts.actions.find(x=>actionKey(x)===key);
   if(!a||a.type!=='single')throw Error('missing legal move');
   return d.applyTurn(s.branchState,s.openingState,s.hands[me],s.stock,a);
  });
  const spec={focalPlayer:me,focalHand:s.hands[me],knownTiles:p.known,
   hiddenHandSizes:s.hands.map(h=>h.length),stockSize:0,visibleState:s};
  const pred=evaluate(p),count=[0,0];
  for(let j=0;j<n;j++){
   const w=sampleWorld(spec,(1700000000+Math.imul(p.seed,101)+j)>>>0);
   boards.forEach((b,i)=>{if(!d.actionsForHand(b.branchState,b.openingState,w.hands[opp]).length)count[i]++;});
  }
  const exact=[pred.connector.pass,pred.unrelated.pass],observed=count.map(v=>v/n);
  rows.push({seed:p.seed,turn:p.turn,exact,observed,deltaError:(observed[0]-observed[1])-(exact[0]-exact[1])});
 }
 const mean=a=>a.reduce((x,y)=>x+y,0)/a.length,errors=rows.map(r=>r.deltaError);
 return{engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',start,end,scanned:f.scanned,
  positions:rows.length,hiddenWorldDraws:rows.length*n,worldsPerPosition:n,
  meanExactDelta:mean(rows.map(r=>r.exact[0]-r.exact[1])),
  meanObservedDelta:mean(rows.map(r=>r.observed[0]-r.observed[1])),
  meanError:mean(errors),meanAbsoluteError:mean(errors.map(Math.abs)),rows};
}
if(require.main===module)console.log(JSON.stringify(run(+(process.argv[2]||780000),+(process.argv[3]||800000),+(process.argv[4]||30),+(process.argv[5]||128)),null,2));
module.exports={run};
