'use strict';
// Paired fixed-visible regret when exact joint-pass and one-opponent-pass heuristics disagree.
// node qosha-research/simulator/pass-disagreement-regret.js 1303100 1303550 24 24 28
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver'),init=require('./initializer');
const {chooseBy}=require('./strategy-runner'),{select}=require('./joint-pass-memory-runner');
const {actionKey,evaluateDecisionInWorld}=require('./decision-regret'),{sample}=require('./pass-conditioned-sampler');
const deck=e.createDoubleSixDeck(),key=e.tileKey;
const policies=['min-hand-pips','closed-branch-control'];
function knownFrom(state){const live=new Set(state.hands.flat().map(key));return deck.filter(t=>!live.has(key(t)));}
function legalKeys(state){return new Set(deck.filter(t=>d.actionsForHand(state.branchState,state.openingState,[t]).length).map(key));}
function played(a){return a.type==='single'?[a.tile]:(a.tiles||[]);}
function collect(start,end,limit,alpha){
 const out=[];let scanned=0,passEvents=0;
 for(let seed=start;seed<end&&out.length<limit;seed++){
  scanned++;let found=null;
  for(let seat=0;seat<3&&!found;seat++){
   let state=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
   if(state.kind!=='ready')throw Error('unresolved initializer');
   const known=knownFrom(state),forbidden=[new Set(),new Set(),new Set()];
   while(!state.outcome&&state.turns<200){
    const p=state.currentPlayer,opts=d.turnOptions(state.branchState,state.openingState,state.hands[p],state.stock);
    if(opts.phase==='pass'){
     for(const z of legalKeys(state))forbidden[p].add(z);
     passEvents++;
    }
    let action=null;
    if(opts.phase==='play'){
     if(p===seat){
      const one=select(opts,state,known,forbidden,'a'+alpha+'-one').action;
      const joint=select(opts,state,known,forbidden,'a'+alpha+'-joint').action;
      if(!found&&actionKey(one)!==actionKey(joint)){
       found={seed,seat,turn:state.turns,state:r.cloneRoundState(state),
        known:known.slice(),forbidden:forbidden.map(x=>new Set(x)),
        oneKey:actionKey(one),jointKey:actionKey(joint),
        candidateCount:opts.actions.length,handSizes:state.hands.map(h=>h.length),
        forbiddenSizes:forbidden.map(x=>x.size)};
      }
      action=one;
     }else action=chooseBy('min-hand-pips',opts);
    }
    state=r.stepRound(state,()=>action);
    if(action)known.push(...played(action));
    if(found)break;
   }
  }
  if(found)out.push(found);
 }
 return{scanned,passEvents,out};
}
const avg=a=>a.reduce((s,x)=>s+x,0)/a.length;
function stats(xs){const m=avg(xs),sd=Math.sqrt(xs.reduce((s,x)=>s+(x-m)**2,0)/(xs.length-1));
 return{mean:m,ci95:[m-1.96*sd/Math.sqrt(xs.length),m+1.96*sd/Math.sqrt(xs.length)],
 positive:xs.filter(x=>x>0).length,negative:xs.filter(x=>x<0).length,ties:xs.filter(x=>x===0).length};}
function run(start=1303100,end=1303550,limit=24,worlds=24,alpha=28){
 if(end<=start||limit<2||worlds<2)throw Error('bad range');
 const found=collect(start,end,limit,alpha),rows=[];let continuations=0,unresolved=0;
 for(const p of found.out){
  const row={seed:p.seed,seat:p.seat,turn:p.turn,handSizes:p.handSizes,
   forbiddenSizes:p.forbiddenSizes,candidates:p.candidateCount,one:p.oneKey,joint:p.jointKey,policies:{}};
  for(const policy of policies){
   let dw=0,dp=0,dm=0;const by=new Map();
   for(let j=0;j<worlds;j++){
    const seed=e.mixSeed32((p.seed+Math.imul(j+1,0x9e3779b9))>>>0);
    const world=sample(p.state,p.known,p.forbidden,seed);
    const out=evaluateDecisionInWorld(world,{focalPlayer:p.seat,continuationStrategy:policy,seed,maxTurns:200});
    if(out.kind!=='paired-world')throw Error('not a choice');
    continuations+=out.candidates.length;
    if(out.candidates.some(x=>x.outcome==='unresolved')){unresolved++;throw Error('unresolved rollout');}
    const a=out.candidates.find(x=>x.actionKey===p.oneKey),b=out.candidates.find(x=>x.actionKey===p.jointKey);
    if(!a||!b)throw Error('candidate missing');
    dw+=+b.focalFinishedFirst- +a.focalFinishedFirst;
    dp+=b.focalRemainder-a.focalRemainder;
    dm+=+(b.focalMinus<0)- +(a.focalMinus<0);
    for(const c of out.candidates){
     const v=by.get(c.actionKey)||{wins:0,pips:0};
     v.wins+=+c.focalFinishedFirst;v.pips+=c.focalRemainder;by.set(c.actionKey,v);
    }
   }
   const best=Math.max(...[...by.values()].map(v=>v.wins/worlds));
   row.policies[policy]={win:dw/worlds,pips:dp/worlds,minus:dm/worlds,
    oneRegret:best-by.get(p.oneKey).wins/worlds,jointRegret:best-by.get(p.jointKey).wins/worlds};
  }
  rows.push(row);
 }
 const summary=Object.fromEntries(policies.map(policy=>[policy,Object.fromEntries(
  ['win','pips','minus','oneRegret','jointRegret'].map(k=>[k,stats(rows.map(x=>x.policies[policy][k]))]))]));
 return{schema:'qosa-pass-conditioned-regret/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
  seedStart:start,seedEndExclusive:end,scanned:found.scanned,positions:rows.length,worlds,
  hiddenAllocations:rows.length*worlds,candidateContinuations:continuations,unresolved,
  passEvents:found.passEvents,alpha,discovery:'first changed one-vs-joint decision per deal, min-pips opponents',
  policies,summary,rows,limitations:'Uniform pass-conditioned hidden allocations but no policy-choice likelihood; provisional branch rules; fixed deterministic continuation bots; exploratory position-cluster CI; no block winner.'};
}
if(require.main===module){
 const a=process.argv.slice(2);
 console.log(JSON.stringify(run(+(a[0]||1303100),+(a[1]||1303550),+(a[2]||24),+(a[3]||24),+(a[4]||28)),null,2));
}
module.exports={collect,run};
