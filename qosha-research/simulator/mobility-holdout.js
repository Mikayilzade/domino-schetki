'use strict';
// Reproduce the 2026-10-11 independent B/C mobility holdout.
// node qosha-research/simulator/mobility-holdout.js
const t=require('./triple-choice-control-runner');
const x=require('./exact-late-double-runner');
const d=require('./turn-dispatcher');
const e=require('./engine');
const {actionKey}=require('./decision-regret');
const mean=a=>a.reduce((s,v)=>s+v,0)/a.length;
function mobility(p){
 const opts=d.turnOptions(p.state.branchState,p.state.openingState,p.state.hands[p.focal],p.state.stock);
 const map=new Map(opts.actions.map(a=>[actionKey(a),a]));
 const groups={connector:p.group.keep,unrelated:p.group.unrelated,open:p.group.open};
 return x.exactWorlds(p).map(w=>{
  const scores={};
  for(const [group,keys] of Object.entries(groups))scores[group]=mean(keys.map(k=>{
   const a=map.get(k),tr=d.applyTurn(w.branchState,w.openingState,w.hands[p.focal],w.stock,a);
   const o=d.turnOptions(tr.branchState,tr.openingState,w.hands[p.next],tr.stock);
   return new Set(o.actions.flatMap(z=>(z.tiles||[z.tile].filter(Boolean)).map(e.tileKey))).size;
  }));
  return scores.connector-scores.unrelated;
 }).reduce((s,v)=>s+v,0)/x.exactWorlds(p).length;
}
function run(){
 const a=t.collect(93000,95000,25,'min-hand-pips');
 const b=t.collect(95000,97000,25,'closed-branch-control');
 const rows=[...a.positions,...b.positions].map(p=>{
  const r=t.analyze(p),c=r.contrasts;
  const opts=d.turnOptions(p.state.branchState,p.state.openingState,p.state.hands[p.focal],p.state.stock);
  const acts=new Map(opts.actions.map(z=>[actionKey(z),z]));
  const pip=ks=>mean(ks.map(k=>e.pipSum([acts.get(k).tile])));
  return{seed:p.seed,allocations:r.exactAllocations,deltaMobility:mobility(p),
   deltaPipsPlayed:pip(p.group.keep)-pip(p.group.unrelated),
   deltaFinish:Object.fromEntries(Object.keys(c).map(k=>[k,c[k].connectorMinusUnrelated.finish]))};
 });
 return{engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',seeds:'93000..96999',
  positions:rows.length,exactAllocations:rows.reduce((s,r)=>s+r.allocations,0),rows};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={mobility,run};
