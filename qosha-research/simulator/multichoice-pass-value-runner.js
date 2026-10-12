'use strict';
// Exact 3x9 pass-history multi-choice holdout. Only canonical ordinary single actions.
// node qosha-research/simulator/multichoice-pass-value-runner.js test
// node qosha-research/simulator/multichoice-pass-value-runner.js
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),post=require('./pass-history-posterior');
const {chooseBy}=require('./strategy-runner'),{actionKey}=require('./decision-regret');
const policies=['closed-branch-control','min-hand-pips','fast-doubles'];
const seeds=[2910003,2910012,2910019,2910021,2910026,2910027,2910030,2910047,2910053,2910058,2910063,2910068,2910073,2910088,2910092,2910097,2910098,2910099,2910104,2910106,2910112,2910122,2910126,2910129,2910130,2910133,2910136,2910151,2910161,2910164,2910166,2910173,2910176,2910177,2910181];
const avg=a=>a.reduce((s,x)=>s+x,0)/a.length,EPS=1e-12;
function singles(s){
 const o=d.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock),map=new Map();
 if(o.phase!=='play'||o.drawn)return [];
 for(const a of o.actions)if(a.type==='single'&&!map.has(e.tileKey(a.tile)))map.set(e.tileKey(a.tile),a);
 return [...map.values()];
}
function locate(seed){
 let s=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
 if(s.kind!=='ready')throw Error('init '+seed);
 const passes=[[],[],[]];
 while(!s.outcome&&s.turns<100){
  const target=(s.currentPlayer+1)%3,as=singles(s);
  const unseen=s.hands.reduce((n,h,i)=>n+(i===s.currentPlayer?0:h.length),0);
  if(!s.stock.length&&passes[target].length&&as.length>=3&&unseen<=6)
   return{seed,turn:s.turns,target,s:r.cloneRoundState(s),passes:passes[target]};
  const o=d.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
  if(o.phase==='pass'&&!s.stock.length)passes[s.currentPlayer].push({
   observed:true,sameRound:true,stockSize:0,player:s.currentPlayer,
   board:e.cloneBranchState(s.branchState),opening:e.cloneOpeningState(s.openingState)});
  s=r.stepRound(s,(o,st)=>chooseBy('min-hand-pips',o,{seed,turns:st.turns,player:st.currentPlayer}));
 }
 throw Error('not eligible '+seed);
}
function worlds(p){
 const s=p.s,f=s.currentPlayer,opp=[0,1,2].filter(x=>x!==f);
 const present=new Set(s.hands.flat().map(e.tileKey));
 const played=e.createDoubleSixDeck().filter(t=>!present.has(e.tileKey(t)));
 const fixed=new Set([...played,...s.hands[f]].map(e.tileKey));
 const unseen=e.createDoubleSixDeck().filter(t=>!fixed.has(e.tileKey(t)));
 if(s.stock.length||unseen.length>6)throw Error('world contract');
 const forbidden=new Set();
 for(const witness of p.passes)for(const t of unseen)
  if(d.actionsForHand(witness.board,witness.opening,[t]).length)forbidden.add(e.tileKey(t));
 const all=[],valid=[],n=s.hands[opp[0]].length;
 function rec(start,ids){
  if(ids.length===n){
   const used=new Set(ids),w=r.cloneRoundState(s);
   w.hands[opp[0]]=ids.map(i=>unseen[i].slice());
   w.hands[opp[1]]=unseen.filter((t,i)=>!used.has(i)).map(t=>t.slice());
   all.push(w);
   if(w.hands[p.target].every(t=>!forbidden.has(e.tileKey(t))))valid.push(w);
   return;
  }
  for(let j=start;j<=unseen.length-(n-ids.length);j++)rec(j+1,[...ids,j]);
 }
 rec(0,[]);
 const sig=w=>w.hands.map(h=>h.map(e.tileKey).sort().join(',')).join('|');
 if(!valid.length||!valid.some(w=>sig(w)===sig(s)))throw Error('actual deal excluded');
 return{all,valid,unseen};
}
function force(s,key){
 return r.stepRound(s,o=>{const a=o.actions.find(x=>actionKey(x)===key);if(!a)throw Error('candidate missing');return a;});
}
function continuation(s,key,policy,seed,f){
 let first=true;
 const end=r.runRound(s,(o,st)=>{
  if(first){first=false;const a=o.actions.find(x=>actionKey(x)===key);if(!a)throw Error('candidate drift');return a;}
  return chooseBy(policy,o,{seed,turns:st.turns,player:st.currentPlayer});
 },{maxTurns:200});
 if(!end.outcome||end.outcome.kind==='unresolved')throw Error('unresolved');
 return{win:+(end.outcome.kind==='finish'&&end.outcome.playerIndex===f),
  pips:e.pipSum(end.hands[f]),minus:+(end.outcome.kind==='finish'&&end.outcome.playerIndex===f&&end.outcome.minus<0),
  block:+(end.outcome.kind==='block')};
}
function best(xs,tie=0){let k=tie;for(let i=0;i<xs.length;i++)if(xs[i]>xs[k]+EPS)k=i;return k;}
function analyze(seed){
 const p=locate(seed),s=p.s,before=JSON.stringify(s),f=s.currentPlayer,as=singles(s),keys=as.map(actionKey);
 const {all,valid,unseen}=worlds(p),q=[],actual=[];
 for(const key of keys){
  const after=force(s,key),forecast=post.forecast({unseen,handSize:s.hands[p.target].length,target:p.target,
   board:after.branchState,opening:after.openingState,passes:p.passes});
  const exact=ws=>ws.filter(w=>{
   const z=force(w,key);return d.turnOptions(z.branchState,z.openingState,z.hands[p.target],z.stock).phase==='pass';
  }).length/ws.length;
  if(Math.abs(forecast.unconditional-exact(all))>EPS||Math.abs(forecast.probability-exact(valid))>EPS)throw Error('forecast mismatch');
  q.push(forecast);
  actual.push(+(d.turnOptions(after.branchState,after.openingState,after.hands[p.target],after.stock).phase==='pass'));
 }
 const discarded=as.map(a=>e.pipSum([a.tile])),maxPips=best(discarded);
 const uniform=best(q.map(x=>x.unconditional),maxPips),history=best(q.map(x=>x.probability),uniform);
 let continuations=0;const scores={};
 for(const policy of policies){
  const sums=keys.map(()=>({win:0,pips:0,minus:0,block:0}));
  valid.forEach((w,j)=>keys.forEach((key,i)=>{
   const v=continuation(w,key,policy,90000000+1000*seed+j,f);continuations++;
   for(const m of Object.keys(v))sums[i][m]+=v[m]/valid.length;
  }));
  const bestWin=Math.max(...sums.map(x=>x.win)),minPips=Math.min(...sums.map(x=>x.pips)),maxMinus=Math.max(...sums.map(x=>x.minus));
  scores[policy]={historyMinusUniformWin:sums[history].win-sums[uniform].win,
   uniformMinusMaxPipsWin:sums[uniform].win-sums[maxPips].win,
   historyMinusMaxPipsWin:sums[history].win-sums[maxPips].win,
   uniformWinRegret:bestWin-sums[uniform].win,historyWinRegret:bestWin-sums[history].win,
   maxPipsWinRegret:bestWin-sums[maxPips].win,historyPipsRegret:sums[history].pips-minPips,
   historyMinusFinishRegret:maxMinus-sums[history].minus,historyWin:sums[history].win,
   maxPipsWin:sums[maxPips].win,actionScores:sums};
 }
 if(JSON.stringify(s)!==before)throw Error('state mutated');
 return{seed,turn:p.turn,target:p.target,passWitnesses:p.passes.length,
  handSizes:s.hands.map(h=>h.length),actionKeys:keys,discardedPips:discarded,
  allWorlds:all.length,compatibleWorlds:valid.length,continuations,
  actualNextPass:actual,uniformPass:q.map(x=>x.unconditional),historyPass:q.map(x=>x.probability),
  maxPips,uniform,history,strictReversal:history!==uniform,
  brierUniform:avg(actual.map((x,i)=>(x-q[i].unconditional)**2)),
  brierHistory:avg(actual.map((x,i)=>(x-q[i].probability)**2)),scores};
}
function run(){
 const rows=seeds.map(analyze),summary={positions:rows.length,
  exactHiddenAllocations:rows.reduce((n,x)=>n+x.allWorlds,0),
  historyCompatibleAllocations:rows.reduce((n,x)=>n+x.compatibleWorlds,0),
  candidateContinuations:rows.reduce((n,x)=>n+x.continuations,0),
  canonicalSingleActions:rows.reduce((n,x)=>n+x.actionKeys.length,0),
  changedForecasts:rows.filter(x=>x.historyPass.some((v,i)=>Math.abs(v-x.uniformPass[i])>EPS)).length,
  strictReversals:rows.filter(x=>x.strictReversal).length,
  brierUniform:avg(rows.map(x=>x.brierUniform)),brierHistory:avg(rows.map(x=>x.brierHistory)),policies:{}};
 for(const policy of policies){
  summary.policies[policy]={};
  for(const metric of ['historyMinusUniformWin','uniformMinusMaxPipsWin','historyMinusMaxPipsWin',
   'uniformWinRegret','historyWinRegret','maxPipsWinRegret','historyPipsRegret',
   'historyMinusFinishRegret','historyWin','maxPipsWin'])
   summary.policies[policy][metric]=avg(rows.map(x=>x.scores[policy][metric]));
 }
 return{schema:'qosa-multichoice-pass-value/v1',timestampAsiaBaku:new Date(Date.now()+4*3600000).toISOString().slice(0,19)+' +04:00',
  engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',discoverySeedRange:'2910000..2910181',
  discoveryPolicy:'min-hand-pips',selection:'first eligible position per deal; >=3 distinct playable ordinary tiles, <=6 opponent stones, next opponent has previous observed empty-stock pass; 35 eligible positions',
  selectedSeeds:seeds,policies,continuationSeedFormula:'90000000+1000*dealSeed+lexicographicCompatibleAllocationIndex',
  candidateRestriction:'one canonical side per distinct ordinary tile; other placements, doubles, mixed finishes excluded',
  tieRule:'pass-max with max-discarded-pips baseline; history retains unconditional winner on ties',
  regretDefinition:'in-sample hindsight best among evaluated canonical singles, NOT an actionable out-of-sample policy',
  newFullStrategyRounds:0,verifiedPriorFullStrategyRounds:180000,historicalSeparate:4000,
  summary,rows,
  limitations:'selected late-game states; exact uniform hidden allocations conditioned on target passes only; assumed branch opening; fixed bots; no block winner; canonical single actions only; not a causal human-play rule',
  next:'Seek independent strict posterior action reversals; compare direct win/pips/minus regret with nested hidden-world holdouts and isolate geometry.'};
}
function selfTest(){
 const a=analyze(seeds[0]),b=analyze(seeds[0]);
 if(JSON.stringify(a)!==JSON.stringify(b)||a.actionKeys.length!==3||a.allWorlds!==20||a.continuations!==180)throw Error('fixture/replay');
 return{passed:true,seed:a.seed,worlds:a.allWorlds,continuations:a.continuations};
}
if(require.main===module)console.log(JSON.stringify(process.argv[2]==='test'?selfTest():run(),null,2));
module.exports={seeds,singles,locate,worlds,analyze,run,selfTest};