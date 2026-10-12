'use strict';
// Reproducible independent holdout; no scoreboard changes.
// node qosha-research/simulator/pass-history-holdout-replay.js
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),{matches}=require('./connector-other-matches');
const {chooseBy}=require('./strategy-runner'),{actionKey}=require('./decision-regret');
const post=require('./pass-history-posterior');
const seeds=[2402445,2405676,2415005,2417304,2428389,2441200,2441768,2447571,2450605,2453977,2456198,2462544,2464828,2468056,2470460];
const policies=['closed-branch-control','min-hand-pips','fast-doubles'];
const avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
function force(s,key){return r.stepRound(s,o=>{const a=o.actions.find(x=>actionKey(x)===key);if(!a)throw Error('forced action');return a;});}
function locate(seed){
 let s=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3}),passes=[[],[],[]];
 if(s.kind!=='ready')throw Error('init');
 while(!s.outcome&&s.turns<100){
  const target=(s.currentPlayer+1)%3,hit=matches(s);
  if(hit.length&&passes[target].length)return {s,target,pair:hit[0].pairs[0],passes:passes[target],turn:s.turns};
  const o=d.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
  if(o.phase==='pass'&&!s.stock.length)passes[s.currentPlayer].push({observed:true,sameRound:true,stockSize:0,player:s.currentPlayer,
    board:e.cloneBranchState(s.branchState),opening:e.cloneOpeningState(s.openingState)});
  s=r.stepRound(s,(o,st)=>chooseBy('min-hand-pips',o,{seed,turns:st.turns,player:st.currentPlayer}));
 }
 throw Error('seed not eligible '+seed);
}
function worlds(s,target,passes,unseen){
 const f=s.currentPlayer,opp=[0,1,2].filter(i=>i!==f),n=s.hands[opp[0]].length,all=[],valid=[];
 const forbidden=new Set();
 for(const p of passes)for(const t of unseen)if(d.actionsForHand(p.board,p.opening,[t]).length)forbidden.add(e.tileKey(t));
 function rec(start,ids){
  if(ids.length===n){const used=new Set(ids),w=r.cloneRoundState(s);
   w.hands[opp[0]]=ids.map(i=>unseen[i].slice());w.hands[opp[1]]=unseen.filter((t,i)=>!used.has(i)).map(t=>t.slice());
   all.push(w);if(w.hands[target].every(t=>!forbidden.has(e.tileKey(t))))valid.push(w);return;}
  for(let i=start;i<=unseen.length-(n-ids.length);i++)rec(i+1,[...ids,i]);
 }rec(0,[]);
 if(!valid.length)throw Error('no compatible worlds');
 const fp=h=>h.map(e.tileKey).sort().join(',');
 if(!valid.some(w=>w.hands.every((h,i)=>fp(h)===fp(s.hands[i]))))throw Error('real world excluded');
 return {all,valid};
}
function continuation(w,key,policy,seed,f){
 let first=true;const end=r.runRound(w,(o,st)=>{
  if(first){first=false;const a=o.actions.find(x=>actionKey(x)===key);if(!a)throw Error('candidate');return a;}
  return chooseBy(policy,o,{seed,turns:st.turns,player:st.currentPlayer});
 },{maxTurns:200});
 if(!end.outcome||end.outcome.kind==='unresolved')throw Error('unresolved');
 return {win:+(end.outcome.kind==='finish'&&end.outcome.playerIndex===f),
  pips:e.pipSum(end.hands[f]),minus:+(end.outcome.kind==='finish'&&end.outcome.playerIndex===f&&end.outcome.minus<0)};
}
function analyze(seed){
 const {s,target,pair,passes,turn}=locate(seed),f=s.currentPlayer,known=new Set(s.hands.flat().map(e.tileKey));
 const played=e.createDoubleSixDeck().filter(t=>!known.has(e.tileKey(t)));
 const focal=new Set([...played,...s.hands[f]].map(e.tileKey));
 const unseen=e.createDoubleSixDeck().filter(t=>!focal.has(e.tileKey(t)));
 const {all,valid}=worlds(s,target,passes,unseen),keys=[pair.connector,pair.other],probs=[],actual=[];
 for(const key of keys){
  const after=force(s,key),q=post.forecast({unseen,handSize:s.hands[target].length,target,
   board:after.branchState,opening:after.openingState,passes});
  const count=ws=>ws.filter(w=>{const z=force(w,key);return d.turnOptions(z.branchState,z.openingState,z.hands[target],z.stock).phase==='pass';}).length;
  if(Math.abs(q.unconditional-count(all)/all.length)>1e-12||Math.abs(q.probability-count(valid)/valid.length)>1e-12)throw Error('forecast mismatch');
  probs.push(q);actual.push(+(d.turnOptions(after.branchState,after.openingState,after.hands[target],after.stock).phase==='pass'));
 }
 const u=probs[0].unconditional>=probs[1].unconditional?0:1,h=probs[0].probability>=probs[1].probability?0:1;
 const scores={};for(const policy of policies){
  const v=[{win:0,pips:0,minus:0},{win:0,pips:0,minus:0}];
  valid.forEach((w,j)=>keys.forEach((key,i)=>{const z=continuation(w,key,policy,71000000+1000*seed+j,f);
   for(const m of ['win','pips','minus'])v[i][m]+=z[m]/valid.length;}));
  scores[policy]={connectorMinusOther:Object.fromEntries(['win','pips','minus'].map(m=>[m,v[0][m]-v[1][m]])),
   historyMinusUniform:Object.fromEntries(['win','pips','minus'].map(m=>[m,v[h][m]-v[u][m]]))};
 }
 return {seed,turn,target,passWitnesses:passes.length,allWorlds:all.length,compatibleWorlds:valid.length,
  continuations:valid.length*2*policies.length,pair,actualNextPass:actual,
  uniform:probs.map(x=>x.unconditional),conditioned:probs.map(x=>x.probability),
  brierUniform:avg(actual.map((x,i)=>(probs[i].unconditional-x)**2)),
  brierHistory:avg(actual.map((x,i)=>(probs[i].probability-x)**2)),
  preferredUniform:u,preferredHistory:h,changedChoice:u!==h,policy:scores};
}
function run(){
 const rows=seeds.map(analyze);
 const summary={positions:rows.length,exhaustiveWorlds:rows.reduce((s,x)=>s+x.allWorlds,0),
  compatibleWorlds:rows.reduce((s,x)=>s+x.compatibleWorlds,0),
  continuations:rows.reduce((s,x)=>s+x.continuations,0),
  changedPredictions:rows.filter(x=>x.conditioned.some((v,i)=>Math.abs(v-x.uniform[i])>1e-12)).length,
  changedChoices:rows.filter(x=>x.changedChoice).length,
  brierUniform:avg(rows.map(x=>x.brierUniform)),brierHistory:avg(rows.map(x=>x.brierHistory)),
  policy:Object.fromEntries(policies.map(k=>[k,{
   connectorMinusOtherWin:avg(rows.map(x=>x.policy[k].connectorMinusOther.win)),
   historyMinusUniformWin:avg(rows.map(x=>x.policy[k].historyMinusUniform.win))}]))};
 return {schema:'qosa-pass-history-holdout/v1',timestampAsiaBaku:new Date(Date.now()+14400000).toISOString().slice(0,19)+' +04:00',
  engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
  seedSearchRange:'2400000..2600000',selectedSeeds:seeds,selection:'first equal-pip connector-vs-other position after next opponent verified empty-stock pass; min-hand-pips discovery',
  worldSeedFormula:'71000000+1000*dealSeed+lexicographicAllocationIndex',continuationPolicies:policies,
  fullRoundsAdded:0,verifiedFullRounds:180000,summary,rows,
  limitations:'Uniform unseen allocations conditioned only on observed next-opponent passes; selected sample; fixed bot policies; assumed branch semantics; block winner unassigned; no causal win claim.',
  next:'Fresh seeds 2600000..2900000; target positions where posterior changes move choice; matched win regret.'};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run,analyze,seeds};