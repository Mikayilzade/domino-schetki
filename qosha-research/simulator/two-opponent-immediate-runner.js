'use strict';
const {collect,mobility}=require('./connector-mobility-runner');
const {sampleWorld}=require('./hidden-world');
const {turnOptions}=require('./turn-dispatcher');
const {actionKey}=require('./decision-regret');
function run(start=260000,end=320000,limit=25,n=30){
 const rows=[];const found=collect(start,end,limit);
 for(const p of found.positions){
  const s=p.state,f=s.currentPlayer;
  const o=turnOptions(s.branchState,s.openingState,s.hands[f],s.stock);
  const by=new Map(o.actions.map(a=>[actionKey(a),a]));
  const a=by.get(p.pair.connector),b=by.get(p.pair.other);
  const spec={focalPlayer:f,focalHand:s.hands[f],knownTiles:p.known,hiddenHandSizes:s.hands.map(h=>h.length),stockSize:s.stock.length,visibleState:s};
  let next=0,third=0;
  for(let j=0;j<n;j++){
   const w=sampleWorld(spec,31000000+1000*p.seed+j);
   next+=mobility(w,b,(f+1)%3).playable-mobility(w,a,(f+1)%3).playable;
   third+=mobility(w,b,(f+2)%3).playable-mobility(w,a,(f+2)%3).playable;
  }
  rows.push({seed:p.seed,next:next/n,third:third/n});
 }
 return{start,end,scanned:found.scanned,worlds:rows.length*n,rows};
}
if(require.main===module)console.log(JSON.stringify(run(...process.argv.slice(2).map(Number))));
module.exports={run};
