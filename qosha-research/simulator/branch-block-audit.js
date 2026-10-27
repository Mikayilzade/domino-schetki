'use strict';
// Structural audit under PROVISIONAL global number-lock; not authentic rules validation.
// node qosha-research/simulator/branch-block-audit.js test
// node qosha-research/simulator/branch-block-audit.js 1596940 2400
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),strat=require('./strategy-runner');
const MIXES=[['random-legal','min-hand-pips','closed-branch-control'],['fast-doubles','moderate-double-hold','closed-branch-control']];
const ok=(v,m)=>{if(!v)throw Error('branch-block-audit: '+m);};
const avg=a=>a.reduce((s,x)=>s+x,0)/a.length;
const med=a=>{const s=[...a].sort((x,y)=>x-y),n=s.length;return n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2;};
const doubles=h=>h.filter(t=>t[0]===t[1]).length;
const opened=s=>[...s.openedNumbers].sort().join(',');
function conserved(s,played,seed){
 const keys=[...s.hands.flat(),...s.stock,...played].map(e.tileKey);
 ok(keys.length===28&&new Set(keys).size===28&&e.createDoubleSixDeck().every(t=>keys.includes(e.tileKey(t))),'tile conservation '+seed);
}
function test(){
 let b=e.createBranchState([1,1]),o=e.createOpeningState([1]);
 b=e.applySinglePlacement(b,{side:'up',tile:[1,5],to:5});
 b=e.applySinglePlacement(b,{side:'left',tile:[1,5],to:5});
 const a=d.actionsForHand(b,o,[[5,5]]).find(x=>x.type==='double-sequence');
 ok(a&&e.sidesEndingIn(b,5).length===2,'two-side exposure');
 const tr=d.applyTurn(b,o,[[5,5]],[],a);
 ok(d.actionsForHand(tr.branchState,tr.openingState,[[5,6]]).filter(x=>x.type==='single').length===2,'global unlocking assumption');
 const block=d.roundOutcome({hands:[[[0,0]],[[1,1]],[[2,2]]],stock:[],consecutivePasses:3,lastPlayerIndex:2,lastTurnResult:{passed:true},players:3});
 ok(block.kind==='block'&&block.playerIndex===null&&block.remainders.join(',')==='0,2,4','no inferred block winner');
 const x=run(1596940,8),y=run(1596940,8);
 delete x.timestampAsiaBaku;delete y.timestampAsiaBaku;
 ok(JSON.stringify(x)===JSON.stringify(y)&&x.rounds===48&&x.unresolved===0,'deterministic pilot');
 return{passed:true,pilotDeals:8,pilotRounds:48,scope:'provisional global unlock and unresolved block winner'};
}
function run(seedStart=1596940,deals=2400){
 ok(Number.isInteger(seedStart)&&Number.isInteger(deals)&&deals>=1&&deals<=50000,'args');
 const res={schema:'qosha-branch-block-structural-audit/v1',
 timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'}).replace(' ','T')+'+04:00',
 engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0; global number-lock PROVISIONAL',
 seedStart,seedEnd:seedStart+deals-1,deals,seatRotations:3,mixes:MIXES,rounds:0,finishes:0,blocks:0,unresolved:0,
 turnTotal:0,tileChecks:0,legalTurnChecks:0,branchUnlockEvents:0,multiSideUnlockEvents:0,roundsWithMultiSideUnlock:0,
 turnsWithLockedOrdinaryCandidate:0,lockedOrdinaryTileCandidates:0,decisionTurns:0,
 minusFinishes:{'0':0,'-10':0,'-20':0,'-30':0,'-40':0},
 blockUniqueMinimum:0,blockTiedMinimum:0,blockMinimumZero:0,byStrategy:{},failures:[],
 assumptions:'Global number unlock and all four active sides PROVISIONAL; block winner unknown; later-round previousWinnerIndex=seed%3; initial 1-1 and follow-up already placed.',
 findingScope:'Structural consistency and ambiguity exposure only, NOT an authentic rule validation or human tactic.'};
 for(const name of new Set(MIXES.flat()))res.byStrategy[name]={appearances:0,finishFirst:0,pips:[],startingDoubles:0,endingDoubles:0};
 for(let seed=seedStart;seed<seedStart+deals;seed++){
  const deal=e.dealThreeByNine(seed);
  const base=init.initializeThreePlayerRoundFromDeal({...deal,isFirstRound:false,previousWinnerIndex:seed%3});
  ok(base.kind==='ready','init '+seed);
  for(let mix=0;mix<2;mix++)for(let rotation=0;rotation<3;rotation++){
   const policies=[0,1,2].map(p=>MIXES[mix][(p+rotation)%3]);
   let s=r.cloneRoundState(base),multi=false;
   const played=[[1,1],...(base.openingFollowup?[base.openingFollowup.tile]:[])];
   conserved(s,played,seed);res.tileChecks++;
   for(let i=0;i<200&&!s.outcome;i++){
    const before=s,p=before.currentPlayer,opts=d.turnOptions(s.branchState,s.openingState,s.hands[p],s.stock);
    const action=opts.phase==='play'?strat.chooseBy(policies[p],opts,{seed,rotation,turns:s.turns,player:p,salt:mix+1}):null;
    if(opts.phase==='play'&&opts.actions.length>1)res.decisionTurns++;
    let locked=false;
    for(const tile of s.hands[p])if(tile[0]!==tile[1]&&e.legalSinglePlacements(s.branchState,tile).length&&!d.openedSinglePlacements(s.branchState,s.openingState,tile).length){
     locked=true;res.lockedOrdinaryTileCandidates++;
    }
    if(locked)res.turnsWithLockedOrdinaryCandidate++;
    let b=s.branchState;
    if(action?.type==='mixed-finish')b=e.applySinglePlacement(b,action);
    for(const n of action?.numbers||[]){
     const sides=e.sidesEndingIn(b,n).length;
     ok(sides>=1&&!s.openingState.openedNumbers.has(n),'illegal opening '+seed);
     res.branchUnlockEvents++;if(sides>=2){res.multiSideUnlockEvents++;multi=true;}
    }
    s=r.stepRound(before,()=>action);
    ok(s.turns===before.turns+1&&s.stock.length===before.stock.length,'turn/stock '+seed);
    const expected=action&&action.type!=='double-sequence'?e.applySinglePlacement(before.branchState,action):before.branchState;
    ok(JSON.stringify(s.branchState)===JSON.stringify(expected),'branch '+seed);
    const os=e.cloneOpeningState(before.openingState);
    for(const n of action?.numbers||[])os.openedNumbers.add(n);
    ok(opened(s.openingState)===opened(os),'opened numbers '+seed);
    ok(s.consecutivePasses===(action?0:before.consecutivePasses+1),'passes '+seed);
    ok(action?opts.phase==='play':opts.phase==='pass'&&opts.actions.length===0,'play/pass '+seed);
    played.push(...(action?(action.type==='single'?[action.tile]:action.tiles):[]));
    conserved(s,played,seed);res.tileChecks++;res.legalTurnChecks++;
    if(s.outcome){
     ok(s.outcome.remainders.join(',')===s.hands.map(e.pipSum).join(','),'remainders '+seed);
     if(s.outcome.kind==='finish'){
      const fd=action?.type==='double-sequence'?action.tiles:action?.type==='mixed-finish'?action.finishDoubles:[];
      ok(s.hands[p].length===0&&s.outcome.playerIndex===p&&s.outcome.minus===e.finishMinus(fd),'finish '+seed);
     }else ok(s.outcome.kind==='block'&&!action&&s.consecutivePasses>=3&&s.outcome.playerIndex===null,'block '+seed);
    }else ok(s.currentPlayer===(p+1)%3,'turn order '+seed);
   }
   ok(s.outcome&&s.outcome.kind!=='unresolved','turn limit '+seed);
   res.rounds++;res.turnTotal+=s.turns;if(multi)res.roundsWithMultiSideUnlock++;
   if(s.outcome.kind==='finish'){
    res.finishes++;res.byStrategy[policies[s.outcome.playerIndex]].finishFirst++;
    res.minusFinishes[String(s.outcome.minus)]++;
   }else{
    res.blocks++;
    const v=s.outcome.remainders,min=Math.min(...v);
    if(v.filter(x=>x===min).length===1)res.blockUniqueMinimum++;else res.blockTiedMinimum++;
    if(min===0)res.blockMinimumZero++;
   }
   for(let p=0;p<3;p++){
    const m=res.byStrategy[policies[p]];m.appearances++;m.pips.push(e.pipSum(s.hands[p]));
    m.startingDoubles+=doubles(deal.hands[p]);m.endingDoubles+=doubles(s.hands[p]);
   }
  }
 }
 res.meanTurns=res.turnTotal/res.rounds;res.blockRate=res.blocks/res.rounds;
 res.multiSideUnlockRoundRate=res.roundsWithMultiSideUnlock/res.rounds;
 for(const m of Object.values(res.byStrategy)){
  m.finishFirstRate=m.finishFirst/m.appearances;m.meanFinalPips=avg(m.pips);m.medianFinalPips=med(m.pips);
  m.meanStartingDoubles=m.startingDoubles/m.appearances;m.meanEndingDoubles=m.endingDoubles/m.appearances;
  delete m.pips;
 }
 return res;
}
if(require.main===module){
 const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1596940),+(a[1]||2400)),null,2));
}
module.exports={run,test,MIXES};