'use strict';
// Reproduce the exact hidden allocation and forced-action contrast at seed 1304562.
// node qosha-research/simulator/pass-choice-outlier-audit.js
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const {chooseBy}=require('./strategy-runner');
const {actionKey}=require('./decision-regret');
const {collect}=require('./pass-choice-regret-runner');
const deck=e.createDoubleSixDeck();
function comb(n,k){if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-k+i)/i;return Math.round(v);}
function hidden(p){
 const n=(p.seat+1)%3,o=(p.seat+2)%3;
 const visible=new Set([...p.known,...p.state.hands[p.seat]].map(e.tileKey));
 const unseen=deck.filter(t=>!visible.has(e.tileKey(t)));
 const mustN=[],mustO=[],flex=[];
 for(const t of unseen){const k=e.tileKey(t),a=p.forbidden[n].includes(k),b=p.forbidden[o].includes(k);
   if(a&&b)throw Error('contradictory passes');
   if(a)mustO.push(t);else if(b)mustN.push(t);else flex.push(t);}
 const take=p.state.hands[n].length-mustN.length;
 if(take<0||take>flex.length||mustO.length+flex.length-take!==p.state.hands[o].length)
   throw Error('invalid hand sizes');
 return {n,o,mustN,mustO,flex,take,support:comb(flex.length,take)};
}
function force(p,w,which){
 let state=r.cloneRoundState(w),trace=[];
 while(!state.outcome&&state.turns<200){
  const seat=state.currentPlayer,opts=d.turnOptions(state.branchState,state.openingState,state.hands[seat],state.stock);
  const a=opts.phase==='pass'?null:seat===p.seat&&state.turns===p.turn
    ?opts.actions.find(x=>actionKey(x)===p[which])
    :chooseBy(p.profile,opts,{seed:p.seed,turns:state.turns,player:seat});
  if(opts.phase==='play'&&!a)throw Error('missing legal action');
  trace.push({turn:state.turns,player:seat,action:a?actionKey(a):'pass'});
  state=r.stepRound(state,()=>a);
 }
 if(!state.outcome||state.outcome.kind==='unresolved')throw Error('unresolved');
 return {outcome:state.outcome,remaining:e.pipSum(state.hands[p.seat]),trace};
}
function run(){
 const ps=collect(1304540,450,18).positions,counts={};
 for(const profile of ['min-hand-pips','closed-branch-control']){
  const a=ps.filter(p=>p.profile===profile).map(p=>hidden(p).support).sort((x,y)=>x-y);
  counts[profile]={positions:a.length,min:a[0],median:a[Math.floor(a.length/2)],max:a[a.length-1],
    singleton:a.filter(x=>x===1).length,atMost128:a.filter(x=>x<=128).length};
 }
 const p=ps.find(x=>x.profile==='min-hand-pips'&&x.seed===1304562&&x.seat===2&&x.turn===22);
 if(!p)throw Error('target missing');
 const c=hidden(p),worlds=[];
 function combinations(start,need,picked){
  if(!need){
   const selected=new Set(picked),w=r.cloneRoundState(p.state);
   w.hands[c.n]=[...c.mustN,...picked.map(i=>c.flex[i])];
   w.hands[c.o]=[...c.mustO,...c.flex.filter((_,i)=>!selected.has(i))];
   worlds.push(w);return;
  }
  for(let i=start;i<=c.flex.length-need;i++)combinations(i+1,need-1,[...picked,i]);
 }
 combinations(0,c.take,[]);
 if(worlds.length!==c.support||c.support!==1)throw Error('exact support changed');
 const w=worlds[0],one=force(p,w,'one'),joint=force(p,w,'joint');
 if(one.outcome.kind!=='block'||joint.outcome.kind!=='finish'||joint.outcome.playerIndex!==2)
   throw Error('forced-action regression');
 return {engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',seed:p.seed,seat:p.seat,turn:p.turn,
  hand:p.state.hands[p.seat].map(e.tileKey),support:c.support,
  next:w.hands[c.n].map(e.tileKey),other:w.hands[c.o].map(e.tileKey),
  actions:{one:p.one,joint:p.joint},one,joint,cohortSupport:counts};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={comb,hidden,force,run};
