'use strict';
const old=require('./endpoint-side-matched-holdout'),b=require('./connector-gap-pressure'),e=require('./engine');
const ds=[['closed-branch-control',138000,140000],['min-hand-pips',140000,142000]],ps=['closed-branch-control','min-hand-pips','fast-doubles'];
function key(p){const h=p.state.hands,f=p.focal;return[p.x,p.gap,p.hand,h[(f+1)%3].length,h[(f+2)%3].length,p.choice.side].join(':');}
function hash(s){let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return e.mixSeed32(h>>>0);}
function match(rows,n){const g={};for(const p of rows){const k=key(p);(g[k]||(g[k]={high:[],low:[]}))[p.endpoint].push(p);}const ks=Object.keys(g).filter(k=>g[k].high.length&&g[k].low.length).sort((a,b)=>hash(a)-hash(b)||a.localeCompare(b)),out=[];for(let j=0;out.length<n;j++){let ok=false;for(const k of ks){if(g[k].high[j]&&g[k].low[j]){out.push([g[k].high[j],g[k].low[j]]);ok=true;if(out.length===n)break;}}if(!ok)break;}if(out.length!==n||out.some(([a,b])=>key(a)!==key(b)))throw Error('match');return out;}
function stat(xs){const n=xs.length,m=xs.reduce((a,b)=>a+b,0)/n,h=1.96*Math.sqrt(xs.reduce((a,b)=>a+(b-m)**2,0)/(n-1)/n);return{mean:m,ci95:[m-h,m+h]};}
function run(n=32,w=25){const o={engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',newWorlds:4*n*w,priorWorlds:48410,continuations:0,seeds:{},summary:{}};for(const [d,a,z] of ds){const pairs=match(old.scan(d,a,z),n);o.seeds[d]=pairs.map(([h,l])=>[h.seed,l.seed]);o.summary[d]={};for(const p of ps){const rows=pairs.map(([h,l])=>{const x=b.analyze(h,w,p),y=b.analyze(l,w,p);o.continuations+=x.continuations+y.continuations;return Object.fromEntries(['finish','pips','minus'].map(k=>[k,x.keepHighMinusLow[k]-y.keepHighMinusLow[k]]));});o.summary[d][p]=Object.fromEntries(['finish','pips','minus'].map(k=>[k,stat(rows.map(r=>r[k]))]));}}return o;}
if(require.main===module)console.log(JSON.stringify(run(Number(process.argv[2]||32),Number(process.argv[3]||25)),null,2));
module.exports={key,match,run};
