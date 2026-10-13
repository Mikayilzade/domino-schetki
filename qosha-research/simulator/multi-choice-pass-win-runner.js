'use strict';
// Multi-choice exact-world holdout. All comparisons are restricted to legal SINGLE actions.
// Reproduce: node qosha-research/simulator/multi-choice-pass-win-runner.js test
//            node qosha-research/simulator/multi-choice-pass-win-runner.js
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const reg=require('./decision-regret'),hold=require('./two-opponent-conditional-holdout');
const exact=require('./next-pass-forecast-runner');
const POLICIES=['closed-branch-control','min-hand-pips','fast-doubles'],EPS=1e-12;
const avg=a=>a.reduce((s,x)=>s+x,0)/a.length;
function mix(n){let x=n>>>0;x=Math.imul(x^(x>>>16),0x7feb352d)>>>0;x=Math.imul(x^(x>>>15),0x846ca68b)>>>0;return(x^(x>>>16))>>>0;}
function folds(n,seed){const a=Array.from({length:n},(_,i)=>i).sort((x,y)=>mix(seed^Math.imul(x+1,0x9e3779b9))-mix(seed^Math.imul(y+1,0x9e3779b9))||x-y);return[a.slice(0,n>>1),a.slice(n>>1)];}
function pick(keys,scores,criterion){return keys.map((key,i)=>({key,i,s:scores[i]})).sort((a,b)=>criterion==='pass'?(b.s.pass-a.s.pass)||a.key.localeCompare(b.key):criterion==='pips'?(b.s.removed-a.s.removed)||a.key.localeCompare(b.key):(b.s.win-a.s.win)||(a.s.pips-b.s.pips)||(b.s.minus-a.s.minus)||a.key.localeCompare(b.key))[0].i;}
function stat(a){if(!a.length)return null;const m=avg(a),sd=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):0;return{n:a.length,mean:m,exploratoryCI95:a.length>1?[m-1.96*sd/Math.sqrt(a.length),m+1.96*sd/Math.sqrt(a.length)]:null};}
function run(start=2350000,end=2500000,limit=20,minWorlds=6){
 const found=hold.collect(start,end,limit*3),rows=[];let continuations=0;
 for(const p of found.out){if(rows.length>=limit)break;
  const s=p.state,orig=JSON.stringify(s),opts=d.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
  const acts=opts.actions.filter(a=>a.type==='single'),keys=acts.map(reg.actionKey);
  if(new Set(acts.map(a=>e.tileKey(a.tile))).size<3||keys.length<3||keys.length>9||s.stock.length)continue;
  const unseen=exact.pool(p),worlds=exact.worlds(p,unseen);if(worlds.length<minWorlds||worlds.length>80)continue;
  const pass=acts.map(a=>exact.forecast(p,a,unseen).prob),removed=acts.map(a=>e.pipSum([a.tile]));
  const passChoice=pick(keys,pass.map((v,i)=>({pass:v,removed:removed[i]})),'pass');
  const pipChoice=pick(keys,pass.map((v,i)=>({pass:v,removed:removed[i]})),'pips');
  const next=(s.currentPlayer+1)%3,empirical=Array(acts.length).fill(0);
  for(const w of worlds)for(let j=0;j<acts.length;j++){const after=r.stepRound(w,o=>o.actions.find(a=>reg.actionKey(a)===keys[j]));if(after.outcome)throw Error('unexpected immediate finish');empirical[j]+=+(d.turnOptions(after.branchState,after.openingState,after.hands[next],after.stock).phase==='pass');}
  for(let j=0;j<acts.length;j++)if(Math.abs(pass[j]-empirical[j]/worlds.length)>EPS)throw Error('exact pass forecast mismatch');
  const split=folds(worlds.length,p.seed),policy={};
  for(const pol of POLICIES){
   const v=worlds.map((w,i)=>{const ev=reg.evaluateDecisionInWorld(w,{focalPlayer:s.currentPlayer,continuationStrategy:pol,seed:61000000+1000*p.seed+i,maxTurns:200});if(ev.kind!=='paired-world')throw Error('unpaired');continuations+=ev.candidates.length;const m=new Map(ev.candidates.map(a=>[a.actionKey,a]));return keys.map(k=>{const z=m.get(k);if(!z||z.outcome==='unresolved')throw Error('unresolved');return{win:+z.focalFinishedFirst,pips:z.focalRemainder,minus:+(z.focalMinus<0)};});});
   const foldChoices=[],metrics={cvMinusPassWin:0,cvMinusPassPips:0,cvMinusPassMinus:0,passMinusPipWin:0,passWin:0,cvWin:0,pipWin:0};
   for(let f=0;f<2;f++){
    const train=split[1-f],scores=keys.map((key,j)=>({win:avg(train.map(i=>v[i][j].win)),pips:avg(train.map(i=>v[i][j].pips)),minus:avg(train.map(i=>v[i][j].minus))}));
    const cv=pick(keys,scores,'win');foldChoices.push(cv);
    for(const i of split[f]){
     const a=v[i][cv],b=v[i][passChoice],c=v[i][pipChoice];
     metrics.cvMinusPassWin+=a.win-b.win;metrics.cvMinusPassPips+=a.pips-b.pips;metrics.cvMinusPassMinus+=a.minus-b.minus;
     metrics.passMinusPipWin+=b.win-c.win;metrics.passWin+=b.win;metrics.cvWin+=a.win;metrics.pipWin+=c.win;
    }
   }
   for(const k of Object.keys(metrics))metrics[k]/=worlds.length;
   policy[pol]={foldChoices,metrics,allWorldActionMeans:keys.map((key,j)=>({key,win:avg(v.map(x=>x[j].win)),pips:avg(v.map(x=>x[j].pips)),minus:avg(v.map(x=>x[j].minus))}))};
  }
  if(JSON.stringify(s)!==orig)throw Error('source mutated');
  rows.push({seed:p.seed,turn:p.turn,worlds:worlds.length,consecutivePasses:s.consecutivePasses,handSizes:s.hands.map(h=>h.length),actions:keys.map((key,i)=>({key,pass:pass[i],removedPips:removed[i]})),passChoice,pipChoice,foldSizes:split.map(x=>x.length),policy});
 }
 const informative=rows.filter(x=>new Set(x.actions.map(a=>a.pass)).size>1),summary={positions:rows.length,passInformative:informative.length,worlds:rows.reduce((s,x)=>s+x.worlds,0),continuations,policy:{}};
 for(const pol of POLICIES){summary.policy[pol]={};for(const metric of ['cvMinusPassWin','cvMinusPassPips','cvMinusPassMinus','passMinusPipWin','passWin','cvWin','pipWin'])summary.policy[pol][metric]=stat(rows.map(x=>x.policy[pol].metrics[metric]));summary.policy[pol].cvVsPassDifferent=rows.filter(x=>x.policy[pol].foldChoices.some(j=>j!==x.passChoice)).length;}
 return{schema:'qosa-multichoice-pass-vs-win-cv/v1',timestampAsiaBaku:new Date(Date.now()+14400000).toISOString().slice(0,19)+' +04:00',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',start,end,limit,minWorlds,scannedDeals:found.scanned,selectedSeeds:rows.map(x=>x.seed),discovery:'min-hand-pips first eligible equal-pip connector control per deal, then >=3 distinct legal single tiles; selected sample, not representative of all states',continuationSeed:'61000000+1000*dealSeed+lexicographicAllocationIndex',policies:POLICIES,fullRoundsAdded:0,verifiedFullRounds:180000,summary,rows,limitations:'Uniform exact hidden allocations, not history-conditioned posterior. Only single actions, first eligible pattern, assumed branch opening, block winner unassigned, 3-11 world training folds often small, exploratory position-normal intervals; consecutivePasses is not full pass history.',next:'Validate 3+ candidate choices on non-pattern states and implement actual prior-pass observation filtering before any history-conditioned posterior claim.'};
}
function test(){const a=run(2350000,2370000,2,6),b=run(2350000,2370000,2,6);if(a.rows.length!==2||JSON.stringify(a.rows)!==JSON.stringify(b.rows))throw Error('determinism');return{passed:true,seeds:a.selectedSeeds,worlds:a.summary.worlds};}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(),null,2));}
module.exports={run,test};
