'use strict';
// Reproduce: node qosha-research/simulator/equal-pip-control.js 1075000 9000 20 30
const e=require('./engine'),r=require('./round-driver'),i=require('./initializer'),m=require('./connector-other-matches'),h=require('./hidden-world');
const {chooseBy}=require('./strategy-runner'),{forced}=require('./pass-pip-decision-strata');
const POL=['closed-branch-control','moderate-double-hold'];
function find(seed){let s=i.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});while(!s.outcome&&s.turns<200){const a=m.matches(s);if(a.length)return{s,seed,seat:s.currentPlayer,pair:a[0].pairs[0],x:a[0].x};s=r.stepRound(s,(o,v)=>chooseBy('closed-branch-control',o,{seed,turns:v.turns,player:v.currentPlayer}));}if(!s.outcome)throw Error('unresolved');return null;}
function evaluate(c,n){const s=c.s,live=new Set([...s.hands.flat(),...s.stock].map(e.tileKey)),spec={visibleState:s,focalPlayer:c.seat,focalHand:s.hands[c.seat],knownTiles:e.createDoubleSixDeck().filter(t=>!live.has(e.tileKey(t))),hiddenHandSizes:s.hands.map(x=>x.length),stockSize:s.stock.length},diff=Object.fromEntries(POL.map(p=>[p,[]]));const before=JSON.stringify(s);
for(let k=0;k<n;k++){const ws=(Math.imul(c.seed,1009)+Math.imul(c.seat+1,1000003)+k+19000000)>>>0,w=h.sampleWorld(spec,ws),copy=JSON.stringify(w);
for(const p of POL){const a=forced(w,c.pair.connector,p,ws),b=forced(w,c.pair.other,p,ws);diff[p].push(Object.fromEntries(['first','pips','minus','block','turns'].map(x=>[x,a[x]-b[x]])));}
if(JSON.stringify(w)!==copy)throw Error('world mutated');}if(JSON.stringify(s)!==before)throw Error('state mutated');
return{seed:c.seed,seat:c.seat,turn:s.turns,x:c.x,connector:c.pair.connector,other:c.pair.other,pips:c.pair.pips,byPolicy:Object.fromEntries(POL.map(p=>[p,Object.fromEntries(['first','pips','minus','block','turns'].map(k=>[k,diff[p].reduce((v,x)=>v+x[k],0)/n]))]))};}
function run(start=1075000,scan=9000,limit=20,worlds=30){const positions=[];let scanned=0;for(let seed=start;seed<start+scan&&positions.length<limit;seed++){scanned++;const c=find(seed);if(c)positions.push(evaluate(c,worlds));}
const summary=Object.fromEntries(POL.map(p=>[p,Object.fromEntries(['first','pips','minus','block','turns'].map(k=>{const a=positions.map(x=>x.byPolicy[p][k]),n=a.length,mean=a.reduce((s,x)=>s+x,0)/n,se=Math.sqrt(a.reduce((s,x)=>s+(x-mean)**2,0)/(n*(n-1)));return[k,{mean,ci95:[mean-1.96*se,mean+1.96*se]}];}))]));
return{engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',start,scanned,selected:positions.length,worlds:positions.length*worlds,continuations:positions.length*worlds*4,summary,positions};}
if(require.main===module){const a=process.argv.slice(2).map(Number);console.log(JSON.stringify(run(...a),null,2));}
module.exports={find,evaluate,run};
