'use strict';
// Counterfactual one-step sensitivity ONLY; does not assert the authentic branch-opening rule.
// Reproduce: node qosha-research/simulator/branch-side-sensitivity.js test
//            node qosha-research/simulator/branch-side-sensitivity.js 1599340 1200
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),strat=require('./strategy-runner');
const MIXES=[['random-legal','min-hand-pips','closed-branch-control'],['fast-doubles','moderate-double-hold','closed-branch-control']];
const assert=(v,m)=>{if(!v)throw Error('side sensitivity: '+m);};
const k=a=>a.type+':'+(a.tile?e.tileKey(a.tile):'')+':'+(a.numbers||[]).join(',');
const legalIfOnlySide=(actions,n,side)=>actions.filter(a=>!((a.type==='single'||a.type==='mixed-finish')&&a.from===n&&a.side!==side));
const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
function test(){
 let b=e.createBranchState([1,1]),o=e.createOpeningState([1]);
 b=e.applySinglePlacement(b,{side:'up',tile:[1,5],to:5});
 b=e.applySinglePlacement(b,{side:'left',tile:[1,5],to:5});
 const double=d.actionsForHand(b,o,[[5,5]]).find(a=>a.type==='double-sequence');
 assert(double&&double.numbers.join(',')==='5','double fixture');
 const tr=d.applyTurn(b,o,[[5,5]],[],double);
 const actions=d.actionsForHand(tr.branchState,tr.openingState,[[5,6]]);
 assert(actions.length===2,'global sides fixture');
 for(const side of ['up','left'])assert(legalIfOnlySide(actions,5,side).length===1,'local side fixture');
 const a=run(1599340,6),c=run(1599340,6);
 delete a.timestampAsiaBaku;delete c.timestampAsiaBaku;
 assert(JSON.stringify(a)===JSON.stringify(c)&&a.rounds===36&&a.unresolved===0,'replay');
 return {passed:true,fixture:'two 5-ends; global 2 ordinary placements versus local 1',pilotDeals:6,pilotRounds:36};
}
function run(startSeed=1599340,deals=1200){
 assert(Number.isInteger(startSeed)&&Number.isInteger(deals)&&deals>0&&deals<=30000,'args');
 const z={schema:'qosha-branch-side-one-step-sensitivity/v1',
 timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'}).replace(' ','T')+'+04:00',
 engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0; global number unlock PROVISIONAL',
 startSeed,endSeed:startSeed+deals-1,deals,rounds:0,finishes:0,blocks:0,unresolved:0,
 mixes:MIXES,seatRotations:3,meanTurns:0,minusFinishes:{'0':0,'-10':0,'-20':0,'-30':0,'-40':0},
 totalUnlockEvents:0,multiSideEvents:0,roundsWithMultiSideEvent:0,analyzedNonterminalMultiSideEvents:0,
 nextPlayerGlobalActionTotal:0,localActionTotalMin:0,localActionTotalMax:0,
 eventsWithAnyLocalActionLoss:0,eventsWithAllLocalActionLoss:0,
 eventsWithAnyTileGroupChoiceChange:0,eventsWithAllTileGroupChoiceChange:0,
 eventsWithAnySideChoiceChange:0,eventsWithAnyPassFlip:0,eventsWithAnyMixedFinishLoss:0,
 bySideCount:{'2':0,'3':0,'4':0},examples:[],assumptions:[
 'All comparisons are instantaneous on a GLOBAL-model trajectory, not independent local-model game rollouts.',
 'Counterfactual: a played double unlocks exactly ONE of the matching sides; enumerate every matching side, do not guess which one.',
 'Only the newly opened number is side-restricted; all other already-opened numbers remain global.',
 'The next player is inspected with the same known hand; no unseen-world inference and no 101-match winner.'
 ]};
 let turns=0;
 for(let seed=startSeed;seed<startSeed+deals;seed++){
  const deal=e.dealThreeByNine(seed);
  const base=init.initializeThreePlayerRoundFromDeal({...deal,isFirstRound:false,previousWinnerIndex:seed%3});
  assert(base.kind==='ready','init '+seed);
  for(let mix=0;mix<2;mix++)for(let rotation=0;rotation<3;rotation++){
   const policies=[0,1,2].map(p=>MIXES[mix][(p+rotation)%3]);
   let s=r.cloneRoundState(base),hasMulti=false;
   for(let i=0;i<200&&!s.outcome;i++){
    const before=s,p=before.currentPlayer,opts=d.turnOptions(s.branchState,s.openingState,s.hands[p],s.stock);
    const action=opts.phase==='play'?strat.chooseBy(policies[p],opts,{seed,rotation,turns:s.turns,player:p,salt:mix+1}):null;
    let branchBeforeOpen=before.branchState;
    if(action?.type==='mixed-finish')branchBeforeOpen=e.applySinglePlacement(branchBeforeOpen,action);
    const events=(action?.numbers||[]).map(n=>({n,sides:e.sidesEndingIn(branchBeforeOpen,n)}));
    z.totalUnlockEvents+=events.length;
    s=r.stepRound(before,()=>action);
    for(const ev of events){
     assert(ev.sides.length>=1,'opening with no matching side');
     if(ev.sides.length<2)continue;
     hasMulti=true;z.multiSideEvents++;z.bySideCount[String(ev.sides.length)]++;
     if(s.outcome)continue;
     z.analyzedNonterminalMultiSideEvents++;
     const next=s.currentPlayer,hand=s.hands[next],policy=policies[next];
     const all=d.actionsForHand(s.branchState,s.openingState,hand);
     const variants=ev.sides.map(side=>({side,actions:legalIfOnlySide(all,ev.n,side)}));
     const lens=variants.map(v=>v.actions.length);
     z.nextPlayerGlobalActionTotal+=all.length;
     z.localActionTotalMin+=Math.min(...lens);z.localActionTotalMax+=Math.max(...lens);
     if(lens.some(n=>n<all.length))z.eventsWithAnyLocalActionLoss++;
     if(lens.every(n=>n<all.length))z.eventsWithAllLocalActionLoss++;
     if(all.length&&lens.some(n=>n===0))z.eventsWithAnyPassFlip++;
     const gm=all.filter(a=>a.type==='mixed-finish').length;
     if(gm&&variants.some(v=>v.actions.filter(a=>a.type==='mixed-finish').length<gm))z.eventsWithAnyMixedFinishLoss++;
     if(all.length&&policy!=='random-legal'){
      const globalChoice=strat.chooseBy(policy,{actions:all,hand},{seed,rotation,turns:s.turns,player:next,salt:mix+1});
      const choices=variants.map(v=>v.actions.length?strat.chooseBy(policy,{actions:v.actions,hand},{seed,rotation,turns:s.turns,player:next,salt:mix+1}):null);
      if(choices.some(c=>!c||k(c)!==k(globalChoice)))z.eventsWithAnyTileGroupChoiceChange++;
      if(choices.some(c=>!c||c.side!==globalChoice.side||k(c)!==k(globalChoice)))z.eventsWithAnySideChoiceChange++;
     }
     if(z.examples.length<8&&lens.some(n=>n<all.length))z.examples.push({seed,mix,rotation,turn:before.turns,number:ev.n,sides:ev.sides,nextPlayerPolicy:policy,globalActions:all.length,localActionCounts:lens});
    }
   }
   assert(s.outcome&&s.outcome.kind!=='unresolved','unresolved '+seed);
   z.rounds++;turns+=s.turns;if(hasMulti)z.roundsWithMultiSideEvent++;
   if(s.outcome.kind==='finish'){z.finishes++;z.minusFinishes[String(s.outcome.minus)]++;}
   else z.blocks++;
  }
 }
 z.meanTurns=turns/z.rounds;z.blockRate=z.blocks/z.rounds;
 z.multiSideRoundRate=z.roundsWithMultiSideEvent/z.rounds;
 z.meanGlobalActionsAtAnalyzedEvent=z.nextPlayerGlobalActionTotal/z.analyzedNonterminalMultiSideEvents;
 z.meanLocalActionsMin=z.localActionTotalMin/z.analyzedNonterminalMultiSideEvents;
 z.meanLocalActionsMax=z.localActionTotalMax/z.analyzedNonterminalMultiSideEvents;
 return z;
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1599340),+(a[1]||1200)),null,2));}
module.exports={test,run,legalIfOnlySide,MIXES};
