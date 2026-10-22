'use strict';
// Paired, pass-conditioned first high-double opening versus deferral.
// node qosha-research/simulator/high-double-paired.js test
// node qosha-research/simulator/high-double-paired.js 1310640 500 8 32
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),{chooseBy}=require('./strategy-runner'),{select}=require('./joint-pass-memory-runner');
const {conditionalWorld}=require('./pass-choice-regret-runner'),{actionKey}=require('./decision-regret');
const deck=e.createDoubleSixDeck(),profiles=['min-hand-pips','closed-branch-control'],numbers=[3,4,5,6];
const keys=a=>a.map(e.tileKey),mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
const tiles=a=>a.type==='single'?[a.tile]:(a.tiles||[]);
const playable=(b,o)=>new Set(deck.filter(t=>d.actionsForHand(b,o,[t]).length).map(e.tileKey));
function collect(start,count,cap){
 const positions=[],scanned={};
 for(const profile of profiles){
  const hits=Object.fromEntries(numbers.map(n=>[n,0]));let seeds=0;
  outer:for(let seed=start;seed<start+count;seed++){
   const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
   if(base.kind!=='ready')throw Error('initializer');seeds++;
   for(let seat=0;seat<3;seat++){
    let state=r.cloneRoundState(base),picked=false;
    const live=new Set([...base.hands.flat(),...base.stock].map(e.tileKey));
    const known=deck.filter(t=>!live.has(e.tileKey(t))),forbidden=[new Set(),new Set(),new Set()];
    while(!state.outcome&&state.turns<200){
     const p=state.currentPlayer,opts=d.turnOptions(state.branchState,state.openingState,state.hands[p],state.stock);
     if(opts.phase==='pass'&&!state.stock.length){
      for(const k of playable(state.branchState,state.openingState))forbidden[p].add(k);
      if(state.hands[p].some(t=>forbidden[p].has(e.tileKey(t))))throw Error('pass contradiction');
     }
     let action=null;
     if(opts.phase==='play'){
      if(p!==seat)action=chooseBy(profile,opts);
      else{
       action=select(opts,state,known,forbidden,'a20-joint').action;
       const ns=action.numbers||[],n=ns[0],other=opts.actions.filter(a=>a.type!=='double-sequence');
       const observed=forbidden[(p+1)%3].size||forbidden[(p+2)%3].size;
       if(!picked&&observed&&action.type==='double-sequence'&&ns.length===1&&
          numbers.includes(n)&&hits[n]<cap&&other.length){
        const alt=select({...opts,actions:other},state,known,forbidden,'a20-joint').action;
        positions.push({profile,number:n,seed,seat,turn:state.turns,state:r.cloneRoundState(state),
          known:known.map(t=>t.slice()),forbidden:forbidden.map(x=>[...x]),
          open:actionKey(action),defer:actionKey(alt)});
        hits[n]++;picked=true;
       }
      }
     }
     state=r.stepRound(state,()=>action);
     if(action)known.push(...tiles(action));
    }
    if(!state.outcome)throw Error('unresolved discovery');
   }
   if(numbers.every(n=>hits[n]>=cap))break outer;
  }
  scanned[profile]={seedsScanned:seeds,positions:hits};
 }
 return {positions,scanned};
}
function rollout(world,key,profile,seat){
 const opts=d.turnOptions(world.branchState,world.openingState,world.hands[seat],world.stock);
 const action=opts.actions.find(a=>actionKey(a)===key);if(!action)throw Error('candidate missing');
 const after=r.stepRound(world,()=>action);
 const end=after.outcome?after:r.runRound(after,o=>chooseBy(profile,o),{maxTurns:200});
 if(!end.outcome||end.outcome.kind==='unresolved')throw Error('unresolved rollout');
 const o=end.outcome;return {win:+(o.kind==='finish'&&o.playerIndex===seat),
  pips:e.pipSum(end.hands[seat]),minus:+(o.kind==='finish'&&o.playerIndex===seat&&o.minus<0),
  block:+(o.kind==='block')};
}
function run(start=1310640,count=500,cap=8,worlds=32){
 if(![start,count,cap,worlds].every(Number.isInteger)||count<1||cap<1||worlds<1)throw Error('args');
 const found=collect(start,count,cap),rows=[];
 for(const p of found.positions){
  const frozen=JSON.stringify(p.state),a=[],b=[],unique=new Set();
  for(let i=0;i<worlds;i++){
   const seed=e.mixSeed32((p.seed^Math.imul(p.turn+1,0x9e3779b9)^
    Math.imul(p.seat+1,0x85ebca6b)^Math.imul(i+1,0xc2b2ae35))>>>0);
   const world=conditionalWorld(p,seed);
   unique.add(world.hands.map(keys).map(x=>x.join('|')).join('/'));
   a.push(rollout(world,p.open,p.profile,p.seat));
   b.push(rollout(world,p.defer,p.profile,p.seat));
  }
  if(JSON.stringify(p.state)!==frozen)throw Error('state mutation');
  const delta=k=>mean(b.map(x=>x[k]))-mean(a.map(x=>x[k]));
  rows.push({profile:p.profile,number:p.number,seed:p.seed,seat:p.seat,turn:p.turn,
   handSize:p.state.hands[p.seat].length,forbiddenSizes:p.forbidden.map(x=>x.length),
   open:p.open,defer:p.defer,worlds,uniqueHiddenWorlds:unique.size,
   openWin:mean(a.map(x=>x.win)),deferWin:mean(b.map(x=>x.win)),
   winDelta:delta('win'),pipsDelta:delta('pips'),minusDelta:delta('minus'),blockDelta:delta('block')});
 }
 const summaries=[];
 for(const profile of profiles)for(const number of numbers){
  const a=rows.filter(x=>x.profile===profile&&x.number===number),n=a.length,v=a.map(x=>x.winDelta),mu=n?mean(v):null;
  const sd=n>1?Math.sqrt(v.reduce((s,x)=>s+(x-mu)**2,0)/(n-1)):null;
  summaries.push({profile,number,positions:n,pairedContinuations:2*n*worlds,
   deferMinusOpenWin:mu,exploratoryPositionCI95:sd===null?null:[mu-1.96*sd/Math.sqrt(n),mu+1.96*sd/Math.sqrt(n)],
   deferMinusOpenPips:n?mean(a.map(x=>x.pipsDelta)):null,
   deferMinusOpenMinus:n?mean(a.map(x=>x.minusDelta)):null,
   deferMinusOpenBlock:n?mean(a.map(x=>x.blockDelta)):null,
   deferBetter:a.filter(x=>x.winDelta>1e-12).length,openBetter:a.filter(x=>x.winDelta< -1e-12).length,
   tied:a.filter(x=>Math.abs(x.winDelta)<=1e-12).length,
   meanUniqueWorlds:n?mean(a.map(x=>x.uniqueHiddenWorlds)):null});
 }
 return {schema:'qosa-high-double-paired/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
  mode:'3x9',startSeed:start,endSeed:start+count-1,scanned:found.scanned,
  positions:rows.length,worldsPerPosition:worlds,counterfactualContinuations:2*rows.length*worlds,
  comparison:'defer minus open for chosen single optional 3-3,4-4,5-5,6-6 after observed opponent no-stock pass',
  assumptions:'fixed visible/played stones, uniform hidden allocations constrained by both opponents observed no-stock passes, identical worlds and deterministic bot continuation',
  limitations:'selected first a20-joint high-double choice; earlier action likelihood ignored, duplicate hidden worlds possible, fixed bot continuation not pass-aware, no block winner, provisional branch semantics; exploratory uncorrected intervals',
  summaries,rows};
}
function test(){
 const a=run(1310640,35,1,4),b=run(1310640,35,1,4);
 if(JSON.stringify(a)!==JSON.stringify(b)||!a.positions||a.counterfactualContinuations!==8*a.positions)throw Error('replay');
 return {passed:true,positions:a.positions};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1310640),+(a[1]||500),+(a[2]||8),+(a[3]||32)),null,2));}
module.exports={collect,rollout,run,test};
