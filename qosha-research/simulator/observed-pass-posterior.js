'use strict';
// Pass-conditioned hidden-world posterior. Reject incomplete history rather than guessing.
// Valid only for stock-empty observed passes and verified unchanged opponent hands.
const e=require('./engine'),d=require('./turn-dispatcher'),hw=require('./hidden-world');
const integer=x=>Number.isInteger(x)&&x>=0;
function sameBoard(a,b){
  if(!a||!b||!a.branches||!b.branches)return false;
  return e.SIDES.every(s=>a.branches[s]&&b.branches[s]&&
    a.branches[s].end===b.branches[s].end&&a.branches[s].active===b.branches[s].active);
}
function sameOpened(a,b){
  return a&&b&&a.openedNumbers instanceof Set&&b.openedNumbers instanceof Set&&
    [...a.openedNumbers].sort().join(',')===[...b.openedNumbers].sort().join(',');
}
function validatePass(spec,obs){
  if(!spec||!spec.visibleState||!Array.isArray(spec.hiddenHandSizes))throw Error('complete visible spec required');
  const s=spec.visibleState,n=s.hands.length;
  if(n!==3||spec.hiddenHandSizes.length!==n)throw Error('3-player hand sizes required');
  if(!obs||obs.kind!=='observed-pass'||!obs.evidence||
    obs.evidence.passObserved!==true||obs.evidence.snapshotVerified!==true||
    obs.evidence.fullTurnLogVerified!==true)throw Error('verified observed-pass evidence required');
  if(!integer(obs.playerIndex)||obs.playerIndex>=n||obs.playerIndex===(spec.focalPlayer??0))throw Error('pass must belong to a hidden opponent');
  if(!integer(obs.turn)||!integer(s.turns)||obs.turn>=s.turns)throw Error('pass turn must precede focal decision');
  if(!integer(s.currentPlayer)||s.currentPlayer!==(obs.playerIndex+s.turns-obs.turn)%n)throw Error('turn order mismatch');
  if(obs.stockSizeAtPass!==0||(spec.stockSize??0)!==0||s.stock.length!==0)throw Error('stock must be empty at pass and now');
  if(!integer(obs.handSizeAtPass)||obs.handSizeAtPass!==spec.hiddenHandSizes[obs.playerIndex])throw Error('opponent hand size changed since pass');
  if(!obs.branchState||!obs.openingState||!(obs.openingState.openedNumbers instanceof Set)||
     !e.SIDES.every(x=>obs.branchState.branches&&obs.branchState.branches[x]&&integer(obs.branchState.branches[x].end)))
     throw Error('complete pass-time branch/open snapshot required');
  if(!Array.isArray(obs.eventsSincePass)||obs.eventsSincePass.length!==s.turns-obs.turn-1)throw Error('complete intervening turn log required');
  for(let i=0;i<obs.eventsSincePass.length;i++){
    const ev=obs.eventsSincePass[i],turn=obs.turn+1+i,player=(obs.playerIndex+1+i)%n;
    if(!ev||ev.turn!==turn||ev.playerIndex!==player||ev.drawn!==0||
      !integer(ev.played)||!['pass','play'].includes(ev.type)||
      (ev.type==='pass'&&ev.played!==0)||(ev.type==='play'&&ev.played<1))
      throw Error('invalid intervening turn evidence');
    if(player===obs.playerIndex&&ev.played!==0)throw Error('observed passer played since pass: hand changed');
  }
  if(obs.eventsSincePass.every(ev=>ev.type==='pass')&&
    (!sameBoard(obs.branchState,s.branchState)||!sameOpened(obs.openingState,s.openingState)))
    throw Error('pass snapshot contradicts unchanged board');
  return true;
}
function consistent(world,obs){
  if(world.hands[obs.playerIndex].length!==obs.handSizeAtPass)throw Error('world hand size mismatch');
  return d.actionsForHand(obs.branchState,obs.openingState,world.hands[obs.playerIndex]).length===0;
}
function filterWorlds(spec,observations,worlds){
  if(!Array.isArray(observations)||!observations.length)throw Error('at least one observed pass required');
  if(!Array.isArray(worlds)||!worlds.length)throw Error('nonempty prior worlds required');
  for(const o of observations)validatePass(spec,o);
  const accepted=[],acceptedIndices=[];
  for(let i=0;i<worlds.length;i++)if(observations.every(o=>consistent(worlds[i],o))){accepted.push(worlds[i]);acceptedIndices.push(i);}
  if(!accepted.length)throw Error('zero posterior support: inconsistent history or insufficient worlds');
  return{worlds:accepted,acceptedIndices,proposed:worlds.length,accepted:accepted.length,
    rejected:worlds.length-accepted.length,acceptanceRate:accepted.length/worlds.length,
    observations:observations.length,prior:'uniform hidden allocations',posterior:'rejection-conditioned on verified empty-stock passes'};
}
function samplePosterior(spec,observations,{startSeed=0,count=500}={}){
  if(!integer(startSeed)||!integer(count)||count<1||count>100000)throw Error('invalid deterministic seed/count');
  for(const o of observations)validatePass(spec,o);
  const worlds=Array.from({length:count},(_,i)=>hw.sampleWorld(spec,startSeed+i));
  return{...filterWorlds(spec,observations,worlds),startSeed,count,
    seedFormula:'startSeed + proposalIndex (hidden-world mixSeed)'};
}
module.exports={validatePass,consistent,filterWorlds,samplePosterior};
