'use strict';
// Equal-exact-pass follow-up: distinguish end-number geometry from immediate legal-tile overlap.
// Reproduce: node qosha-research/simulator/equal-pass-reply-overlap.js test
//            node qosha-research/simulator/equal-pass-reply-overlap.js 960000 980000 48 24
const {run:baseRun}=require('./equal-pass-geometry-holdout-v2');
const {collect}=require('./two-opponent-conditional-holdout');
const {hiddenPool}=require('./hidden-world');
const {actionKey}=require('./decision-regret');
const d=require('./turn-dispatcher'),e=require('./engine');
const policies=['closed-branch-control','min-hand-pips','fast-doubles'];
const avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
function setOverlap(a,b){
 const x=new Set(a),y=new Set(b),shared=[...x].filter(k=>y.has(k)).length;
 const union=new Set([...x,...y]).size;
 return{shared,onlyFirst:x.size-shared,onlySecond:y.size-shared,union,jaccard:union?shared/union:1};
}
function effectiveEnds(tr){
 return e.SIDES.filter(side=>tr.branchState.branches[side].active)
 .map(side=>tr.branchState.branches[side].end)
 .filter(n=>tr.openingState.openedNumbers.has(n));
}
function features(p){
 const s=p.state,f=s.currentPlayer,opts=d.turnOptions(s.branchState,s.openingState,s.hands[f],s.stock);
 const pool=hiddenPool({focalHand:s.hands[f],knownTiles:p.known});
 const boards=[p.pair.connector,p.pair.other].map(key=>{
  const a=opts.actions.find(v=>actionKey(v)===key);
  if(!a||a.type!=='single')throw Error('missing legal single');
  const tr=d.applyTurn(s.branchState,s.openingState,s.hands[f],s.stock,a);
  const legal=pool.filter(t=>d.actionsForHand(tr.branchState,tr.openingState,[t]).length).map(e.tileKey);
  return{legal,effectiveEnds:effectiveEnds(tr),allEnds:e.SIDES.map(side=>tr.branchState.branches[side].end)};
 });
 if(boards[0].legal.length!==boards[1].legal.length)throw Error('not an equal-nondegenerate pass control');
 return{legalUnknown:boards[0].legal.length,unknownPool:pool.length,
  legalTileOverlap:setOverlap(boards[0].legal,boards[1].legal),
  effectiveEndNumberOverlap:setOverlap(boards[0].effectiveEnds,boards[1].effectiveEnds),
  distinctEffectiveNumbers:[...new Set(boards[0].effectiveEnds)].length,
  endNumberPairs:boards.map(b=>b.allEnds),effectiveEnds:boards.map(b=>b.effectiveEnds)};
}
function summarize(rows){
 const groups={sameLegalTiles:rows.filter(r=>r.legalTileOverlap.jaccard===1),
  differentLegalTiles:rows.filter(r=>r.legalTileOverlap.jaccard<1),
  highOverlap:rows.filter(r=>r.legalTileOverlap.jaccard>=0.5&&r.legalTileOverlap.jaccard<1),
  lowOverlap:rows.filter(r=>r.legalTileOverlap.jaccard<0.5)};
 const metrics={};
 for(const [name,xs] of Object.entries(groups)){
  metrics[name]={n:xs.length,meanLegalJaccard:avg(xs.map(x=>x.legalTileOverlap.jaccard)),
   meanImmediatePassFlipRate:avg(xs.map(x=>x.observedPassFlipRate)),
   byPolicy:Object.fromEntries(policies.map(p=>[p,{
    finishFirstConnectorMinusUnrelated:avg(xs.map(r=>r.byPolicy[p].win)),
    remainderConnectorMinusUnrelated:avg(xs.map(r=>r.byPolicy[p].pips)),
    minusFinishConnectorMinusUnrelated:avg(xs.map(r=>r.byPolicy[p].minus))}]))};
 }
 return metrics;
}
function run(start=960000,end=980000,limit=48,worlds=24){
 const base=baseRun(start,end,limit,worlds);
 const discovered=collect(start,end,limit);
 if(base.scannedDeals!==discovered.scanned||base.eligiblePositions!==discovered.out.length)throw Error('discovery mismatch');
 const byPosition=new Map(discovered.out.map(p=>[p.seed+':'+p.turn,p]));
 const rows=base.rows.map(r=>{
  const p=byPosition.get(r.seed+':'+r.turn);if(!p)throw Error('position not found');
  const x=features(p);if(x.legalUnknown!==r.legalUnknown)throw Error('legal count mismatch');
  return{...r,...x};
 });
 return{schema:'qosa-equal-pass-reply-overlap/v1',timestampAsiaBaku:new Date(Date.now()+4*3600000).toISOString().slice(0,19)+' +04:00',
  engine:base.engine,rules:base.rules,mode:'3x9',seedRange:base.seedRange,scannedDeals:base.scannedDeals,
  eligiblePositions:base.eligiblePositions,comparedPositions:rows.length,hiddenWorlds:base.hiddenWorlds,continuations:base.continuations,
  discoveryPolicy:base.discoveryPolicy,continuationPolicies:policies,worldSeedFormula:base.worldSeedFormula,
  comparison:'equal exact next-pass, equal pip discard, different post-action four-end geometry; immediate legal tile sets from entire unknown pool',
  summary:summarize(rows),limitations:'Position clusters small and selected, uniform hidden worlds ignore opponent history; fixed bots, branch semantics provisional, block winner unassigned. Legal-tile overlap and geometry are descriptive post-action features, not independently randomized treatments. Equal marginal pass probability does not imply same actual next-player pass in each world.',rows};
}
function test(){
 const a=run(920000,940000,3,2),b=run(920000,940000,3,2);
 if(JSON.stringify(a.rows)!==JSON.stringify(b.rows))throw Error('nondeterministic replay');
 if(a.rows.some(x=>x.legalTileOverlap.jaccard<0||x.legalTileOverlap.jaccard>1))throw Error('invalid overlap');
 return{passed:true,eligible:a.eligiblePositions,compared:a.comparedPositions};
}
if(require.main===module){const args=process.argv.slice(2);console.log(JSON.stringify(args[0]==='test'?test():run(+(args[0]||960000),+(args[1]||980000),+(args[2]||48),+(args[3]||24)),null,2));}
module.exports={setOverlap,effectiveEnds,features,summarize,run,test};
