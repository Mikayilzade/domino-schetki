'use strict';
const e=require('./engine'),init=require('./initializer'),rd=require('./round-driver');
const integration=require('./finish-score-match-integration');
function choose(options,state,seed){
  if(options.phase!=='play'||!options.actions.length)return null;
  const h=e.mixSeed32((seed^Math.imul(state.turns+1,0x9e3779b9)^Math.imul(state.currentPlayer+1,0x85ebca6b)^0x51)>>>0);
  return options.actions[h%options.actions.length];
}
function zeroMatch(){return[0,1,2].map(i=>({id:'P'+i,score:0,exploded:false}));}
function fingerprint(deal){const keys=xs=>xs.map(e.tileKey).sort().join(',');return deal.hands.map(keys).join('|')+'|stock='+keys(deal.stock);}
function runStream({startSeed=17000000,acceptedRounds=1000,maxAttemptsPerRound=100,maxTurns=200}={}){
  let cursor=startSeed,redeals=0,attempts=0,accepted=0,finishes=0,blocks=0,unresolved=0;
  let scoredRounds=0,scoreEvents=0,zeroInputsSkipped=0,pendingEvents=0,completedMatches=0,activeMatchRounds=0,floorHits=0,bustEvents=0,maxScoreObserved=0;
  let current=zeroMatch();const matchRoundLengths=[],minus={'0':0,'-10':0,'-20':0,'-30':0,'-40':0};const seen=new Map();
  for(let i=0;i<acceptedRounds;i++){
    let ready=null,chosenSeed=null,tries=0;
    while(tries<maxAttemptsPerRound){
      const seed=cursor++;attempts++;tries++;const deal=e.dealThreeByNine(seed);
      const outcome=init.initializeThreePlayerRoundFromDeal({...deal,isFirstRound:true});
      if(outcome.kind==='redeal'){redeals++;continue;}
      if(outcome.kind!=='ready')throw new Error('unexpected initializer result '+outcome.kind+' seed '+seed);
      const fp=fingerprint(deal);if(seen.has(fp))throw new Error('duplicate accepted allocation seed '+seed+' duplicate of '+seen.get(fp));
      seen.set(fp,seed);ready=outcome;chosenSeed=seed;break;
    }
    if(!ready)throw new Error('redeal cap reached for accepted round '+i);accepted++;
    const terminal=rd.runRound(ready,(opts,state)=>choose(opts,state,chosenSeed),{maxTurns});const outcome=terminal.outcome;
    if(!outcome||(outcome.kind!=='finish'&&outcome.kind!=='block')){unresolved++;throw new Error('unresolved round seed '+chosenSeed);}
    activeMatchRounds++;
    if(outcome.kind==='block'){blocks++;continue;}
    finishes++;scoredRounds++;minus[String(outcome.minus||0)]++;
    const result=integration.applyFinishOutcomeToMatch(current,outcome,{seatOrder:[0,1,2]});const beforeScores=current.map(x=>x.score);
    for(const event of result.events){
      scoreEvents++;if(event.delta<0&&beforeScores[event.seat]+event.delta<0)floorHits++;
      if(beforeScores[event.seat]+event.delta>=101&&!current[event.seat].exploded)bustEvents++;
      beforeScores[event.seat]=Math.max(0,beforeScores[event.seat]+event.delta);maxScoreObserved=Math.max(maxScoreObserved,beforeScores[event.seat]);
    }
    zeroInputsSkipped+=result.skippedZeroSeats.length;pendingEvents+=result.pendingSeats.length;current=result.entities;
    if(result.unscored)throw new Error('finish unexpectedly marked unscored');
    if(result.finished){completedMatches++;matchRoundLengths.push(activeMatchRounds);activeMatchRounds=0;current=zeroMatch();}
  }
  const sorted=[...matchRoundLengths].sort((a,b)=>a-b);
  const median=sorted.length?(sorted.length%2?sorted[(sorted.length-1)/2]:(sorted[sorted.length/2-1]+sorted[sorted.length/2])/2):null;
  return{
    schema:'qosa-finish-score-match-roundstream/v1',engine:'qosha-research-0.5.3',
    rules:'qosa-1.0.0 coded round model; finish-pip score mapping is an explicit adapter assumption; block outcomes unscored',
    policy:'deterministic seed/turn/player hash selects a legal action index; validation-only, not a strategic arm',
    initialization:'independent accepted first-round deals; if 1-1 is in stock, advance to next seed and retry',
    seed:{start:startSeed,attemptEnd:cursor-1,attempts,acceptedRounds:accepted,redealSignals:redeals,uniqueAcceptedAllocations:seen.size,duplicateAcceptedAllocations:0},
    roundOutcomes:{finishes,blocks,unresolved,finishMinus:minus},
    scoreAdapter:{scoredRounds,scoreEvents,zeroInputsSkipped,pendingEventsAfterPwaFinish:pendingEvents,completedMatches,meanRoundsPerCompletedMatch:completedMatches?matchRoundLengths.reduce((a,b)=>a+b,0)/completedMatches:null,medianRoundsPerCompletedMatch:median,unfinishedTailRounds:activeMatchRounds,floorHits,bustEvents,maxScoreObserved,eventOrder:'ascending seat index (harness convention; not authenticated)'},
    limitations:'Independent accepted first-round deals are streamed as score rounds, not a physical match-start sequence. Score mapping assumes each seat receives terminal hand pips and finisher additionally receives finish-minus. PWA adapter stops on the first nonzero event leaving at most two survivors; later same-round nonzero seat events remain pending, while zero inputs are skipped. Block winner/tie allocation is unresolved and blocks are unscored. No strategy comparison or physical-rule authentication.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(runStream({startSeed:Number(process.argv[2]||17000000),acceptedRounds:Number(process.argv[3]||1000)}),null,2)+'\n');
module.exports={runStream};
