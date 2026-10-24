'use strict';
// Independent 3-stone chain holdout. Real number-lock rules PROVISIONAL.
const chain=require('./three-stone-chain-preservation'),forced=require('./forced-double-count-ablation');
const base=require('./strategy-runner'),init=require('./initializer'),round=require('./round-driver');
const regret=require('./decision-regret');
const PERMS=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
function aliasRegression(startSeed=1409240,count=100){
 let comparisons=0,finishes=0,blocks=0;
 for(let seed=startSeed;seed<startSeed+count;seed++){
  const state=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(state.kind!=='ready')throw Error('unresolved initializer');
  let reference=null;
  for(const perm of PERMS){
   const names=perm.map(i=>['few-A','closed','few-B'][i]);
   const result=round.runRound(state,(opts,s)=>{
    const ctx={seed,turns:s.turns,player:s.currentPlayer};
    const a=forced.choose(forced.FEW,opts,ctx),b=base.chooseBy('closed-branch-control',opts,ctx);
    if(regret.actionKey(a)!==regret.actionKey(b))throw Error('FEW and closed differ at seed '+seed);
    comparisons++;return names[s.currentPlayer]==='closed'?b:a;
   },{maxTurns:200});
   if(result.outcome.kind==='unresolved')throw Error('unresolved alias round');
   const signature=JSON.stringify({turns:result.turns,outcome:result.outcome,hands:result.hands,
    stock:result.stock,branches:result.branchState.branches,opened:[...result.openingState.openedNumbers].sort()});
   if(reference!==null&&signature!==reference)throw Error('alias changed outcome at seed '+seed);
   reference=signature;
   if(result.outcome.kind==='finish')finishes++;else blocks++;
  }
 }
 return {passed:true,seeds:[startSeed,startSeed+count-1],distinctDeals:count,permutations:6,
  excludedTestContinuations:count*6,comparedReachableActions:comparisons,finishes,blocks,
  inference:'FEW and closed-branch-control are observationally identical on tested reachable choices. Their profile results are not independent opponent replications.'};
}
const mean=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:null;
function ci(a){const n=a.length,m=mean(a);if(n<2)return{n,mean:m,halfWidth95:null};const v=a.reduce((s,x)=>s+(x-m)**2,0)/(n-1);return{n,mean:m,halfWidth95:2.05*Math.sqrt(v/n)};}
function stratify(rows){
 const groups={next1:[],next2:[],next3to4:[],next5plus:[],nextAtMost2:[],nextAtLeast3:[],chain:[],noChain:[]};
 for(const x of rows){const n=x.opponentSizes[(x.focal+1)%3];
  groups[n===1?'next1':n===2?'next2':n<=4?'next3to4':'next5plus'].push(x);
  groups[n<=2?'nextAtMost2':'nextAtLeast3'].push(x);
  groups[x.chain?'chain':'noChain'].push(x);
 }
 return Object.fromEntries(Object.entries(groups).map(([name,items])=>[name,{
  positions:items.length,byContinuationPolicy:Object.fromEntries(['min-hand-pips','closed-branch-control'].map(policy=>{
   const x=items.map(row=>row.byPolicy[policy].selectMinusMany);
   return [policy,{finishFirstPP:ci(x.map(y=>y.finishPP)),meanRemainderPips:ci(x.map(y=>y.pips)),
    minusFinishPP:ci(x.map(y=>y.minusPP))}];
  }))}]));
}
function run(startSeed=1409240,count=2400,worlds=24){
 const audit=aliasRegression(startSeed,100),raw=chain.run(startSeed,count,worlds);
 return {...raw,schema:'qosha-three-stone-chain-independent-holdout/v1',
  aliasRegression:audit,nextClockwiseOpponentStrata:stratify(raw.hidden.rows),
  hypothesis:'Disjoint-seed six-permutation 3-stone chain holdout, stratified by next opponent hand size; verify policy-alias symmetry.',
  limitationsAddendum:'closed-branch-control is a FEW policy alias in this engine, not independent confirmation. Next-opponent hand size is taken from discovery state; hidden worlds vary allocations. Uncorrected position-cluster intervals; n=8 next2 subgroup. Real number locking and 101-point scoring remain unresolved.'};
}
function test(){const a=aliasRegression(1409240,20),b=run(1409240,100,4);
 if(a.excludedTestContinuations!==120||a.comparedReachableActions<100||
 b.totalFullRoundContinuations!==1900||b.tournament.unresolved||b.hidden.discovery.unresolved)
 throw Error('regression failed');
 return {passed:true,alias:a,positions:b.hidden.positions,forced:b.forcedCounterfactualContinuations};}
if(require.main===module){const args=process.argv.slice(2);console.log(JSON.stringify(args[0]==='test'?test():run(+(args[0]||1409240),+(args[1]||2400),+(args[2]||24)),null,2));}
module.exports={aliasRegression,stratify,run,test};