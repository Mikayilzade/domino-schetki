'use strict';
// Qoşa 3x9 conditional 6-6 hold policy-swap, matched seeds and focal seats.
// PROVISIONAL number-lock/four-branch model. No 101-match scoring.
// node qosha-research/simulator/six-conditional-hold.js test
// node qosha-research/simulator/six-conditional-hold.js 1556940 1200
const e=require('./engine'),r=require('./round-driver'),init=require('./initializer'),b=require('./strategy-runner');
const MIXES=[
 {name:'closed+closed',opp:['closed-branch-control','closed-branch-control']},
 {name:'min+min',opp:['min-hand-pips','min-hand-pips']},
 {name:'closed+min',opp:['closed-branch-control','min-hand-pips']}
];
const ARMS=['closed-branch-control','six-pair-hold','conditional-six-hold'];
const CATEGORIES=['no-6-6','6-6/zero-connectors','6-6/one-connector','6-6/two-plus-connectors'];
function cat(hand){
 if(!hand.some(t=>t[0]===6&&t[1]===6))return 0;
 return Math.min(3,1+hand.filter(t=>t[0]!==t[1]&&t.includes(6)).length);
}
function actionTiles(a){return a.type==='single'?[a.tile]:(a.tiles||[]);}
function touchesSix(a){return actionTiles(a).some(t=>t.includes(6));}
function select(profile,opts,state,ctx,signal){
 if(profile==='conditional-six-hold'){
  const p=state.currentPlayer;
  const connectors=opts.hand.filter(t=>t[0]!==t[1]&&t.includes(6)).length;
  const ready=opts.hand.some(t=>t[0]===6&&t[1]===6)&&connectors>=2&&
   state.hands[(p+1)%3].length>4&&state.hands[(p+2)%3].length>4;
  const safe=ready?opts.actions.filter(a=>!touchesSix(a)):[];
  if(ready&&safe.length&&safe.length<opts.actions.length){
   const chosen=b.chooseBy('closed-branch-control',{...opts,actions:safe},ctx);
   const control=b.chooseBy('closed-branch-control',opts,ctx);
   signal.eligible++;
   if(JSON.stringify(chosen)!==JSON.stringify(control))signal.diverted++;
   return chosen;
  }
 }
 if(profile==='six-pair-hold'&&opts.hand.length>3){
  const safe=opts.actions.filter(a=>!touchesSix(a));
  if(safe.length)return b.chooseBy('closed-branch-control',{...opts,actions:safe},ctx);
 }
 return b.chooseBy(profile==='conditional-six-hold'||profile==='six-pair-hold'?'closed-branch-control':profile,opts,ctx);
}
function ci(xs){if(!xs.length)return{n:0,mean:null,halfWidth95:null};
 const mean=xs.reduce((a,b)=>a+b,0)/xs.length;
 const v=xs.length>1?xs.reduce((a,x)=>a+(x-mean)**2,0)/(xs.length-1):0;
 return{n:xs.length,mean,halfWidth95:xs.length>1?1.96*Math.sqrt(v/xs.length):null};}
