# Hidden connector Monte Carlo oracle

{
  "timestamp": "2026-11-28T12:53:56+04:00",
  "engine": "isolated hidden-world shuffle oracle; qosha-research-0.5.3 source",
  "rules": "qosa-1.0.0; uniform 9+9 hidden allocation, empty stock",
  "sourceBlob": "6d4d2c3d693a3d9b66a3d21c7f0d65474292a3e2",
  "gameplayDeals": 0,
  "strategies": [],
  "n": 100000,
  "start": 29000000,
  "end": 29099999,
  "counts": [
    0,
    53070,
    26382
  ],
  "owners": [
    50108,
    49892,
    0
  ],
  "expected": [
    null,
    0.5294117647058824,
    0.2647058823529412
  ],
  "observed": [
    0,
    0.5307,
    0.26382
  ],
  "limitations": "Conditional on double in either opponent hand; no pass history, no legal moves or scoring. Not full engine validation. Historical 180000 legacy rounds separate.",
  "next": "Recover complete checkout; run preflight and both gates; then test pass-conditioned connector availability."
}

Reproduction (Node.js or JS runtime):
```js
function mixSeed(seed){let x=Number(seed)>>>0;x=(x+0x9e3779b9)>>>0;x=Math.imul(x^(x>>>16),0x21f0aaad)>>>0;x=Math.imul(x^(x>>>15),0x735a2d97)>>>0;return (x^(x>>>15))>>>0;}
function rng(seed){let x=mixSeed(seed)||0x9e3779b9;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};}
function shuffle(xs,seed){const a=xs.slice(),r=rng(seed);for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function run(){const n=100000,start=29000000;const counts=[0,0,0],owners=[0,0,0];for(let seed=start;seed<start+n;seed++){const a=shuffle(Array.from({length:18},(_,i)=>i),seed);const owner=a.indexOf(0)<9?0:1;const h=a.slice(owner*9,owner*9+9);owners[owner]++;for(let k=1;k<=2;k++)if(!h.some(x=>x>=1&&x<=k))counts[k]++;}return {n,start,end:start+n-1,counts,owners,expected:[null,9/17,9*8/(17*16)],observed:counts.map(x=>x/n)};}
console.log(run());
```
