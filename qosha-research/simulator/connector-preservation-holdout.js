'use strict';
// Matched late-game hidden-world experiment: connector-preserving vs connector-breaking SINGLE.
// node qosha-research/simulator/connector-preservation-holdout.js [test|start count worlds cap]
const e=require('./engine'),r=require('./round-driver'),{chooseBy}=require('./strategy-runner');
const {discover}=require('./late-double-crossfit'),{sample}=require('./pass-conditioned-world');
const {actionKey:key}=require('./decision-regret');
const policies=['min-hand-pips','closed-branch-control'],mean=(a,k)=>a.reduce((s,x)=>s+x[k],0)/a.length;
function preservesConnector(hand,action){
 if(action.type!=='single')return false;
 const left=hand.filter((_,i)=>i!==action.handIndex);
 return left.some(t=>t[0]===t[1]&&left.some(u=>u[0]!==u[1]&&u.includes(t[0])));
}
function score(xs){return {first:mean(xs,'first'),pips:mean(xs,'pips'),minus:mean(xs,'minus'),block:mean(xs,'block')};}
function ci(xs){if(xs.length<2)return [xs[0]||0,xs[0]||0];const m=xs.reduce((a,b)=>a+b,0)/xs.length,sd=Math.sqrt(xs.reduce((a,b)=>a+(b-m)**2,0)/(xs.length-1));return [m-1.96*sd/Math.sqrt(xs.length),m+1.96*sd/Math.sqrt(xs.length)];}
function rollout(state,action,policy,focal,seed){
 let first=true;
 const end=r.runRound(state,(opts,s)=>{
  if(first){first=false;const a=opts.actions.find(x=>key(x)===key(action));if(!a)throw Error('forced action missing');return a;}
  return chooseBy(policy,opts,{seed,turns:s.turns,player:s.currentPlayer});
 },{maxTurns:200});
 const o=end.outcome;if(!o||o.kind==='unresolved')throw Error('unresolved');
 return {first:+(o.kind==='finish'&&o.playerIndex===focal),pips:e.pipSum(end.hands[focal]),
  minus:+(o.kind==='finish'&&o.playerIndex===focal&&o.minus<0),block:+(o.kind==='block')};
}
function best(actions,metrics){return actions.slice().sort((a,b)=>{const x=metrics[key(a)],y=metrics[key(b)];return y.first-x.first||x.pips-y.pips||key(a).localeCompare(key(b));})[0];}
function summary(rows){const xs=rows.map(x=>x.deltaFirst);return {n:rows.length,keepMinusBreakFirst:xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null,ci95:xs.length?ci(xs):null,keepMinusBreakPips:rows.length?mean(rows,'deltaPips'):null,keepMinusBreakMinus:rows.length?mean(rows,'deltaMinus'):null,keepBetter:rows.filter(x=>x.deltaFirst>0).length,tied:rows.filter(x=>x.deltaFirst===0).length,breakBetter:rows.filter(x=>x.deltaFirst<0).length};}
function run(start=1305000,count=1200,worlds=48,cap=40){
 if(![start,count,worlds,cap].every(Number.isInteger)||count<1||worlds<4||worlds%2||cap<1)throw Error('arguments');
 const discovery=discover(start,count,count),eligible=discovery.found.map(p=>{
  const hand=p.state.hands[p.seat],singles=p.actions.filter(a=>a.type==='single');
  return {p,singles,keep:singles.filter(a=>preservesConnector(hand,a)),breaks:singles.filter(a=>!preservesConnector(hand,a))};
 }).filter(x=>x.keep.length&&x.breaks.length),positions=eligible.slice(0,cap);
 const out={schema:'qosa-connector-preservation-holdout/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
  requestedSeedRange:[start,start+count-1],scannedDeals:discovery.scanned,lateDoubleStates:discovery.found.length,
  eligibleConnectorChoiceStates:eligible.length,selectedPositions:positions.length,worldsPerPosition:worlds,
  trainWorlds:worlds/2,testWorlds:worlds/2,hiddenAllocations:positions.length*worlds,forcedContinuations:0,unresolved:0,
  policies,seedFormula:'mixSeed32(dealSeed XOR imul(turn+1,0x9e3779b9) XOR imul(seat+1,0x85ebca6b) XOR imul(worldIndex+1,0xc2b2ae35))',
  method:'Same fixed late-game position, legal ordinary single retaining X-X + X-Y versus ordinary single breaking connector. Best class action selected on training worlds, evaluated on disjoint matched holdout worlds.',
  limitations:'First eligible states, selected decision class, provisional branch-opening rule, deterministic bots, first finisher not full-match winner, block winner unspecified, unadjusted exploratory intervals.',
  results:{}};
 for(const policy of policies){
  const rows=[];
  for(const {p,keep,breaks,singles} of positions){
   const vals=Object.fromEntries(singles.map(a=>[key(a),{train:[],test:[]}]));
   for(let i=0;i<worlds;i++){
    const seed=e.mixSeed32((p.seed^Math.imul(p.turn+1,0x9e3779b9)^Math.imul(p.seat+1,0x85ebca6b)^Math.imul(i+1,0xc2b2ae35))>>>0);
    const world=sample(p.state,p.seat,p.known,p.forbid,seed);
    for(const a of singles){vals[key(a)][i<worlds/2?'train':'test'].push(rollout(world,a,policy,p.seat,seed));out.forcedContinuations++;}
   }
   const train=Object.fromEntries(singles.map(a=>[key(a),score(vals[key(a)].train)]));
   const K=best(keep,train),B=best(breaks,train),ks=score(vals[key(K)].test),bs=score(vals[key(B)].test),hand=p.state.hands[p.seat];
   rows.push({seed:p.seed,seat:p.seat,turn:p.turn,hand:hand.map(e.tileKey),handSize:hand.length,
    nextOpponentSize:p.state.hands[(p.seat+1)%3].length,doubleNumbers:hand.filter(t=>t[0]===t[1]).map(t=>t[0]),
    keepAction:key(K),breakAction:key(B),keepActionCount:keep.length,breakActionCount:breaks.length,
    deltaFirst:ks.first-bs.first,deltaPips:ks.pips-bs.pips,deltaMinus:ks.minus-bs.minus,
    keepTest:ks,breakTest:bs});
  }
  const strata={};for(const [name,fn] of [['handSize',x=>String(x.handSize)],['nextOpponent',x=>x.nextOpponentSize<=2?'<=2':x.nextOpponentSize<=4?'3-4':'5+'],['doubleNumber',x=>x.doubleNumbers.join(',')]]){
   const groups={};for(const row of rows){const k=fn(row);(groups[k]||(groups[k]=[])).push(row);}
   strata[name]=Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,summary(v)]));
  }
  out.results[policy]={...summary(rows),strata,rows};
 }
 return out;
}
function test(){
 const h=[[2,2],[2,5],[0,3],[3,4]];
 if(!preservesConnector(h,{type:'single',handIndex:2})||preservesConnector(h,{type:'single',handIndex:1}))throw Error('connector classification');
 const a=run(1305000,150,4,3),b=run(1305000,150,4,3);
 if(JSON.stringify(a)!==JSON.stringify(b)||a.unresolved||a.forcedContinuations<=0)throw Error('determinism');
 return {passed:true,positions:a.selectedPositions,forced:a.forcedContinuations};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1305000),+(a[1]||1200),+(a[2]||48),+(a[3]||40)),null,2));}
module.exports={preservesConnector,run,test};