function median(xs){if(!xs.length)return null;const a=[...xs].sort((x,y)=>x-y),n=a.length;return n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2;}
function cluster(rows,indexA,indexB,metric,scale){
 const by=new Map();
 for(const row of rows){const d=scale*(row[4+indexA][metric]-row[4+indexB][metric]);const xs=by.get(row[0])||[];xs.push(d);by.set(row[0],xs);}
 return ci([...by.values()].map(xs=>xs.reduce((a,b)=>a+b,0)/xs.length));
}
function summarize(rows,splitStart){
 const result={};
 for(const cohort of ['discovery','holdout','combined']){
  const base=rows.filter(x=>cohort==='combined'||(cohort==='discovery'?x[0]<splitStart:x[0]>=splitStart));
  result[cohort]={};
  for(let mi=0;mi<MIXES.length;mi++){
   const m=base.filter(x=>x[2]===mi);result[cohort][MIXES[mi].name]={};
   for(const [group,predicate] of [['all',()=>true],['initial-6-6+2',x=>x[3]===3],['initial-6-6+0-or-1',x=>x[3]===1||x[3]===2],['no-6-6',x=>x[3]===0]]){
    const xs=m.filter(predicate),n=xs.length;
    const byArm={};
    for(let a=0;a<ARMS.length;a++){
     const vals=xs.map(x=>x[4+a]);
     byArm[ARMS[a]]={finishFirstRate:n?vals.reduce((s,x)=>s+x[0],0)/n:null,
      meanFinalPips:n?vals.reduce((s,x)=>s+x[1],0)/n:null,
      medianFinalPips:median(vals.map(x=>x[1])),
      minusFinishRate:n?vals.reduce((s,x)=>s+x[2],0)/n:null,
      blockRate:n?vals.reduce((s,x)=>s+x[3],0)/n:null,
      meanTurns:n?vals.reduce((s,x)=>s+x[4],0)/n:null,
      meanEndingDoubles:n?vals.reduce((s,x)=>s+x[5],0)/n:null,
      endsWithSixSixRate:n?vals.reduce((s,x)=>s+x[6],0)/n:null};
    }
    const cmp={};
    for(const [name,a,b] of [['conditional-minus-control',2,0],['conditional-minus-unconditional',2,1],['unconditional-minus-control',1,0]]){
     cmp[name]={finishFirstDeltaPP:cluster(xs,a,b,0,100),finalPipsDelta:cluster(xs,a,b,1,1),
      minusFinishDeltaPP:cluster(xs,a,b,2,100),blockDeltaPP:cluster(xs,a,b,3,100),turnDelta:cluster(xs,a,b,4,1)};
    }
    result[cohort][MIXES[mi].name][group]={observations:n,distinctDeals:new Set(xs.map(x=>x[0])).size,
     byArm,comparisons:cmp,conditionalEligibleChoices:xs.reduce((s,x)=>s+x[7],0),
     conditionalDivertedChoices:xs.reduce((s,x)=>s+x[8],0)};
   }
  }
 }
 return result;
}
function run(start=1556940,count=1200){
 if(!Number.isInteger(start)||!Number.isInteger(count)||count<2||count>20000||count%2)throw Error('start/count must be integers, even count >=2');
 const rows=[];let rounds=0,finishes=0,blocks=0,unresolved=0,turnTotal=0;
 const minusFinishes={'-10':0,'-20':0,'-30':0,'-40':0};
 let totalEligible=0,totalDiverted=0;
 for(let seed=start;seed<start+count;seed++){
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(base.kind!=='ready')throw Error('init '+seed);
  for(let seat=0;seat<3;seat++){
   const category=cat(base.hands[seat]);
   for(let mi=0;mi<MIXES.length;mi++){
    const arms=[],sig={eligible:0,diverted:0};
    for(let ai=0;ai<ARMS.length;ai++){
     const profile=ARMS[ai],policies=[null,null,null];
     policies[seat]=profile;policies[(seat+1)%3]=MIXES[mi].opp[0];policies[(seat+2)%3]=MIXES[mi].opp[1];
     const out=r.runRound(base,(opts,state)=>select(policies[state.currentPlayer],opts,state,
      {seed,seat,turns:state.turns,player:state.currentPlayer},sig),{maxTurns:200});
     rounds++;turnTotal+=out.turns;
     if(out.outcome.kind==='finish'){finishes++;if(out.outcome.minus<0)minusFinishes[String(out.outcome.minus)]++;}
     else if(out.outcome.kind==='block')blocks++;
     else {unresolved++;throw Error('unresolved '+seed);}
     arms.push([
      +(out.outcome.kind==='finish'&&out.outcome.playerIndex===seat),
      e.pipSum(out.hands[seat]),
      +(out.outcome.kind==='finish'&&out.outcome.playerIndex===seat&&out.outcome.minus<0),
      +(out.outcome.kind==='block'),out.turns,
      out.hands[seat].filter(t=>t[0]===t[1]).length,
      +out.hands[seat].some(t=>t[0]===6&&t[1]===6)
     ]);
    }
    totalEligible+=sig.eligible;totalDiverted+=sig.diverted;
    rows.push([seed,seat,mi,category,...arms,sig.eligible,sig.diverted]);
   }
  }
 }
 const splitStart=start+count/2;
 return{schema:'qosha-conditional-six-policy-swap-v1',engine:'qosa-research-0.5.3',
  rules:'recovered qosa-1.0.0 3x9; four-branch number-lock PROVISIONAL',
  seedStart:start,seedEnd:start+count-1,discoverySeedRange:[start,splitStart-1],
  holdoutSeedRange:[splitStart,start+count-1],uniqueDeals:count,
  fullRoundContinuations:rounds,finishes,blocks,unresolved,meanRoundTurns:turnTotal/rounds,
  minusFinishes,totalConditionalEligibleChoices:totalEligible,totalConditionalDivertedChoices:totalDiverted,
  arms:ARMS,opponentMixes:MIXES,categories:CATEGORIES,
  summary:summarize(rows,splitStart),
  rowFormat:'[seed, focalSeat, opponentMixIndex, initialHandCategoryIndex, controlOutcome, unconditionalOutcome, conditionalOutcome, conditionalEligibleChoices, conditionalDivertedChoices]; outcome=[finishFirst, finalPips, focalMinusFinish, roundBlocked, turns, endingDoubles, endsWith6-6]',
  rows,
  design:'Two predeclared disjoint halves, matched initial seeded 3x9 deals, three focal seat rotations, three fixed opponent mixes, three focal policies, 27 complete rounds/deal. Conditional policy chooses a no-6 legal action by closed-branch-control ranking ONLY if focal hand contains 6-6 plus >=2 other 6-Y connectors, BOTH opponents have >4 stones, and both 6-containing and non-6 legal actions exist. Otherwise closed-branch-control. Unconditional six-pair-hold exactly matches the 2026-10-25 enrichment policy: with >3 focal stones choose no-6 legal action if possible; else closed control. Initial hand categories after 1-1 opening. Exploratory 95% normal half-widths clustered by unique deal seed, without multiplicity correction.',
  limitations:'Number-lock and four-branch geometry provisional. Block winner unassigned; loneZero, bust and 101 match scoring unvalidated. Finish-first is not match win. Deterministic simple opponent policies, correlated rotations and three mixes, subgroup uncertainty exploratory; no causal pure 6-6 opening effect. Conditional policy sees opponent HAND SIZES only (public), not hidden tile identities.',
  nextAction:'Repeat any apparent conditional win or pips benefit on fresh disjoint seeds and by initial 6-6 connector count; inspect actual policy diversion rate. Authenticate human four-branch lock/open and block-winner fixtures before recommending a real-game 6-6 tactic.'};
}
function test(){
 const hand=[[6,6],[1,6],[2,6],[0,1]],opts={phase:'play',hand,actions:[
  {type:'single',tile:[1,6],side:'up',to:6},
  {type:'single',tile:[0,1],side:'left',to:0},
  {type:'double-sequence',tiles:[[6,6]],numbers:[6]}
 ]};
 const state={currentPlayer:0,hands:[hand,Array(5).fill([0,0]),Array(5).fill([1,1])]};
 const sig={eligible:0,diverted:0};
 const a=select('conditional-six-hold',opts,state,{seed:1},sig);
 if(e.tileKey(a.tile)!=='0-1'||sig.eligible!==1||sig.diverted!==1)throw Error('conditional trigger');
 const stateShort={...state,hands:[hand,Array(4).fill([0,0]),Array(5).fill([1,1])]};
 const b0=select('conditional-six-hold',opts,stateShort,{seed:1},{eligible:0,diverted:0});
 if(e.tileKey(b0.tile)!=='1-6')throw Error('opponent hand-size gate');
 const one={...opts,hand:[[6,6],[1,6],[0,1]]};
 const c=select('conditional-six-hold',one,state,{seed:1},{eligible:0,diverted:0});
 if(e.tileKey(c.tile)!=='1-6')throw Error('connector gate');
 const x=run(1556940,8),y=run(1556940,8);
 if(JSON.stringify(x)!==JSON.stringify(y)||x.unresolved||x.fullRoundContinuations!==216||x.rows.length!==72)throw Error('deterministic replay');
 if(x.totalConditionalDivertedChoices>x.totalConditionalEligibleChoices)throw Error('trigger counts');
 return{passed:true,fixture:'two connectors and both opponents >4',deals:8,rounds:216,rows:72,eligible:x.totalConditionalEligibleChoices,diverted:x.totalConditionalDivertedChoices};
}
if(require.main===module){const args=process.argv.slice(2);console.log(JSON.stringify(args[0]==='test'?test():run(+(args[0]||1556940),+(args[1]||1200)),null,2));}
module.exports={run,test,select,cat,MIXES,ARMS,CATEGORIES};