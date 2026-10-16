'use strict';
// Reproduce 2026-10-16 min-pips discovery holdouts; 3x9 only.
const e=require('./engine'),i=require('./initializer'),r=require('./round-driver');
const {chooseBy}=require('./strategy-runner');
const {eligibleGroups}=require('./pattern-paired-runner');
const {sampleWorld}=require('./hidden-world');
const {force}=require('./connector-equal-pip-runner');
const policies=['closed-branch-control','min-hand-pips','fast-doubles'];
const metrics=['finish','remainder','minus','block','turns','nextPass','nextLegal'];
const avg=a=>a.reduce((s,x)=>s+x,0)/a.length;
function run(start=300000,end=300500,limit=30,worlds=30,base=96000000){
 const rows=[];let scanned=0,flips=0;
 for(let seed=start;seed<end&&rows.length<limit;seed++){
  scanned++;let s=i.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(s.kind!=='ready')continue;
  while(!s.outcome&&s.turns<100){
   const g=eligibleGroups(s);
   if(g.length){
    const x=g[0],open=[...x.spend].sort()[0],keep=[...x.preserve].sort()[0];
    const hidden=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));
    const known=e.createDoubleSixDeck().filter(t=>!hidden.has(e.tileKey(t)));
    const spec={focalPlayer:s.currentPlayer,focalHand:s.hands[s.currentPlayer],knownTiles:known,
     hiddenHandSizes:s.hands.map(h=>h.length),stockSize:s.stock.length,visibleState:s};
    const delta=Object.fromEntries(policies.map(p=>[p,[]]));
    for(let j=0;j<worlds;j++){
     const wseed=base+1000*seed+j,w=sampleWorld(spec,wseed);
     for(const p of policies){
      const a=force(w,keep,p,wseed),b=force(w,open,p,wseed);
      if(p===policies[0]&&a.nextPass!==b.nextPass)flips++;
      delta[p].push(Object.fromEntries(metrics.map(k=>[k,a[k]-b[k]])));
     }
    }
    rows.push({seed,turn:s.turns,x:x.number,open,keep,worldSeedStart:base+1000*seed,
     delta:Object.fromEntries(policies.map(p=>[p,Object.fromEntries(metrics.map(k=>[k,avg(delta[p].map(v=>v[k]))]))]))});
    break;
   }
   s=r.stepRound(s,(o,st)=>chooseBy('min-hand-pips',o,{seed,turns:st.turns,player:st.currentPlayer}));
  }
 }
 return {engine:'qosa-research-0.5.3',rules:'qosa-1.0.0 provisional',start,end,limit,worlds,base,
  scanned,positions:rows.length,hiddenWorlds:rows.length*worlds,
  candidateContinuations:rows.length*worlds*6,passFlips:flips,
  selectedSeeds:rows.map(x=>x.seed),
  aggregate:Object.fromEntries(policies.map(p=>[p,Object.fromEntries(metrics.map(k=>[k,avg(rows.map(v=>v.delta[p][k]))]))])),
  rows,limitations:'first eligible; provisional branch; bots; hidden worlds not conditioned on move history'};
}
if(require.main===module){
 const a=process.argv.slice(2).map(Number);
 console.log(JSON.stringify(run(...a),null,2));
}
module.exports={run};
