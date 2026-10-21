'use strict';
// Both-opponents-observed-pass changed-choice study. Only qosha-research/, 3x9.
// node qosha-research/simulator/both-pass-choice-holdout.js test
// node qosha-research/simulator/both-pass-choice-holdout.js 1306490 600 14 64
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),{chooseBy}=require('./strategy-runner');
const {select}=require('./joint-pass-memory-runner'),{actionKey}=require('./decision-regret');
const {hidden,force}=require('./pass-choice-outlier-audit');
const {exactWorlds,sampleUnique,summarize}=require('./pass-choice-support-strata');
const deck=e.createDoubleSixDeck(),profiles=['min-hand-pips','closed-branch-control'];
const tiles=a=>a.type==='single'?[a.tile]:(a.tiles||[]);
function playableKeys(branch,opening){
 return new Set(deck.filter(t=>d.actionsForHand(branch,opening,[t]).length).map(e.tileKey));
}
function collectBoth(start,count,limit){
 const positions=[],diagnostics={};
 for(const profile of profiles){
  let selected=0,trajectories=0,bothChoices=0,changedChoices=0,scanned=0;
  for(let seed=start;seed<start+count;seed++){
   const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
   if(base.kind!=='ready')throw Error('initializer unresolved '+seed);
   scanned++;let selectedThisSeed=false;
   for(let seat=0;seat<3;seat++){
    trajectories++;let state=r.cloneRoundState(base);
    const live=new Set([...base.hands.flat(),...base.stock].map(e.tileKey));
    const known=deck.filter(t=>!live.has(e.tileKey(t)));
    const forbidden=Array.from({length:3},()=>new Set());
    while(!state.outcome&&state.turns<200){
     const p=state.currentPlayer,opts=d.turnOptions(state.branchState,state.openingState,state.hands[p],state.stock);
     if(opts.phase==='pass'&&!state.stock.length){
      for(const k of playableKeys(state.branchState,state.openingState))forbidden[p].add(k);
      for(const t of state.hands[p])if(forbidden[p].has(e.tileKey(t)))throw Error('observed pass contradiction');
     }
     let action=null;
     if(opts.phase==='play'){
      if(p===seat){
       const next=(p+1)%3,other=(p+2)%3;
       const one=select(opts,state,known,forbidden,'a20-one').action;
       if(opts.actions.length>1&&forbidden[next].size>0&&forbidden[other].size>0){
        bothChoices++;
        const joint=select(opts,state,known,forbidden,'a20-joint').action;
        if(actionKey(one)!==actionKey(joint)){
         changedChoices++;
         if(!selectedThisSeed&&selected<limit){
          positions.push({profile,seed,seat,turn:state.turns,state:r.cloneRoundState(state),
           known:known.map(t=>t.slice()),forbidden:forbidden.map(x=>[...x]),
           one:actionKey(one),joint:actionKey(joint)});
          selectedThisSeed=true;selected++;
         }
        }
       }
       action=one;
      }else action=chooseBy(profile,opts,{seed,turns:state.turns,player:p});
     }
     state=r.stepRound(state,()=>action);
     if(action)known.push(...tiles(action));
    }
    if(!state.outcome||state.outcome.kind==='unresolved')throw Error('discovery unresolved '+seed);
   }
  }
  diagnostics[profile]={scannedDeals:scanned,trajectories,bothHistoryChoicePoints:bothChoices,
   changedChoices,selectedIndependentDealPositions:selected};
 }
 return {positions,diagnostics};
}
function run(start=1306490,count=600,limit=14,worlds=64){
 if(![start,count,limit,worlds].every(Number.isInteger)||count<1||limit<1||worlds<1)throw Error('bad args');
 const discovery=collectBoth(start,count,limit),rows=[];
 for(const p of discovery.positions){
  const c=hidden(p),exact=c.support<=worlds,ws=exact?exactWorlds(p,c):sampleUnique(p,c,worlds);
  const original=JSON.stringify(p.state),scores=[];
  for(const w of ws){
   const keys=[...p.known,...w.hands.flat()].map(e.tileKey);
   if(keys.length!==28||new Set(keys).size!==28)throw Error('deck integrity');
   for(const seat of [c.n,c.o])for(const t of w.hands[seat])
    if(p.forbidden[seat].includes(e.tileKey(t)))throw Error('forbidden hidden tile');
   const a=force(p,w,'one'),b=force(p,w,'joint');
   const win=x=>+(x.outcome.kind==='finish'&&x.outcome.playerIndex===p.seat);
   scores.push({dw:win(b)-win(a),dp:b.remaining-a.remaining,
    dm:+(win(b)&&b.outcome.minus<0)- +(win(a)&&a.outcome.minus<0),
    db:+(b.outcome.kind==='block')- +(a.outcome.kind==='block')});
  }
  if(JSON.stringify(p.state)!==original)throw Error('source state mutated');
  const mean=k=>scores.reduce((s,x)=>s+x[k],0)/scores.length;
  rows.push({profile:p.profile,seed:p.seed,seat:p.seat,turn:p.turn,support:c.support,
   exact,worlds:ws.length,passHistories:2,opponentHandSizes:[p.state.hands[c.n].length,p.state.hands[c.o].length],
   forbiddenSizes:[p.forbidden[c.n].length,p.forbidden[c.o].length],
   hand:p.state.hands[p.seat].map(e.tileKey),one:p.one,joint:p.joint,
   winDelta:mean('dw'),pipsDelta:mean('dp'),minusDelta:mean('dm'),blockDelta:mean('db')});
 }
 const uniqueWorlds=rows.reduce((s,x)=>s+x.worlds,0);
 return {schema:'qosa-both-pass-choice/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
  mode:'3x9',startSeed:start,endSeed:start+count-1,dealsScannedPerProfile:count,
  diagnostics:discovery.diagnostics,selectedPositions:rows.length,
  exactPositions:rows.filter(x=>x.exact).length,sampledPositions:rows.filter(x=>!x.exact).length,
  uniqueHiddenWorlds:uniqueWorlds,counterfactualContinuations:2*uniqueWorlds,
  strategies:['a20-one','a20-joint'],opponents:profiles,
  method:'One first changed-choice position per seed/profile; both opponents had previously passed; fixed visible tiles; pass-constrained uniform hidden allocations; identical worlds and bot continuation.',
  limitations:'Selection on disagreement; exact only for small support; first selected per seed, fixed deterministic bots, no prior action likelihood, provisional branch semantics, no block winner. Position CIs exploratory, no universal causal claim.',
  summaries:Object.fromEntries(profiles.map(profile=>{const x=rows.filter(a=>a.profile===profile);
   return [profile,{all:summarize(x),exact:summarize(x.filter(a=>a.exact)),sampled:summarize(x.filter(a=>!a.exact))}];})),
  rows};
}
function test(){
 const a=collectBoth(1306490,8,2),b=collectBoth(1306490,8,2);
 if(JSON.stringify(a)!==JSON.stringify(b))throw Error('discovery not deterministic');
 for(const p of a.positions){
  const n=(p.seat+1)%3,o=(p.seat+2)%3;
  if(!p.forbidden[n].length||!p.forbidden[o].length||p.one===p.joint)throw Error('bad both-history selection');
  const c=hidden(p),w=sampleUnique(p,c,1)[0];
  if(w.hands[n].some(t=>p.forbidden[n].includes(e.tileKey(t)))||
     w.hands[o].some(t=>p.forbidden[o].includes(e.tileKey(t))))throw Error('invalid sampled world');
 }
 return {passed:true,deterministic:true,positions:a.positions.length};
}
if(require.main===module){
 const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1306490),+(a[1]||600),+(a[2]||14),+(a[3]||64)),null,2));
}
module.exports={collectBoth,run,test};
