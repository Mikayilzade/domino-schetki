'use strict';
// Fixed-visible hidden-world sampler for real-position Monte Carlo.
// Caller MUST provide every known/played tile explicitly; branch ends alone are not tile history.

const e=require('./engine');
const {cloneRoundState}=require('./round-driver');
const {actionKey,evaluateDecisionInWorld,aggregateWorlds}=require('./decision-regret');

function rng(seed){
  let x=(Number(seed)>>>0)||0x9e3779b9;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};
}
function shuffle(xs,seed){
  const a=xs.slice(),r=rng(seed);
  for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}
function allTiles(){const a=[];for(let i=0;i<=6;i++)for(let j=i;j<=6;j++)a.push([i,j]);return a;}
function keys(xs){return xs.map(e.tileKey);}
function assertUnique(xs,label){
  const k=keys(xs); if(new Set(k).size!==k.length)throw new Error('duplicate tile in '+label);
}
function hiddenPool({focalHand,knownTiles}){
  const known=[...focalHand,...knownTiles];
  assertUnique(known,'visible/known set');
  const used=new Set(keys(known));
  return allTiles().filter(t=>!used.has(e.tileKey(t)));
}
function sampleWorld(spec,seed){
  const focal=spec.focalPlayer??0;
  if(!spec.visibleState)throw new Error('visibleState required');
  if(spec.visibleState.currentPlayer!==focal)throw new Error('visibleState currentPlayer must equal focalPlayer');
  if(!Array.isArray(spec.focalHand)||!Array.isArray(spec.knownTiles))throw new Error('focalHand and knownTiles required');
  const visibleFocal=(spec.visibleState.hands&&spec.visibleState.hands[focal])||[];
  if(JSON.stringify(keys(visibleFocal).sort())!==JSON.stringify(keys(spec.focalHand).sort()))throw new Error('visibleState focal hand must equal focalHand');
  if(!Array.isArray(spec.hiddenHandSizes)||spec.hiddenHandSizes.length!==3)throw new Error('hiddenHandSizes[3] required');
  if(spec.hiddenHandSizes[focal]!==spec.focalHand.length)throw new Error('focal size mismatch');
  const pool=shuffle(hiddenPool(spec),seed), need=spec.hiddenHandSizes.reduce((n,x,i)=>n+(i===focal?0:x),0)+(spec.stockSize??0);
  if(pool.length!==need)throw new Error('unknown pool size mismatch: pool='+pool.length+' need='+need);
  let at=0; const hands=[[],[],[]];
  for(let i=0;i<3;i++)hands[i]=i===focal?spec.focalHand.map(t=>t.slice()):pool.slice(at,at+=spec.hiddenHandSizes[i]);
  const stock=pool.slice(at,at+(spec.stockSize??0));
  const state=cloneRoundState(spec.visibleState);
  state.hands=hands; state.stock=stock;
  return state;
}
function candidateKeys(state){
  const d=require('./turn-dispatcher');
  const o=d.turnOptions(state.branchState,state.openingState,state.hands[state.currentPlayer],state.stock);
  return o.phase==='play'?o.actions.map(actionKey).sort():[];
}
function runHiddenWorlds(spec,{count=25,startSeed=0,continuationStrategy='closed-branch-control',maxTurns=200}={}){
  const results=[]; let expected=null;
  for(let i=0;i<count;i++){
    const seed=startSeed+i,world=sampleWorld(spec,seed),ks=candidateKeys(world);
    if(expected===null)expected=ks;
    else if(JSON.stringify(ks)!==JSON.stringify(expected))throw new Error('candidate set changed across hidden worlds');
    results.push(evaluateDecisionInWorld(world,{focalPlayer:spec.focalPlayer??0,continuationStrategy,seed,maxTurns}));
  }
  return {worldCount:count,startSeed,candidateKeys:expected,aggregate:aggregateWorlds(results),results};
}
module.exports={allTiles,hiddenPool,sampleWorld,candidateKeys,runHiddenWorlds};
