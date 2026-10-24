'use strict';
// Controlled opening-timing experiment; four-branch number-lock model PROVISIONAL.
// node qosha-research/simulator/opening-timing-ablation.js test
// node qosha-research/simulator/opening-timing-ablation.js 1398440 2400
const e=require('./engine'),init=require('./initializer'),round=require('./round-driver'),base=require('./strategy-runner');
const PROFILES=['min-hand-pips','closed-branch-control','random-legal'];
const LATE='pip-late-opening',EARLY='pip-early-opening';
const tilePips=ts=>e.pipSum(ts);
const actionTiles=a=>a.type==='single'?[a.tile]:(a.tiles||[]);
const actionPips=a=>tilePips(actionTiles(a));
const actionKey=a=>[a.type,(a.numbers||[]).join(','),a.side||'',a.to??'',e.tileKey(a.tile||[0,0])].join(':');
const doubles=ts=>ts.filter(t=>t[0]===t[1]).length;
const mean=xs=>xs.reduce((s,x)=>s+x,0)/xs.length;
function median(xs){const a=[...xs].sort((x,y)=>x-y),n=a.length;return n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2;}
function bestPips(actions){return [...actions].sort((a,b)=>actionPips(b)-actionPips(a)||actionKey(a).localeCompare(actionKey(b)))[0];}
function choose(name,opts,ctx){
 if(name!==LATE&&name!==EARLY)return base.chooseBy(name,opts,ctx);
 const mixed=opts.actions.filter(a=>a.type==='mixed-finish');
 if(mixed.length)return bestPips(mixed);
 const singles=opts.actions.filter(a=>a.type==='single');
 const openings=opts.actions.filter(a=>a.type==='double-sequence');
 // ONLY policy difference: priority between ordinary and double opening when both legal.
 const pool=singles.length&&openings.length?(name===LATE?singles:openings):opts.actions;
 return bestPips(pool);
}
function newStats(){return{appearances:0,finishes:0,pips:[],actions:0,choicePoints:0,openingChoiceOpportunities:0,selectedOpeningAtOpportunity:0,doubleActions:0,doubleTilesPlayed:0,initialPostOpeningDoubles:0,finalDoubles:0,minus:{'0':0,'-10':0,'-20':0,'-30':0,'-40':0}};}
function run(startSeed=1398440,count=2400,maxTurns=200){
 if(!Number.isInteger(startSeed)||!Number.isInteger(count)||count<=0||count%100)throw Error('seed and count must be integers; count multiple of 100');
 const out={schema:'qosha-opening-timing-ablation/v1',timestampBaku:'2026-10-24 15:53 (+04)',engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0; 3x9, number-lock branches PROVISIONAL',startSeed,endSeed:startSeed+count-1,uniqueDeals:count,continuations:0,hiddenWorldContinuations:0,profiles:{},hypothesis:'With the SAME pip maximization and tie-breaking, choosing ordinary placement instead of opening a double when both are legal improves finish-first versus opening early.',note:'Not match wins; no block winner; same seed sets reused across profiles; 3 seat rotations; synthetic previous winner on stock 1-1; initial follow-up default; no opponent information leak.'};
 for(const opponent of PROFILES){
  const strategies=[LATE,EARLY,opponent],stats=Object.fromEntries(strategies.map(s=>[s,newStats()]));
  const clusters=Array.from({length:count/100},()=>({lateWins:0,earlyWins:0,latePips:0,earlyPips:0,rounds:0}));
  let rounds=0,finishes=0,blocks=0,unresolved=0,turns=0,opportunities=0,openedNumbersTotal=0;
  for(let seed=startSeed;seed<startSeed+count;seed++){
   const s=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
   if(s.kind!=='ready')throw Error('unexpected initializer gate '+s.kind+' seed '+seed);
   const cl=clusters[Math.floor((seed-startSeed)/100)];
   for(let rotation=0;rotation<3;rotation++){
    const seatNames=[0,1,2].map(seat=>strategies[(seat+rotation)%3]);
    const chooseAction=(opts,state)=>{
     const name=seatNames[state.currentPlayer],m=stats[name];
     m.actions++;if(opts.actions.length>1)m.choicePoints++;
     const singles=opts.actions.some(a=>a.type==='single'),openings=opts.actions.some(a=>a.type==='double-sequence');
     const opportunity=singles&&openings&&!opts.actions.some(a=>a.type==='mixed-finish');
     if(opportunity){m.openingChoiceOpportunities++;opportunities++;}
     const action=choose(name,opts,{seed,rotation,turns:state.turns,player:state.currentPlayer});
     if(opportunity&&action.type==='double-sequence')m.selectedOpeningAtOpportunity++;
     if(action.type==='double-sequence'){m.doubleActions++;m.doubleTilesPlayed+=action.tiles.length;}
     return action;
    };
    for(let seat=0;seat<3;seat++)stats[seatNames[seat]].initialPostOpeningDoubles+=doubles(s.hands[seat]);
    const finished=round.runRound(s,chooseAction,{maxTurns});
    rounds++;turns+=finished.turns;cl.rounds++;
    if(finished.outcome.kind==='finish'){
     finishes++;const name=seatNames[finished.outcome.playerIndex],m=stats[name];m.finishes++;
     m.minus[String(finished.outcome.minus||0)]++;
     if(name===LATE)cl.lateWins++;if(name===EARLY)cl.earlyWins++;
    }else if(finished.outcome.kind==='block')blocks++;
    else unresolved++;
    openedNumbersTotal+=finished.openingState.openedNumbers.size;
    for(let seat=0;seat<3;seat++){
     const name=seatNames[seat],m=stats[name],pips=e.pipSum(finished.hands[seat]);
     m.appearances++;m.pips.push(pips);m.finalDoubles+=doubles(finished.hands[seat]);
     if(name===LATE)cl.latePips+=pips;if(name===EARLY)cl.earlyPips+=pips;
    }
   }
  }
  const clusterWin=clusters.map(c=>100*(c.lateWins-c.earlyWins)/c.rounds);
  const clusterPips=clusters.map(c=>(c.latePips-c.earlyPips)/c.rounds);
  const ci=xs=>{const avg=mean(xs),variance=xs.reduce((s,x)=>s+(x-avg)**2,0)/(xs.length-1);const t=xs.length>=24?2.07:2.10;return {estimate:avg,halfWidth95:t*Math.sqrt(variance/xs.length),clusters:xs.length};};
  const byStrategy={};
  for(const name of strategies){
   const m=stats[name];byStrategy[name]={appearances:m.appearances,finishFirstRate:m.finishes/m.appearances,finishFirstCount:m.finishes,meanFinalPips:mean(m.pips),medianFinalPips:median(m.pips),choicePoints:m.choicePoints,openingChoiceOpportunities:m.openingChoiceOpportunities,selectedOpeningAtOpportunity:m.selectedOpeningAtOpportunity,doubleActions:m.doubleActions,doubleTilesPlayed:m.doubleTilesPlayed,meanPostOpeningInitialDoubles:m.initialPostOpeningDoubles/m.appearances,meanFinalDoubles:m.finalDoubles/m.appearances,minusFinishes:m.minus};
  }
  out.profiles[opponent]={strategies,rounds,finishes,blocks,unresolved,meanTurns:turns/rounds,meanFinalOpenedNumbers:openedNumbersTotal/rounds,mixedActionFamilyOpportunities:opportunities,byStrategy,pairedLateMinusEarly:{finishFirstPP:ci(clusterWin),meanFinalPips:ci(clusterPips)},clusterSizeDeals:100,confidence:'exploratory uncorrected seed-cluster Student-t approximation; correlations within seeds; 3 profiles not independent'};
  out.continuations+=rounds;
 }
 return out;
}
function test(){
 const single={type:'single',tile:[1,5],side:'up',to:5};
 const opening={type:'double-sequence',tiles:[[2,2]],numbers:[2]};
 const opts={actions:[opening,single],hand:[[1,5],[2,2]]};
 if(choose(LATE,opts)!==single||choose(EARLY,opts)!==opening)throw Error('opening priority ablation failed');
 for(const actions of [[single],[opening]]){
  const a={actions,hand:[[1,5],[2,2]]};
  if(choose(LATE,a)!==choose(EARLY,a))throw Error('policies differ without opening choice');
 }
 const mixed={type:'mixed-finish',tiles:[[1,2],[2,2]],numbers:[2]};
 if(choose(LATE,{actions:[single,opening,mixed]})!==mixed||choose(EARLY,{actions:[single,opening,mixed]})!==mixed)throw Error('mixed finish precedence');
 const a=run(1398440,100),b=run(1398440,100);
 if(JSON.stringify(a)!==JSON.stringify(b))throw Error('non deterministic');
 if(a.continuations!==900||Object.values(a.profiles).some(p=>p.rounds!==300||p.unresolved))throw Error('round accounting');
 return {passed:true,checks:['single vs opening','no-conflict equality','mixed finish precedence','100-seed deterministic replay','900 full continuations'],replayHashHint:[a.profiles['min-hand-pips'].finishes,a.profiles['closed-branch-control'].blocks]};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1398440),+(a[1]||2400)),null,2));}
module.exports={choose,run,test,PROFILES,LATE,EARLY};
