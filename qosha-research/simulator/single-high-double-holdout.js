'use strict';
// Single-number optional high-double holdout; independent 3x9 matched deals.
// node qosha-research/simulator/single-high-double-holdout.js test
// node qosha-research/simulator/single-high-double-holdout.js 1311240 600
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),{chooseBy}=require('./strategy-runner'),j=require('./joint-pass-memory-runner');
const deck=e.createDoubleSixDeck(),profiles=['min-hand-pips','closed-branch-control'];
const variants=['a20-joint','joint-defer-3','joint-defer-4','joint-defer-5','joint-defer-6'];
const avg=a=>a.reduce((s,v)=>s+v,0)/a.length;
const median=a=>{const b=[...a].sort((x,y)=>x-y),i=b.length>>1;return b.length%2?b[i]:(b[i-1]+b[i])/2};
const tiles=a=>a.type==='single'?[a.tile]:(a.tiles||[]);
function play(base,seat,profile,variant){
 let state=r.cloneRoundState(base),deferrals=0,passes=0;
 const live=new Set([...base.hands.flat(),...base.stock].map(e.tileKey));
 const known=deck.filter(t=>!live.has(e.tileKey(t))),forbidden=[new Set(),new Set(),new Set()];
 while(!state.outcome&&state.turns<200){
  const p=state.currentPlayer,opts=d.turnOptions(state.branchState,state.openingState,state.hands[p],state.stock);
  let action=null;
  if(opts.phase==='pass'&&!state.stock.length){
   const playable=deck.filter(t=>d.actionsForHand(state.branchState,state.openingState,[t]).length);
   for(const t of playable)forbidden[p].add(e.tileKey(t));
   if(state.hands[p].some(t=>forbidden[p].has(e.tileKey(t))))throw Error('pass contradiction');
   passes++;
  }
  if(opts.phase==='play'){
   if(p!==seat)action=chooseBy(profile,opts);
   else{
    action=j.select(opts,state,known,forbidden,'a20-joint').action;
    const n=Number(variant.slice('joint-defer-'.length));
    if(variant.startsWith('joint-defer-')&&action.type==='double-sequence'&&
      action.numbers.length===1&&action.numbers[0]===n&&
      opts.actions.some(a=>a.type==='single'||a.type==='mixed-finish')&&
      (forbidden[(p+1)%3].size||forbidden[(p+2)%3].size)){
       action=j.select({...opts,actions:opts.actions.filter(a=>a.type!=='double-sequence')},
         state,known,forbidden,'a20-joint').action;deferrals++;
    }
   }
  }
  state=r.stepRound(state,()=>action);
  if(action)known.push(...tiles(action));
 }
 const o=state.outcome||{kind:'unresolved'};
 return {win:+(o.kind==='finish'&&o.playerIndex===seat),pips:e.pipSum(state.hands[seat]),
  block:+(o.kind==='block'),unresolved:+(o.kind==='unresolved'),turns:state.turns,
  minus:o.kind==='finish'&&o.playerIndex===seat?o.minus:0,deferrals,passes};
}
function run(start=1311240,count=600){
 if(!Number.isInteger(start)||!Number.isInteger(count)||count<2)throw Error('seed arguments');
 const report={schema:'qosa-single-high-double-deferral/v1',engine:'qosa-research-0.5.3',
  rules:'qosa-1.0.0',mode:'3x9',startSeed:start,endSeed:start+count-1,deals:count,
  variants,fullRounds:0,profiles:[],
  assumptions:'Single optional n-n deferral after opponent no-stock pass; matched deal/seat/bots. Multi-double sequences excluded.',
  limitations:'Provisional branch rules; fixed bots; no block winner; first 1-1 preprocessed; exploratory unadjusted seed-cluster intervals; trajectories diverge.'};
 for(const profile of profiles){
  const sums=variants.map(()=>({wins:0,pips:[],blocks:0,turns:0,unresolved:0,deferrals:0,
    minus:{'0':0,'-10':0,'-20':0,'-30':0,'-40':0}}));
  const bySeed=variants.map(()=>[]);
  for(let seed=start;seed<start+count;seed++){
   const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
   if(base.kind!=='ready')throw Error('initializer '+seed);
   const wins=variants.map(()=>[]);
   for(let seat=0;seat<3;seat++){
    const outcomes=variants.map(v=>play(base,seat,profile,v));
    outcomes.forEach((o,i)=>{const s=sums[i];s.wins+=o.win;s.pips.push(o.pips);s.blocks+=o.block;
      s.turns+=o.turns;s.unresolved+=o.unresolved;s.deferrals+=o.deferrals;s.minus[String(o.minus)]++;
      wins[i].push(o.win);report.fullRounds++});
   }
   bySeed.forEach((a,i)=>a.push(avg(wins[i])));
  }
  report.profiles.push({profile,rows:variants.map((v,i)=>{
   const s=sums[i],delta=bySeed[i].map((x,k)=>x-bySeed[0][k]),m=avg(delta);
   const sd=Math.sqrt(delta.reduce((a,x)=>a+(x-m)**2,0)/(count-1)),ci=1.96*sd/Math.sqrt(count);
   return {variant:v,rounds:count*3,finishFirstRate:s.wins/(count*3),deltaFinishFirst:m,
    exploratorySeedCI95:[m-ci,m+ci],meanPips:avg(s.pips),medianPips:median(s.pips),
    blockRate:s.blocks/(count*3),meanTurns:s.turns/(count*3),minus:s.minus,
    deferrals:s.deferrals,unresolved:s.unresolved};
  })});
 }
 return report;
}
function test(){
 const a=run(1311240,5),b=run(1311240,5);
 if(JSON.stringify(a)!==JSON.stringify(b)||a.fullRounds!==150||
 a.profiles.some(p=>p.rows.some(x=>x.unresolved)))throw Error('deterministic regression');
 return {passed:true,fullRounds:a.fullRounds};
}
if(require.main===module){const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1311240),+(a[1]||600)),null,2));}
module.exports={run,test,play};
