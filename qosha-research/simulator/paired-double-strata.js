'use strict';
// Matched-deal, matched-seat comparison. The branch rules are provisional.
// Run from repo root: node qosha-research/simulator/paired-double-strata.js 1060000 2500
const e=require('./engine'),r=require('./round-driver'),init=require('./initializer'),s=require('./strategy-runner');
function features(hand,starter){
  const doubles=hand.filter(t=>t[0]===t[1]&&t[0]!==1);
  const connected=doubles.some(d=>hand.some(t=>t[0]!==t[1]&&(t[0]===d[0]||t[1]===d[0])));
  const count=doubles.length;
  return {starter,nonOpeningDoubles:count,doubleBucket:count>=3?'3+':String(count),connected};
}
function fresh(){return {n:0,closedFinish:0,moderateFinish:0,closedPips:0,moderatePips:0,closedMinus:0,moderateMinus:0,closedBlocks:0,moderateBlocks:0,closedTurns:0,moderateTurns:0,pairedGain:0,pairedLoss:0};}
function finalize(g){return {...g,closedFinishRate:g.n?g.closedFinish/g.n:null,moderateFinishRate:g.n?g.moderateFinish/g.n:null,finishDeltaPP:g.n?100*(g.closedFinish-g.moderateFinish)/g.n:null,meanPipsDelta:g.n?(g.closedPips-g.moderatePips)/g.n:null,minusDeltaPP:g.n?100*(g.closedMinus-g.moderateMinus)/g.n:null};}
function runPaired(startSeed,count){
  const groups={};let unresolved=0,checks=0;
  function add(key,feat,closed,moderate,focal){
    const g=groups[key]||(groups[key]=fresh());g.n++;
    const cf=closed.outcome.kind==='finish'&&closed.outcome.playerIndex===focal;
    const mf=moderate.outcome.kind==='finish'&&moderate.outcome.playerIndex===focal;
    g.closedFinish+=Number(cf);g.moderateFinish+=Number(mf);
    g.pairedGain+=Number(cf&&!mf);g.pairedLoss+=Number(mf&&!cf);
    g.closedPips+=e.pipSum(closed.hands[focal]);g.moderatePips+=e.pipSum(moderate.hands[focal]);
    g.closedMinus+=Number(cf&&closed.outcome.minus<0);g.moderateMinus+=Number(mf&&moderate.outcome.minus<0);
    g.closedBlocks+=Number(closed.outcome.kind==='block');g.moderateBlocks+=Number(moderate.outcome.kind==='block');
    g.closedTurns+=closed.turns;g.moderateTurns+=moderate.turns;
  }
  for(let seed=startSeed;seed<startSeed+count;seed++){
    const deal=e.dealThreeByNine(seed);
    if(new Set([...deal.hands.flat(),...deal.stock].map(e.tileKey)).size!==28)throw Error('deck integrity '+seed);
    const base=init.initializeThreePlayerRoundFromDeal({...deal,isFirstRound:false,previousWinnerIndex:seed%3});
    if(base.kind!=='ready')throw Error('initializer '+seed);
    checks++;
    for(let focal=0;focal<3;focal++){
      const f=features(deal.hands[focal],focal===base.starter);
      const run=policy=>r.runRound(base,(opts,state)=>{
        const name=state.currentPlayer===focal?policy:'moderate-double-hold';
        return s.chooseBy(name,opts,{seed,rotation:0,turns:state.turns,player:state.currentPlayer,salt:0});
      },{maxTurns:200});
      const closed=run('closed-branch-control'),moderate=run('moderate-double-hold');
      if(closed.outcome.kind==='unresolved'||moderate.outcome.kind==='unresolved'){unresolved++;continue;}
      const keys=['all','starter:'+f.starter,'connected:'+f.connected,'doubleBucket:'+f.doubleBucket,
        'starter:'+f.starter+'|doubleBucket:'+f.doubleBucket+'|connected:'+f.connected];
      for(const k of keys)add(k,f,closed,moderate,focal);
    }
  }
  return {startSeed,endSeed:startSeed+count-1,deals:count,pairedSeatObservations:count*3,completeRounds:count*6,unresolved,deckChecks:checks,groups:Object.fromEntries(Object.entries(groups).map(([k,g])=>[k,finalize(g)]))};
}
if(require.main===module){const start=Number(process.argv[2]||1060000),count=Number(process.argv[3]||2500);console.log(JSON.stringify(runPaired(start,count),null,2));}
module.exports={features,runPaired};
