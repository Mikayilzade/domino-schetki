'use strict';
// Reproduce: node qosha-research/simulator/mobility-shared-trigger.js test
// Reproduce: node qosha-research/simulator/mobility-shared-trigger.js 1359340 1500
// One matched first-divergence intervention per focal seat; all later turns baseline.
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),choose=require('./strategy-runner').chooseBy;
const BOTS=['min-hand-pips','closed-branch-control'],ARMS=['base','pair','generic'];
function pip(a){return e.pipSum([a.tile]);}
function key(a){return a.side+':'+e.tileKey(a.tile)+':'+a.to;}
function features(s,a){
 const z=d.applyTurn(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock,a);
 return{playable:z.hand.filter(t=>d.actionsForHand(z.branchState,z.openingState,[t]).length>0).length,
  pairs:z.hand.filter(t=>t[0]===t[1]).reduce((n,t)=>n+z.hand.filter(u=>u[0]!==u[1]&&u.includes(t[0])).length,0)};
}
function gate(o,s){
 const base=choose('min-hand-pips',o);if(base.type!=='single')return null;
 const b=features(s,base);
 const alts=o.actions.filter(a=>a.type==='single'&&a.side===base.side&&
  e.tileKey(a.tile)!==e.tileKey(base.tile)&&pip(base)-pip(a)<=4)
  .map(a=>({action:a,...features(s,a),cost:pip(base)-pip(a)}));
 const generic=alts.filter(x=>x.playable>b.playable).sort((x,y)=>
  y.playable-x.playable||x.cost-y.cost||key(x.action).localeCompare(key(y.action)))[0];
 const pair=alts.filter(x=>x.pairs>0&&x.playable>=b.playable).sort((x,y)=>
  y.pairs-x.pairs||y.playable-x.playable||x.cost-y.cost||key(x.action).localeCompare(key(y.action)))[0];
 if(!generic||!pair||key(generic.action)===key(pair.action)||
    pair.pairs<=generic.pairs||pair.playable>generic.playable)return null;
 return{base,baseFeatures:b,pair,generic,side:base.side,
  handSize:s.hands[s.currentPlayer].length,otherHandSizes:s.hands.map(h=>h.length),
  endBefore:s.branchState.branches[base.side].end};
}
function nextMetrics(o,s){
 return{pass:+(o.phase==='pass'),actions:o.actions.length,
  playable:o.hand.filter(t=>d.actionsForHand(s.branchState,s.openingState,[t]).length>0).length};
}
function result(s,seat,ret){
 if(!s.outcome||s.outcome.kind==='unresolved')throw Error('unresolved');
 const win=+(s.outcome.kind==='finish'&&s.outcome.playerIndex===seat);
 return{win,pips:e.pipSum(s.hands[seat]),block:+(s.outcome.kind==='block'),turns:s.turns,
  minus:win?(s.outcome.minus||0):0,endingDoubles:s.hands[seat].filter(t=>t[0]===t[1]).length,return:ret};
}
function baseRun(initial,seat,bot){
 let s=r.cloneRoundState(initial),g=null,ret=null;
 while(!s.outcome&&s.turns<200){
  if(s.currentPlayer===seat){
   const o=d.turnOptions(s.branchState,s.openingState,s.hands[seat],s.stock);
   if(g&&ret===null&&s.turns>g.state.turns)ret=nextMetrics(o,s);
   if(!g&&o.phase==='play'){const found=gate(o,s);if(found)g={...found,state:r.cloneRoundState(s)};}
  }
  s=r.stepRound(s,(o,st)=>choose(st.currentPlayer===seat?'min-hand-pips':bot,o));
 }
 return{base:result(s,seat,ret),g};
}
function forced(g,seat,bot,arm){
 let s=r.cloneRoundState(g.state),first=true,ret=null;
 while(!s.outcome&&s.turns<200){
  if(s.currentPlayer===seat&&!first&&ret===null){
   const o=d.turnOptions(s.branchState,s.openingState,s.hands[seat],s.stock);
   ret=nextMetrics(o,s);
  }
  s=r.stepRound(s,(o,st)=>{
   if(first){first=false;if(st.currentPlayer!==seat)throw Error('focal mismatch');return g[arm].action;}
   return choose(st.currentPlayer===seat?'min-hand-pips':bot,o);
  });
 }
 if(first)throw Error('forced action missing');
 return result(s,seat,ret);
}
function mean(a,f){return a.length?a.reduce((s,x)=>s+f(x),0)/a.length:null;}
function sum(a,f){return a.reduce((s,x)=>s+f(x),0);}
function median(xs){const a=[...xs].sort((x,y)=>x-y),n=a.length;return n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2;}
function run(start=1359340,count=1500){
 if(!Number.isInteger(start)||!Number.isInteger(count)||count<1)throw Error('invalid seed/count');
 const rows=[],triggers=[];
 for(let seed=start;seed<start+count;seed++){
  const deal=e.dealThreeByNine(seed),tiles=[...deal.hands.flat(),...deal.stock].map(e.tileKey);
  if(tiles.length!==28||new Set(tiles).size!==28)throw Error('deck');
  const initial=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(initial.kind!=='ready')throw Error('initializer');
  for(const bot of BOTS)for(let seat=0;seat<3;seat++){
   const {base,g}=baseRun(initial,seat,bot);
   const row={seed,bot,seat,trigger:!!g,base,pair:base,generic:base};
   if(g){
    const frozen=JSON.stringify(g.state);
    row.pair=forced(g,seat,bot,'pair');row.generic=forced(g,seat,bot,'generic');
    if(JSON.stringify(g.state)!==frozen)throw Error('source mutated');
    if(g.pair.action.side!==g.generic.action.side||g.pair.pairs<=g.generic.pairs||
       g.pair.playable>g.generic.playable||g.pair.cost>4||g.generic.cost>4)throw Error('invalid tradeoff');
    triggers.push({seed,bot,seat,handSize:g.handSize,otherHandSizes:g.otherHandSizes,
     side:g.side,endBefore:g.endBefore,pairTile:e.tileKey(g.pair.action.tile),
     genericTile:e.tileKey(g.generic.action.tile),pairEnd:g.pair.action.to,
     genericEnd:g.generic.action.to,pairCost:g.pair.cost,genericCost:g.generic.cost,
     pairPlayables:g.pair.playable,genericPlayables:g.generic.playable,
     pairConnections:g.pair.pairs,genericConnections:g.generic.pairs});
   }
   rows.push(row);
  }
 }
 const summary={};
 for(const bot of BOTS){
  const a=rows.filter(x=>x.bot===bot),t=a.filter(x=>x.trigger),n=a.length,arm={};
  for(const k of ARMS){
   const next=t.map(x=>x[k].return).filter(Boolean);
   arm[k]={finishFirst:mean(a,x=>x[k].win),triggeredFinishFirst:mean(t,x=>x[k].win),
    meanRemainder:mean(a,x=>x[k].pips),medianRemainder:median(a.map(x=>x[k].pips)),
    meanTurns:mean(a,x=>x[k].turns),blockRate:mean(a,x=>x[k].block),
    meanEndingDoubles:mean(a,x=>x[k].endingDoubles),
    minusFinish:Object.fromEntries([-10,-20,-30,-40].map(m=>[m,sum(a,x=>+(x[k].win&&x[k].minus===m))])),
    observedNextOwnTurn:next.length,nextOwnPassRate:mean(next,x=>x.pass),
    nextOwnMeanPlayable:mean(next,x=>x.playable),nextOwnMeanActions:mean(next,x=>x.actions)};
  }
  const contrasts={};
  for(const [v,w] of [['pair','generic'],['pair','base'],['generic','base']]){
   const bySeed=new Map();
   for(const x of a)bySeed.set(x.seed,(bySeed.get(x.seed)||0)+(x[v].win-x[w].win)/3);
   const z=[...bySeed.values()],m=mean(z,x=>x),se=Math.sqrt(sum(z,x=>(x-m)**2)/(count*(count-1)||1));
   contrasts[v+'-minus-'+w]={winDeltaPP:100*m,exploratory3SEPP:[100*(m-3*se),100*(m+3*se)],
    triggeredWinDeltaPP:100*mean(t,x=>x[v].win-x[w].win),
    remainderDelta:mean(a,x=>x[v].pips-x[w].pips),
    triggeredRemainderDelta:mean(t,x=>x[v].pips-x[w].pips),
    changedWinnerOutcomes:sum(t,x=>+(x[v].win!==x[w].win))};
  }
  const tt=triggers.filter(x=>x.bot===bot),endpointGapCounts={},handSizes={};
  for(const x of tt){const gap=x.pairEnd-x.genericEnd;
   endpointGapCounts[gap]=(endpointGapCounts[gap]||0)+1;
   handSizes[x.handSize]=(handSizes[x.handSize]||0)+1;}
  summary[bot]={seatRounds:n,triggeredSeatRounds:t.length,triggerRate:t.length/n,
   arm,contrasts,triggerProperties:{meanPairMinusGenericPlayables:mean(tt,x=>x.pairPlayables-x.genericPlayables),
    meanPairMinusGenericConnections:mean(tt,x=>x.pairConnections-x.genericConnections),
    meanPairMinusGenericDiscardedPips:mean(tt,x=>x.genericCost-x.pairCost),
    endpointGapCounts,handSizes}};
 }
 return{engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
  experiment:'shared-gate-one-shot-pair-vs-generic-v1',
  seedStart:start,seedEnd:start+count-1,deals:count,
  fullBaselineContinuations:rows.length,triggeredPositions:triggers.length,
  forcedSuffixContinuations:2*triggers.length,bots:BOTS,arms:ARMS,summary,
  triggerExamples:triggers.slice(0,12)};
}
function test(){
 const a=run(1359340,65),b=run(1359340,65);
 if(JSON.stringify(a)!==JSON.stringify(b)||a.fullBaselineContinuations!==390||
    a.triggeredPositions<1)throw Error('replay');
 for(const bot of BOTS)if(a.summary[bot].triggeredSeatRounds<1)throw Error('profile missing');
 return{passed:true,triggeredPositions:a.triggeredPositions};
}
if(require.main===module){
 const x=process.argv.slice(2);console.log(JSON.stringify(x[0]==='test'?test():run(+(x[0]||1359340),+(x[1]||1500)),null,2));
}
module.exports={run,test,gate,features};
