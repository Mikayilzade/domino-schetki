'use strict';
// Independent history-conditioned next-pass experiment; no scoreboard mutations.
// node qosha-research/simulator/pass-history-independent-runner.js test
// node qosha-research/simulator/pass-history-independent-runner.js 2400000 3000000 12
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),hold=require('./connector-other-matches');
const choose=require('./strategy-runner').chooseBy,reg=require('./decision-regret');
const nextRun=require('./next-pass-forecast-runner'),hist=require('./pass-history-posterior');
const policies=['closed-branch-control','min-hand-pips','fast-doubles'];
const avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
const brier=(p,y)=>(p-y)*(p-y);
function collect(start,end,limit){
 const out=[];let scanned=0,eligible=0;
 for(let seed=start;seed<end&&out.length<limit;seed++){
  let s=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(s.kind!=='ready')continue;
  scanned++;const witnesses=[];
  while(!s.outcome&&s.turns<100){
   const f=s.currentPlayer,next=(f+1)%3;
   const matches=hold.matches(s);
   if(!s.stock.length&&matches.length){
    eligible++;
    const passes=witnesses.filter(w=>w.player===next);
    if(passes.length){
     const pair=matches[0].pairs[0],options=d.turnOptions(s.branchState,s.openingState,s.hands[f],s.stock);
     const by=new Map(options.actions.map(a=>[reg.actionKey(a),a]));
     const a=by.get(pair.connector),b=by.get(pair.other);
     if(!a||!b||a.type!=='single'||b.type!=='single'||e.pipSum([a.tile])!==e.pipSum([b.tile]))throw Error('bad pair');
     const hidden=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));
     out.push({seed,turn:s.turns,x:matches[0].x,pair,passes,state:r.cloneRoundState(s),
       known:e.createDoubleSixDeck().filter(t=>!hidden.has(e.tileKey(t)))});
     break;
    }
   }
   const opts=d.turnOptions(s.branchState,s.openingState,s.hands[f],s.stock);
   if(opts.phase==='pass'&&!s.stock.length)witnesses.push({observed:true,sameRound:true,stockSize:0,player:f,
     board:e.cloneBranchState(s.branchState),opening:e.cloneOpeningState(s.openingState)});
   s=r.stepRound(s,(o,st)=>choose('min-hand-pips',o,{seed,turns:st.turns,player:st.currentPlayer}));
  }
 }
 return{out,scanned,eligible};
}
function analyze(p){
 const s=p.state,f=s.currentPlayer,next=(f+1)%3,pre=JSON.stringify(s);
 const opts=d.turnOptions(s.branchState,s.openingState,s.hands[f],s.stock);
 const by=new Map(opts.actions.map(a=>[reg.actionKey(a),a]));
 const keys=[p.pair.connector,p.pair.other],actions=keys.map(k=>by.get(k));
 const unseen=nextRun.pool(p),all=nextRun.worlds(p,unseen);
 const compatible=all.filter(w=>p.passes.every(pass=>hist.legalKeys(pass.board,pass.opening,w.hands[next]).size===0));
 if(!compatible.length)throw Error('history inconsistent');
 const predictions=actions.map(a=>{
  const after=r.stepRound(s,o=>o.actions.find(z=>reg.actionKey(z)===reg.actionKey(a)));
  if(after.outcome)throw Error('early outcome');
  const q=hist.forecast({unseen,handSize:s.hands[next].length,target:next,board:after.branchState,
   opening:after.openingState,passes:p.passes});
  function passed(w){
   const t=r.stepRound(w,o=>o.actions.find(z=>reg.actionKey(z)===reg.actionKey(a)));
   return +(d.turnOptions(t.branchState,t.openingState,t.hands[next],t.stock).phase==='pass');
  }
  const actual=passed(s),exact=avg(compatible.map(passed));
  if(Math.abs(exact-q.probability)>1e-12)throw Error('posterior enumeration mismatch');
  return{unconditional:q.unconditional,conditional:q.probability,actual,
   excluded:q.excluded,compatiblePassCount:compatible.reduce((z,w)=>z+passed(w),0)};
 });
 const outcome=Object.fromEntries(policies.map(k=>[k,[]]));let continuations=0;
 for(let i=0;i<compatible.length;i++){
  const w=compatible[i];
  for(const policy of policies){
   const ev=reg.evaluateDecisionInWorld(w,{focalPlayer:f,continuationStrategy:policy,
    seed:73000000+1000*p.seed+i,maxTurns:200});
   if(ev.kind!=='paired-world')throw Error('not paired');
   continuations+=ev.candidates.length;
   const m=new Map(ev.candidates.map(x=>[x.actionKey,x])),a=m.get(keys[0]),b=m.get(keys[1]);
   if(!a||!b||a.outcome==='unresolved'||b.outcome==='unresolved')throw Error('unresolved');
   outcome[policy].push({win:+a.focalFinishedFirst- +b.focalFinishedFirst,
    pips:a.focalRemainder-b.focalRemainder,
    minus:+(a.focalMinus<0)- +(b.focalMinus<0)});
  }
 }
 const policy=Object.fromEntries(policies.map(k=>[k,Object.fromEntries(['win','pips','minus'].map(m=>[m,avg(outcome[k].map(x=>x[m]))]))]));
 if(JSON.stringify(s)!==pre)throw Error('source state mutated');
 return{seed:p.seed,turn:p.turn,passWitnesses:p.passes.length,handSizes:s.hands.map(h=>h.length),
  exactAllocations:all.length,compatibleAllocations:compatible.length,historyInformative:compatible.length<all.length,continuations,pair:p.pair,
  predictions,policy};
}
function run(start=2400000,end=3000000,limit=12){
 const c=collect(start,end,limit),rows=c.out.map(analyze);
 if(!rows.length)throw Error('no eligible positions');
 const pairs=rows.flatMap(x=>x.predictions);
 const byPolicy={};
 for(const k of policies){
  const eligible=rows.filter(x=>x.predictions[0].conditional!==x.predictions[1].conditional);
  const d=eligible.map(x=>Math.sign(x.predictions[0].conditional-x.predictions[1].conditional)*x.policy[k].win);
  byPolicy[k]={higherConditionalPassWinDelta:avg(d),eligiblePositions:eligible.length,
   better:d.filter(x=>x>0).length,worse:d.filter(x=>x<0).length,ties:d.filter(x=>x===0).length,
   connectorMinusUnrelatedWin:avg(rows.map(x=>x.policy[k].win)),
   connectorMinusUnrelatedPips:avg(rows.map(x=>x.policy[k].pips))};
 }
 const changes=rows.filter(x=>Math.sign(x.predictions[0].conditional-x.predictions[1].conditional)!==
  Math.sign(x.predictions[0].unconditional-x.predictions[1].unconditional)).length;
 return{schema:'qosa-pass-history-independent/v1',
  timestampAsiaBaku:new Date(Date.now()+14400000).toISOString().slice(0,19)+' +04:00',
  engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',start,end,limit,
  scannedDeals:c.scanned,eligiblePreHistoryStates:c.eligible,positions:rows.length,
  selectedSeeds:rows.map(x=>x.seed),
  exactAllocations:rows.reduce((s,x)=>s+x.exactAllocations,0),
  compatibleAllocations:rows.reduce((s,x)=>s+x.compatibleAllocations,0),
  candidateContinuations:rows.reduce((s,x)=>s+x.continuations,0),
  fullStrategyRoundsAdded:0,priorVerifiedFullStrategyRounds:180000,
  discoveryPolicy:'min-hand-pips',continuationPolicies:policies,
  continuationSeedFormula:'73000000+1000*dealSeed+compatibleAllocationIndex',
  summary:{brierUniform:avg(pairs.map(x=>brier(x.unconditional,x.actual))),
   brierHistory:avg(pairs.map(x=>brier(x.conditional,x.actual))),
   changedPassChoiceDirection:changes,historyInformativePositions:rows.filter(x=>x.historyInformative).length,byPolicy},
  limitations:'Independent deal seeds, but selected positions conditioned on prior empty-stock target pass and first eligible equal-pip pair. Uniform allocations conditional only on target pass (not opponent choice history). Both forced next-pass counterfactuals scored on actual deal. Exact enumeration within model; branch rules assumed; bot continuation; no block winner; small selected sample; policy and Brier outcomes provisional.',
  next:'Replicate on a second disjoint seed range; inspect history-posterior failures and test whether the higher-pass choice remains favorable after controlling for hand size and alternative policies.',
  rows};
}
function test(){
 const a=run(1800303,1800304,1),b=run(1800303,1800304,1);
 if(a.positions!==1||JSON.stringify(a.rows)!==JSON.stringify(b.rows))throw Error('replay');
 if(a.summary.brierHistory==null)throw Error('missing score');
 const c=run(2405676,2405677,1),d=run(2405676,2405677,1);
 if(c.positions!==1||!c.rows[0].historyInformative||c.rows[0].compatibleAllocations>=c.rows[0].exactAllocations||JSON.stringify(c.rows)!==JSON.stringify(d.rows))throw Error('informative history replay');
 return{passed:true,seeds:[...a.selectedSeeds,...c.selectedSeeds],compatible:[a.compatibleAllocations,c.compatibleAllocations]};
}
if(require.main===module){const x=process.argv.slice(2);
 console.log(JSON.stringify(x[0]==='test'?test():run(+(x[0]||2400000),+(x[1]||3000000),+(x[2]||12)),null,2));}
module.exports={collect,analyze,run,test};
