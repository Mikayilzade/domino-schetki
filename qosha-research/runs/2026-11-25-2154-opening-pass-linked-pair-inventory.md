# 2026-11-25 21:54 Asia/Baku — forced opening pass: opponent linked-pair inventory
Rules: recovered qosa-1.0.0 opening only; reference gameplay engine qosha-research-0.5.3 not executed. Exact enumeration in JS isolate, 3×9+1. Read README, RULES, EXPERIMENTS, RESULTS, STATUS and relevant opening oracles. Repository status reports incomplete executable checkout; no claim of green validation.

Condition on starter owning 1-1 and having no other 1 after mandatory draw. Six connectors 1-x reside among the opponents' 18 tiles. Let d be the number of corresponding x-x doubles also in that pool (known from own hand). For each d, label the d disjoint connector-double pairs and enumerate all C(18,9)=48,620 seat allocations. A linked pair means both stones in the same opponent hand, not a legal sequence. Uniform allocations conditional on known inventory; no behavioral likelihood.

|d|Neither opponent has pair|Both have pair|Next opponent has pair|
|---:|---:|---:|---:|
|0|48620|0|0|
|1|25740|0|11440|
|2|13728|6864|20878|
|3|7392|15840|28534|
|4|4032|24648|34618|
|5|2240|32280|39330|
|6|1280|38380|42860|

All denominators 48620; 340340 enumerated allocations across seven separate strata, not independent gameplay samples. Mass and seat symmetry checked in JS. With d=4, both opponents have at least one linked pair in 50.69% of allocations; next opponent in 71.20%. This is inventory risk, not win/minus probability. Branch unlocking, block allocation, loneZero irrelevant to this count.

Gameplay deals 0; seeds none; strategies none; gameplay/hidden-world gates not executed. Win, remainder, length, block, minus, regret not measured. Historical 180000 matched-seat rounds remain separate legacy subtotal; no new gameplay added. Next: recover complete verified checkout and run gates; compare legal continuation of linked pairs under matched hidden worlds. No live files changed.

Reproduction (same enumeration as executed; Node wrapper not executed):
```js
// Exact enumeration; run with node. No gameplay engine dependency.
const assert=require('node:assert/strict');
const rows=[];
for(let d=0;d<=6;d++){
 const counts=Array.from({length:7},()=>Array(7).fill(0));let n=0;
 for(let m=0;m<1<<18;m++){
  let k=0;for(let x=m;x;x&=x-1)k++;
  if(k!==9)continue;
  let a=0,b=0;
  for(let j=0;j<d;j++){let c=(m>>j)&1,t=(m>>(6+j))&1;if(c&&t)a++;if(!c&&!t)b++;}
  counts[a][b]++;n++;
 }
 assert.equal(n,48620);
 for(let a=0;a<=6;a++)for(let b=0;b<=6;b++)assert.equal(counts[a][b],counts[b][a]);
 rows.push({d,n,neither:counts[0][0],both:counts.slice(1).reduce((s,r)=>s+r.slice(1).reduce((a,b)=>a+b,0),0),nextHas:n-counts[0].reduce((a,b)=>a+b,0),counts});
}
console.log(JSON.stringify(rows,null,2));
```
