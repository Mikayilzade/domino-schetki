'use strict';
// Reproduce: node qosha-research/simulator/pass-vs-win-cv-replay.js
const d=require('./turn-dispatcher'),reg=require('./decision-regret');
const hold=require('./two-opponent-conditional-holdout'),exact=require('./next-pass-forecast-runner');
const P=['closed-branch-control','min-hand-pips','fast-doubles'],EPS=1e-12;
const mean=a=>a.reduce((s,v)=>s+v,0)/a.length;
function mix(n){let x=n>>>0;x=Math.imul(x^(x>>>16),0x7feb352d)>>>0;x=Math.imul(x^(x>>>15),0x846ca68b)>>>0;return(x^(x>>>16))>>>0;}
function folds(n,seed){const a=Array.from({length:n},(_,i)=>i).sort((x,y)=>mix(seed^Math.imul(x+1,0x9e3779b9))-mix(seed^Math.imul(y+1,0x9e3779b9))||x-y);return[a.slice(0,n>>1),a.slice(n>>1)];}
function choose(v,keys){const a=[0,1].map(i=>({i,w:mean(v.map(x=>x[i].win)),p:mean(v.map(x=>x[i].pips)),m:mean(v.map(x=>x[i].minus))}));a.sort((x,y)=>(y.w-x.w)||(x.p-y.p)||(y.m-x.m)||keys[x.i].localeCompare(keys[y.i]));return a[0].i;}
function run(start=2080000,end=2200000,limit=40,minWorlds=6){
 const found=hold.collect(start,end,limit*2),rows=[];let continuations=0;
 for(const p of found.out){if(rows.length>=limit)break;
  const ws=exact.worlds(p,exact.pool(p));if(ws.length<minWorlds)continue;
  const s=p.state,orig=JSON.stringify(s),opts=d.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
  const by=new Map(opts.actions.map(a=>[reg.actionKey(a),a])),keys=[p.pair.connector,p.pair.other];
  const probs=keys.map(k=>exact.forecast(p,by.get(k),exact.pool(p)).prob),passChoice=probs[0]>probs[1]+EPS?0:1;
  const split=folds(ws.length,p.seed),policy={};
  for(const pol of P){const v=[];
   ws.forEach((w,i)=>{const ev=reg.evaluateDecisionInWorld(w,{focalPlayer:s.currentPlayer,continuationStrategy:pol,seed:61000000+1000*p.seed+i,maxTurns:200});
    if(ev.kind!=='paired-world')throw Error('unpaired');continuations+=ev.candidates.length;
    const m=new Map(ev.candidates.map(a=>[a.actionKey,a]));v.push(keys.map(k=>{const z=m.get(k);if(!z||z.outcome==='unresolved')throw Error('unresolved');return{win:+z.focalFinishedFirst,pips:z.focalRemainder,minus:+(z.focalMinus<0)};}));});
   const metric={win:0,pips:0,minus:0,passWin:0,cvRegret:0,passRegret:0},choices=[];
   for(let f=0;f<2;f++){const pick=choose(split[1-f].map(i=>v[i]),keys);choices.push(pick);
    for(const i of split[f]){const x=v[i];metric.win+=x[pick].win-x[passChoice].win;metric.pips+=x[pick].pips-x[passChoice].pips;metric.minus+=x[pick].minus-x[passChoice].minus;metric.passWin+=x[passChoice].win;metric.cvRegret+=Math.max(x[0].win,x[1].win)-x[pick].win;metric.passRegret+=Math.max(x[0].win,x[1].win)-x[passChoice].win;}}
   for(const k of Object.keys(metric))metric[k]/=ws.length;
   policy[pol]={foldChoices:choices,cvMinusPassWin:metric.win,cvMinusPassPips:metric.pips,cvMinusPassMinus:metric.minus,passWin:metric.passWin,cvRegret:metric.cvRegret,passRegret:metric.passRegret};
  }
  if(JSON.stringify(s)!==orig)throw Error('source mutated');
  rows.push({seed:p.seed,turn:p.turn,worlds:ws.length,nextHandSize:s.hands[(s.currentPlayer+1)%3].length,pair:p.pair,passProbability:probs,passDelta:probs[0]-probs[1],passChoice,foldSizes:split.map(x=>x.length),policy});
 }
 return {scanned:found.scanned,worlds:rows.reduce((n,x)=>n+x.worlds,0),continuations,rows};
}
function test(){const a=run(2080000,2100000,2,6),b=run(2080000,2100000,2,6);if(JSON.stringify(a)!==JSON.stringify(b)||a.rows[0].seed!==2080132||a.rows[1].seed!==2080432)throw Error('replay');return{passed:true,seeds:a.rows.map(x=>x.seed)};}
if(require.main===module)console.log(JSON.stringify(process.argv[2]==='test'?test():run(),null,2));
module.exports={run,test};
