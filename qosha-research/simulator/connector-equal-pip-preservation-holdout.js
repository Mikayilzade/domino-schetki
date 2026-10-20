'use strict';
// Equal-discard-pips, matched-hidden-world connector retention experiment.
// node qosha-research/simulator/connector-equal-pip-preservation-holdout.js [test|start count worlds cap]
const e=require('./engine'),r=require('./round-driver');
const {chooseBy}=require('./strategy-runner');
const {discover}=require('./late-double-crossfit');
const {sample}=require('./pass-conditioned-world');
const {actionKey:key}=require('./decision-regret');
const {preservesConnector}=require('./connector-preservation-holdout');
const policies=['min-hand-pips','closed-branch-control'];
const mean=(xs,k)=>xs.reduce((s,x)=>s+x[k],0)/xs.length;
function stats(xs){return {first:mean(xs,'first'),pips:mean(xs,'pips'),minus:mean(xs,'minus'),block:mean(xs,'block'),turns:mean(xs,'turns')};}
function interval(xs){
 const m=xs.reduce((s,x)=>s+x,0)/xs.length;
 if(xs.length<2)return [m,m];
 const sd=Math.sqrt(xs.reduce((s,x)=>s+(x-m)**2,0)/(xs.length-1));
 return [m-1.96*sd/Math.sqrt(xs.length),m+1.96*sd/Math.sqrt(xs.length)];
}
function summarize(rows){
 if(!rows.length)return {n:0};
 const deltas=rows.map(x=>x.deltaFirst);
 return {n:rows.length,keepMinusBreakFirst:mean(rows,'deltaFirst'),
  firstCI95:interval(deltas),keepMinusBreakPips:mean(rows,'deltaPips'),
  keepMinusBreakMinus:mean(rows,'deltaMinus'),keepMinusBreakBlock:mean(rows,'deltaBlock'),
  keepMinusBreakTurns:mean(rows,'deltaTurns'),
  keepBetter:deltas.filter(x=>x>0).length,tied:deltas.filter(x=>x===0).length,
  breakBetter:deltas.filter(x=>x<0).length};
}
function pip(hand,a){const t=hand[a.handIndex];return t[0]+t[1];}
function eligible(p){
 const hand=p.state.hands[p.seat],singles=p.actions.filter(a=>a.type==='single');
 const keep=singles.filter(a=>preservesConnector(hand,a)),br=singles.filter(a=>!preservesConnector(hand,a));
 const sums=[...new Set(keep.map(a=>pip(hand,a)))].filter(n=>br.some(a=>pip(hand,a)===n)).sort((a,b)=>a-b);
 if(!sums.length)return null;
 // Precommitted lowest shared pip total, identical for both classes.
 const sum=sums[0];
 return {p,sum,keep:keep.filter(a=>pip(hand,a)===sum),br:br.filter(a=>pip(hand,a)===sum)};
}
function rollout(world,forced,policy,focal,seed){
 let first=true;
 const end=r.runRound(world,(opts,s)=>{
  if(first){first=false;const action=opts.actions.find(a=>key(a)===key(forced));
   if(!action)throw Error('missing forced action');return action;}
  return chooseBy(policy,opts,{seed,turns:s.turns,player:s.currentPlayer});
 },{maxTurns:200});
 const o=end.outcome;
 if(!o||o.kind==='unresolved')throw Error('unresolved');
 return {first:+(o.kind==='finish'&&o.playerIndex===focal),
  pips:e.pipSum(end.hands[focal]),minus:+(o.kind==='finish'&&o.playerIndex===focal&&o.minus<0),
  block:+(o.kind==='block'),turns:end.turns-world.turns};
}
function best(actions,train){
 return actions.slice().sort((a,b)=>{
  const x=train[key(a)],y=train[key(b)];
  return y.first-x.first||x.pips-y.pips||key(a).localeCompare(key(b));
 })[0];
}
function run(start=1307000,count=8000,worlds=64,cap=28){
 if(![start,count,worlds,cap].every(Number.isInteger)||count<1||worlds<4||worlds%2||cap<1)throw Error('arguments');
 const discovery=discover(start,count,count);
 const all=discovery.found.map(eligible).filter(Boolean),positions=all.slice(0,cap);
 const out={schema:'qosa-connector-equal-pip-preservation/v1',engine:'qosa-research-0.5.3',
  rules:'qosa-1.0.0',mode:'3x9',requestedSeedRange:[start,start+count-1],
  scannedDeals:discovery.scanned,lateDoubleStates:discovery.found.length,
  eligibleEqualPipStates:all.length,selectedPositions:positions.length,
  worldsPerPosition:worlds,trainWorlds:worlds/2,testWorlds:worlds/2,
  hiddenAllocations:positions.length*worlds,forcedContinuations:0,unresolved:0,policies,
  worldSeedFormula:'mixSeed32(dealSeed XOR imul(turn+1,0x9e3779b9) XOR imul(seat+1,0x85ebca6b) XOR imul(worldIndex+1,0xc2b2ae35))',
  selection:'First focal late-double state on a28-one discovery trajectory; legal single keeping double+connector vs breaking it with identical discarded pip sum. If several shared sums, choose lowest shared sum before outcomes; choose best within each class on training worlds only.',
  assumptions:'Provisional branch-number opening semantics, no-stock pass-conditioned uniform hidden allocations, deterministic continuation bots; no full opponent-choice posterior.',
  limitations:'Small selected subgroup, no causal isolation of branch geometry, first finisher not full-match winner, block winner unassigned, exploratory unadjusted position CI, correlated worlds within positions.',
  results:{}};
 for(const policy of policies){
  const rows=[];
  for(const {p,sum,keep,br} of positions){
   const hand=p.state.hands[p.seat],actions=[...keep,...br];
   const unique=[...new Map(actions.map(a=>[key(a),a])).values()];
   const vals=Object.fromEntries(unique.map(a=>[key(a),{train:[],test:[]}]));
   for(let i=0;i<worlds;i++){
    const seed=e.mixSeed32((p.seed^Math.imul(p.turn+1,0x9e3779b9)^Math.imul(p.seat+1,0x85ebca6b)^Math.imul(i+1,0xc2b2ae35))>>>0);
    const world=sample(p.state,p.seat,p.known,p.forbid,seed);
    for(const a of unique){
     vals[key(a)][i<worlds/2?'train':'test'].push(rollout(world,a,policy,p.seat,seed));
     out.forcedContinuations++;
    }
   }
   const train=Object.fromEntries(unique.map(a=>[key(a),stats(vals[key(a)].train)]));
   const K=best(keep,train),B=best(br,train);
   if(pip(hand,K)!==sum||pip(hand,B)!==sum||!preservesConnector(hand,K)||preservesConnector(hand,B))throw Error('equal-pip class invariant');
   const ks=stats(vals[key(K)].test),bs=stats(vals[key(B)].test);
   rows.push({seed:p.seed,seat:p.seat,turn:p.turn,hand:hand.map(e.tileKey),
    handSize:hand.length,nextOpponentSize:p.state.hands[(p.seat+1)%3].length,
    doubleNumbers:hand.filter(t=>t[0]===t[1]).map(t=>t[0]),
    discardPips:sum,keepAction:key(K),breakAction:key(B),
    keepCandidates:keep.length,breakCandidates:br.length,
    deltaFirst:ks.first-bs.first,deltaPips:ks.pips-bs.pips,
    deltaMinus:ks.minus-bs.minus,deltaBlock:ks.block-bs.block,
    deltaTurns:ks.turns-bs.turns,keepTest:ks,breakTest:bs});
  }
  const groups={};
  for(const [name,fn] of [['handSize',x=>String(x.handSize)],
   ['nextOpponent',x=>x.nextOpponentSize<=2?'<=2':x.nextOpponentSize<=4?'3-4':'5+'],
   ['doubleNumber',x=>x.doubleNumbers.join(',')]]){
   const g={};for(const row of rows)(g[fn(row)]||(g[fn(row)]=[])).push(row);
   groups[name]=Object.fromEntries(Object.entries(g).map(([k,v])=>[k,summarize(v)]));
  }
  out.results[policy]={...summarize(rows),strata:groups,rows};
 }
 return out;
}
function test(){
 const p=eligible({state:{hands:[[[0,0],[0,5],[1,4],[3,6]],[],[]]},seat:0,
  actions:[{type:'single',handIndex:1},{type:'single',handIndex:2}]});
 if(!p||p.sum!==5||p.keep.length!==1||p.br.length!==1)throw Error('equal-pip fixture');
 const a=run(1307000,300,4,2),b=run(1307000,300,4,2);
 if(JSON.stringify(a)!==JSON.stringify(b)||!a.selectedPositions||a.unresolved)throw Error('deterministic replay');
 const expected=Object.values(a.results).reduce((s,x)=>s+x.rows.reduce((t,row)=>t+(row.keepCandidates+row.breakCandidates)*a.worldsPerPosition,0),0);
 if(expected!==a.forcedContinuations)throw Error('accounting');
 return {passed:true,positions:a.selectedPositions,forced:a.forcedContinuations};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1307000),+(a[1]||8000),+(a[2]||64),+(a[3]||28)),null,2));}
module.exports={eligible,run,test};