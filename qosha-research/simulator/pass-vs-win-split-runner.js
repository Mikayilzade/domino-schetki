'use strict';
// Deterministic out-of-sample train/test comparison, 3x9 exact hidden worlds.
// node qosha-research/simulator/pass-vs-win-split-runner.js test
// node qosha-research/simulator/pass-vs-win-split-runner.js 2080000 2240000 60
const hold=require('./two-opponent-conditional-holdout'),next=require('./next-pass-forecast-runner');
const hw=require('./hidden-world'),d=require('./turn-dispatcher'),reg=require('./decision-regret');
const policies=['closed-branch-control','min-hand-pips','fast-doubles'];
const avg=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:null;
function stat(a){if(!a.length)return null;const m=avg(a),sd=a.length>1?Math.sqrt(a.reduce((s,v)=>s+(v-m)**2,0)/(a.length-1)):0;
 return {n:a.length,mean:m,ci95:a.length>1?[m-1.96*sd/Math.sqrt(a.length),m+1.96*sd/Math.sqrt(a.length)]:null};}
function analyze(p){
 const s=p.state,original=JSON.stringify(s),opts=d.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
 const map=new Map(opts.actions.map(a=>[reg.actionKey(a),a]));
 const actions=[map.get(p.pair.connector),map.get(p.pair.other)];
 if(actions.some(a=>!a||a.type!=='single'))throw Error('invalid pair');
 const unseen=next.pool(p),f=actions.map(a=>next.forecast(p,a,unseen)),worlds=next.worlds(p,unseen);
 if(worlds.length<2)throw Error('too few worlds');
 const order=worlds.map((_,i)=>i).sort((a,b)=>hw.mixSeed((p.seed^a)>>>0)-hw.mixSeed((p.seed^b)>>>0));
 const train=new Set(order.slice(0,Math.floor(worlds.length/2)));
 const data=Object.fromEntries(policies.map(k=>[k,{train:[],test:[]}]));
 let continuations=0;
 for(let i=0;i<worlds.length;i++)for(const k of policies){
  const ev=reg.evaluateDecisionInWorld(worlds[i],{focalPlayer:s.currentPlayer,continuationStrategy:k,seed:67000000+1000*p.seed+i,maxTurns:200});
  if(ev.kind!=='paired-world')throw Error('not paired');continuations+=ev.candidates.length;
  const m=new Map(ev.candidates.map(x=>[x.actionKey,x]));
  const pair=actions.map(a=>m.get(reg.actionKey(a)));
  if(pair.some(x=>!x||x.outcome==='unresolved'))throw Error('unresolved');
  data[k][train.has(i)?'train':'test'].push(pair.map(x=>({win:+x.focalFinishedFirst,pips:x.focalRemainder,minus:+(x.focalMinus<0)})));
 }
 if(JSON.stringify(s)!==original)throw Error('mutated state');
 const passDelta=f[0].prob-f[1].prob,pass=passDelta>1e-12?0:passDelta< -1e-12?1:null,results={};
 for(const k of policies){
  const t=data[k].train,h=data[k].test;
  const tw=[0,1].map(i=>avg(t.map(z=>z[i].win))),hwins=[0,1].map(i=>avg(h.map(z=>z[i].win)));
  const learned=tw[0]>tw[1]+1e-12?0:tw[1]>tw[0]+1e-12?1:(pass??0);
  const value=i=>({win:hwins[i],pips:avg(h.map(z=>z[i].pips)),minus:avg(h.map(z=>z[i].minus)),regret:Math.max(...hwins)-hwins[i]});
  const a=value(learned),b=pass===null?null:value(pass);
  results[k]={learned,pass,changed:pass!==null&&learned!==pass,trainWins:tw,testWins:hwins,
   trainAdv:pass===null?null:tw[learned]-tw[pass],passTest:b,learnedTest:a,
   delta:b?{win:a.win-b.win,pips:a.pips-b.pips,minus:a.minus-b.minus}:null};
 }
 return {seed:p.seed,turn:p.turn,nextHandSize:s.hands[(s.currentPlayer+1)%3].length,worlds:worlds.length,
  trainWorlds:train.size,testWorlds:worlds.length-train.size,continuations,passDelta,forecast:f,policy:results};
}
function run(start=2080000,end=2240000,limit=60){
 const found=hold.collect(start,end,limit),rows=found.out.map(analyze);
 const valid=rows.filter(x=>x.worlds>=4&&Math.abs(x.passDelta)>1e-12),pol={};
 for(const k of policies){const v=valid.map(x=>x.policy[k]);pol[k]={
  changed:v.filter(x=>x.changed).length,
  trainAdv:stat(v.map(x=>x.trainAdv)),testWinAdv:stat(v.map(x=>x.delta.win)),
  testPipsDelta:stat(v.map(x=>x.delta.pips)),testMinusDelta:stat(v.map(x=>x.delta.minus)),
  passOracleRegret:stat(v.map(x=>x.passTest.regret)),learnedOracleRegret:stat(v.map(x=>x.learnedTest.regret)),
  changedOnlyTestWinAdv:stat(v.filter(x=>x.changed).map(x=>x.delta.win))};}
 return {schema:'qosa-pass-vs-win-split/v1',timestampAsiaBaku:new Date(Date.now()+14400000).toISOString().slice(0,19)+' +04:00',
  engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',start,end,limit,
  scannedDeals:found.scanned,positions:rows.length,selectedSeeds:rows.map(x=>x.seed),
  exactAllocations:rows.reduce((n,x)=>n+x.worlds,0),continuations:rows.reduce((n,x)=>n+x.continuations,0),
  newFullStrategyRounds:0,verifiedPriorFullStrategyRounds:180000,
  seedFormula:'67000000+1000*dealSeed+lexicographicAllocationIndex',
  split:'sort allocation indices by mixSeed(dealSeed XOR index), floor(n/2) train, rest test; train win ties prefer analytic higher-pass choice',
  selection:'first eligible equal-pip connector versus unrelated single, min-hand-pips discovery',
  policies,summary:{informativePositions:valid.length,excludedFewWorlds:rows.filter(x=>x.worlds<4).length,
   excludedPassTies:rows.filter(x=>x.worlds>=4&&Math.abs(x.passDelta)<=1e-12).length,policies:pol},rows,
  limitations:'Uniform hidden allocations not conditioned on prior observed opponent actions; small train/test split, deterministic bots, first-eligible selection, assumed branch semantics, block winner unassigned, exploratory position CIs. Oracle regret diagnostic, not deployable.',
  next:'fresh >=8-world positions, cross-fitted learned-win versus analytic next-pass; track decision changes and minus outcomes.'};
}
function test(){const a=run(2080000,2100000,3),b=run(2080000,2100000,3);
 if(a.positions!==3||JSON.stringify(a.rows)!==JSON.stringify(b.rows)||a.rows.some(x=>x.trainWorlds+x.testWorlds!==x.worlds))throw Error('regression');
 return {passed:true,seeds:a.selectedSeeds,worlds:a.exactAllocations};}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||2080000),+(a[1]||2240000),+(a[2]||60)),null,2));}
module.exports={run,test,analyze,stat};
