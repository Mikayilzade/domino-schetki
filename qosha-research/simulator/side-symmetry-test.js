'use strict';
// Regression: physical side labels must not change outcomes for the same tile
// placed on equivalent ends under an opt-in side-free deterministic tie-break.
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),str=require('./strategy-runner');
const POLICIES=['closed-branch-control','min-hand-pips','fast-doubles'];
function canonicalResult(s){return JSON.stringify({
  outcome:s.outcome,hands:s.hands.map(h=>h.map(e.tileKey).sort()),
  stock:s.stock.map(e.tileKey).sort(),
  branches:e.SIDES.map(side=>s.branchState.branches[side]).map(b=>String(b.active)+':'+b.end).sort(),
  opened:[...s.openingState.openedNumbers].sort(),turns:s.turns
});}
function equivalentPair(actions){
 for(let i=0;i<actions.length;i++)for(let j=i+1;j<actions.length;j++){
  const a=actions[i],b=actions[j];
  if(a.type==='single'&&b.type==='single'&&e.tileKey(a.tile)===e.tileKey(b.tile)&&
   a.from===b.from&&a.to===b.to&&a.side!==b.side)return[a,b];
 }return null;
}
function selfTest({startSeed=840000,count=100}={}){
 let positions=0,legacyDifferences=0,sideFreeFailures=0,forcedContinuations=0;
 for(let seed=startSeed;seed<startSeed+count;seed++){
  let state=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(state.kind!=='ready')throw Error('unexpected initialization '+seed);
  for(let turn=0;turn<100&&!state.outcome;turn++){
   const opts=d.turnOptions(state.branchState,state.openingState,state.hands[state.currentPlayer],state.stock);
   const pair=equivalentPair(opts.actions);
   if(pair){
    positions++;
    for(const policy of POLICIES)for(const sideFree of [false,true]){
     const results=pair.map(action=>{
      let s=r.stepRound(state,()=>action);
      if(!s.outcome)s=r.runRound(s,(o,st)=>str.chooseBy(policy,o,{sideFree,seed,turns:st.turns,player:st.currentPlayer}));
      if(s.outcome.kind==='unresolved')throw Error('unresolved '+seed);
      forcedContinuations++;return canonicalResult(s);
     });
     if(results[0]!==results[1]){if(sideFree)sideFreeFailures++;else legacyDifferences++;}
    }break;
   }
   state=r.stepRound(state,(o,st)=>str.chooseBy('closed-branch-control',o,{seed,turns:st.turns,player:st.currentPlayer}));
  }
 }
 if(positions!==count)throw Error('expected one symmetry fixture per seed, got '+positions);
 if(sideFreeFailures)throw Error('side-free symmetry violations '+sideFreeFailures);
 if(!legacyDifferences)throw Error('fixture did not exercise legacy side-label artifact');
 return{passed:true,seedRange:startSeed+'..'+(startSeed+count-1),positions,policies:POLICIES,
  forcedContinuations,legacyDifferences,sideFreeFailures};
}
if(require.main===module)console.log(JSON.stringify(selfTest(),null,2));
module.exports={equivalentPair,canonicalResult,selfTest};
