'use strict';
// Paired continuation evaluator for Qoşa research.
// Every candidate is forced from the same cloned round state.
// All later choices use one deterministic continuation policy.
// Metrics stay separate; this module does not invent a composite utility.

const e=require('./engine');
const d=require('./turn-dispatcher');
const r=require('./round-driver');
const {chooseBy}=require('./strategy-runner');

function actionKey(a){
  const tiles=(a.tiles||[a.tile].filter(Boolean)).map(e.tileKey).join(',');
  return [a.type,a.side||'',a.to??'',(a.numbers||[]).join(','),tiles].join('|');
}

function metrics(end,focal){
  const o=end.outcome;
  return {
    outcome:o.kind,
    focalFinishedFirst:o.kind==='finish'&&o.playerIndex===focal,
    winner:o.kind==='finish'?o.playerIndex:null,
    focalRemainder:e.pipSum(end.hands[focal]),
    focalMinus:o.kind==='finish'&&o.playerIndex===focal?(o.minus||0):0,
    turns:end.turns
  };
}

function evaluateDecisionInWorld(state,options={}){
  const focal=options.focalPlayer??state.currentPlayer;
  const strategy=options.continuationStrategy||'closed-branch-control';
  if(state.outcome)throw new Error('finished round');
  if(focal!==state.currentPlayer)throw new Error('focal player must be current player');
  const start=d.turnOptions(state.branchState,state.openingState,state.hands[focal],state.stock);
  if(start.phase!=='play'||start.actions.length<2)return {kind:'not-a-choice',actions:start.actions.length};
  const rows=[];
  for(const candidate of start.actions){
    const key=actionKey(candidate);
    let first=true;
    const chooser=(opts,s)=>{
      if(first){
        first=false;
        const hit=opts.actions.find(a=>actionKey(a)===key);
        if(!hit)throw new Error('candidate mismatch');
        return hit;
      }
      return chooseBy(strategy,opts,{
        seed:options.seed||0,rotation:options.rotation||0,salt:options.salt||0,
        turns:s.turns,player:s.currentPlayer
      });
    };
    rows.push({actionKey:key,...metrics(r.runRound(state,chooser,{maxTurns:options.maxTurns||200}),focal)});
  }
  return {kind:'paired-world',focalPlayer:focal,continuationStrategy:strategy,candidates:rows};
}

function regretSummary(byAction){
  const rows=Object.entries(byAction);
  if(!rows.length)return {};
  const bestFinish=Math.max(...rows.map(([,m])=>m.finishFirstRate??-Infinity));
  const bestRemainder=Math.min(...rows.map(([,m])=>m.meanRemainder??Infinity));
  const bestMinusRisk=Math.min(...rows.map(([,m])=>m.minusFinishRate??Infinity));
  return Object.fromEntries(rows.map(([key,m])=>[key,{
    finishRateRegret:m.finishFirstRate==null?null:bestFinish-m.finishFirstRate,
    remainderRegret:m.meanRemainder==null?null:m.meanRemainder-bestRemainder,
    minusRiskRegret:m.minusFinishRate==null?null:m.minusFinishRate-bestMinusRisk
  }]));
}

function aggregateWorlds(results){
  const byAction={};
  for(const result of results){
    if(!result||result.kind!=='paired-world')continue;
    for(const row of result.candidates){
      const b=byAction[row.actionKey]||(byAction[row.actionKey]={n:0,firsts:0,remainderSum:0,minusFinishes:0,minusSum:0});
      b.n++; if(row.focalFinishedFirst)b.firsts++; b.remainderSum+=row.focalRemainder;
      if(row.focalMinus<0){b.minusFinishes++;b.minusSum+=row.focalMinus;}
    }
  }
  for(const b of Object.values(byAction)){
    b.finishFirstRate=b.n?b.firsts/b.n:null;
    b.meanRemainder=b.n?b.remainderSum/b.n:null;
    b.minusFinishRate=b.n?b.minusFinishes/b.n:null;
    b.meanMinusWhenMinus=b.minusFinishes?b.minusSum/b.minusFinishes:null;
  }
  return {worlds:results.filter(x=>x&&x.kind==='paired-world').length,byAction,regret:regretSummary(byAction)};
}

module.exports={actionKey,evaluateDecisionInWorld,aggregateWorlds,regretSummary};
