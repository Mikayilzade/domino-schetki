'use strict';
// Side-permutation-invariant matched holdout. No live scoreboard changes.
const e=require('./engine'),init=require('./initializer'),round=require('./round-driver'),dispatch=require('./turn-dispatcher'),prior=require('./tiebreak-priority-holdout');
const POLICIES=prior.POLICIES,MODES=['legacy','tile-first','canonical-multiset'];
function branchMultiset(s){return e.SIDES.map(k=>{const b=s.branches[k];return (b.active?'1':'0')+':'+b.end;}).sort().join('|');}
function afterKey(action,state){
 let b=state.branchState;
 if(action.type==='single'||action.type==='mixed-finish')b=e.applySinglePlacement(b,action);
 const opened=new Set(state.openingState.openedNumbers);
 for(const n of action.numbers||[])opened.add(n);
 return branchMultiset(b)+'/'+[...opened].sort((a,b)=>a-b).join(',');
}
function canonicalKey(action,state){
 const pre=action.type+':'+(action.numbers||[]).join(',')+':';
 return pre+e.tileKey(action.tile||[0,0])+':'+(action.to??'')+':'+afterKey(action,state);
}
function choose(name,opts,state,mode,ctx={}){
 if(mode==='legacy')return prior.choose(name,opts,ctx,'legacy');
 if(mode==='tile-first')return prior.choose(name,opts,ctx,'tile-first');
 if(mode!=='canonical-multiset')throw Error('bad mode '+mode);
 return [...opts.actions].sort((a,b)=>prior.cmpPrimary(name,a,b)||canonicalKey(a,state).localeCompare(canonicalKey(b,state)))[0];
}
function tileIdentity(a){return a.type+':'+e.tileKey(a.tile||[0,0])+':'+(a.numbers||[]).join(',')+':'+(a.to??'');}
function outcomeKey(s){return s.outcome.kind==='finish'?'finish:'+s.outcome.playerIndex+':'+s.outcome.minus:s.outcome.kind;}
function normalized(s){return JSON.stringify({outcome:s.outcome,hands:s.hands.map(h=>h.map(e.tileKey).sort()),stock:s.stock.map(e.tileKey).sort(),opened:[...s.openingState.openedNumbers].sort(),branches:branchMultiset(s.branchState),turns:s.turns});}
function permutations(a){if(a.length===0)return[[]];return a.flatMap((v,i)=>permutations(a.filter((_,j)=>i!==j)).map(t=>[v,...t]));}
function renameSides(base,p){const s=round.cloneRoundState(base),old=s.branchState.branches;s.branchState.branches=Object.fromEntries(e.SIDES.map((side,i)=>[side,{...old[p[i]]}]));return s;}
function replay(base,rotation,mode,seed,diagnostic=null){
 return round.runRound(base,(opts,state)=>{
  const name=POLICIES[(state.currentPlayer+rotation)%3],ctx={seed,rotation,turns:state.turns,player:state.currentPlayer};
  const chosen=choose(name,opts,state,mode,ctx);
  if(diagnostic){
   const tileFirst=choose(name,opts,state,'tile-first',ctx);
   diagnostic.decisions++;
   if(prior.cmpPrimary(name,chosen,tileFirst)!==0)diagnostic.primaryMismatches++;
   if(tileIdentity(chosen)!==tileIdentity(tileFirst))diagnostic.differentTileOrDestination++;
   if(chosen.side!==tileFirst.side&&tileIdentity(chosen)===tileIdentity(tileFirst))diagnostic.sameTileSideChanges++;
  }
  return chosen;
 },{maxTurns:200});
}
function test({startSeed=858000,count=12}={}){
 const perms=permutations(e.SIDES),diag={decisions:0,primaryMismatches:0,differentTileOrDestination:0,sameTileSideChanges:0};
 let positions=0,permutedContinuations=0;
 for(let seed=startSeed;seed<startSeed+count;seed++){
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(base.kind!=='ready')throw Error('init '+seed);
  for(let rotation=0;rotation<3;rotation++){
   const ref=replay(base,rotation,'canonical-multiset',seed,diag);
   if(ref.outcome.kind==='unresolved')throw Error('unresolved '+seed);
   const expected=normalized(ref);
   for(const p of perms){
    const alt=replay(renameSides(base,p),rotation,'canonical-multiset',seed);
    if(normalized(alt)!==expected)throw Error('side permutation changed result '+seed+'/'+rotation+'/'+p.join(','));
    permutedContinuations++;
   }
   positions++;
  }
 }
 if(diag.primaryMismatches||diag.differentTileOrDestination)throw Error('canonical altered distinct-tile ranking');
 return{passed:true,seedRange:startSeed+'..'+(startSeed+count-1),positions,permutations:perms.length,permutedContinuations,diagnostic:diag};
}
function empty(){return{rounds:0,finishes:0,blocks:0,unresolved:0,turnTotal:0,byStrategy:Object.fromEntries(POLICIES.map(n=>[n,{appearances:0,finishWins:0,finalPips:[],startingDoubles:0,endingDoubles:0,minusWins:{'0':0,'-10':0,'-20':0,'-30':0,'-40':0}}]))};}
function run({startSeed=819000,count=1000}={}){
 const byMode=Object.fromEntries(MODES.map(n=>[n,empty()])),changed={legacyVsCanonical:0,tileFirstVsCanonical:0,tileFirstVsCanonicalBlock:0};
 const diagnostic={decisions:0,primaryMismatches:0,differentTileOrDestination:0,sameTileSideChanges:0};
 for(let seed=startSeed;seed<startSeed+count;seed++){
  const deal=e.dealThreeByNine(seed),base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(base.kind!=='ready')throw Error('init '+seed);
  for(let rotation=0;rotation<3;rotation++){
   const outcomes={};
   for(const mode of MODES){
    const out=replay(base,rotation,mode,seed,mode==='canonical-multiset'?diagnostic:null);
    if(out.outcome.kind==='unresolved')throw Error('unresolved '+seed+'/'+mode);
    const m=byMode[mode];m.rounds++;m.turnTotal+=out.turns;
    if(out.outcome.kind==='finish'){m.finishes++;const n=POLICIES[(out.outcome.playerIndex+rotation)%3],z=m.byStrategy[n];z.finishWins++;z.minusWins[String(out.outcome.minus||0)]++;}
    else if(out.outcome.kind==='block')m.blocks++;
    for(let seat=0;seat<3;seat++){
     const z=m.byStrategy[POLICIES[(seat+rotation)%3]];z.appearances++;
     z.finalPips.push(e.pipSum(out.hands[seat]));
     z.startingDoubles+=deal.hands[seat].filter(t=>t[0]===t[1]).length;
     z.endingDoubles+=out.hands[seat].filter(t=>t[0]===t[1]).length;
    }
    outcomes[mode]=outcomeKey(out);
   }
   if(outcomes.legacy!==outcomes['canonical-multiset'])changed.legacyVsCanonical++;
   if(outcomes['tile-first']!==outcomes['canonical-multiset'])changed.tileFirstVsCanonical++;
   if((outcomes['tile-first']==='block')!==(outcomes['canonical-multiset']==='block'))changed.tileFirstVsCanonicalBlock++;
  }
 }
 if(diagnostic.primaryMismatches||diagnostic.differentTileOrDestination)throw Error('different tile on same state');
 for(const m of Object.values(byMode)){
  m.meanTurns=m.turnTotal/m.rounds;delete m.turnTotal;
  for(const n of POLICIES){
   const z=m.byStrategy[n],p=z.finalPips.sort((a,b)=>a-b),len=p.length;
   z.finishWinRate=z.finishWins/z.appearances;z.meanFinalPips=p.reduce((a,b)=>a+b,0)/len;
   z.medianFinalPips=len%2?p[(len-1)/2]:(p[len/2-1]+p[len/2])/2;
   z.meanStartingDoubles=z.startingDoubles/z.appearances;z.meanEndingDoubles=z.endingDoubles/z.appearances;
   delete z.finalPips;
  }
 }
 return{schema:'qosa-canonical-multiset-holdout/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',seedRange:startSeed+'..'+(startSeed+count-1),deals:count,roundsPerMode:count*3,strategies:POLICIES,modes:MODES,byMode,canonicalPathVsTileFirst:diagnostic,pairedOutcomeChanges:changed};
}
if(require.main===module){const mode=process.argv[2]||'test';console.log(JSON.stringify(mode==='test'?test():run({startSeed:Number(process.argv[3]||819000),count:Number(process.argv[4]||1000)}),null,2));}
module.exports={branchMultiset,afterKey,canonicalKey,choose,normalized,permutations,renameSides,test,run};
