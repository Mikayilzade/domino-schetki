# 2026-11-27 19:53 Asia/Baku — disjoint initial-deal double-count oracle

Engine qosha-research-0.5.3 / recovered qosa-1.0.0. Actual fetched engine.js executed in V8 CommonJS adapter; no native checkout or formal gate. 3x9+1. No strategy or gameplay rounds; branch unlocking, block allocation and loneZero remain provisional. Historical 180,000 matched-seat rounds separate.

Independent hypergeometric oracle P(K=k)=C(7,k)C(21,9-k)/C(28,9), for focal seat's raw nine stones before opening/redeal. Stock counts by double identity are diagnostics, not strategic value. Deterministic disjoint seed interval. Exact result:

```json
{
  "start": 27190000,
  "end": 27209999,
  "n": 20000,
  "checks": 60002,
  "unique": 20000,
  "counts": [
    841,
    4164,
    7060,
    5568,
    1975,
    363,
    29,
    0
  ],
  "expected": [
    0.04255599472990777,
    0.20623289753724536,
    0.35354211006384917,
    0.27497719671632714,
    0.10311644876862268,
    0.018197020370933414,
    0.0013479274348839566,
    0.000030404378230465186
  ],
  "maxDeviation": 0.004366448768622674,
  "stock": [
    710,
    750,
    728,
    692,
    709,
    706,
    737
  ]
}
```

Reproduction (Node, from simulator directory):
```js
function audit(e){const start=27190000,n=20000,counts=Array(8).fill(0),stock=Array(7).fill(0),seen=new Set();let checks=0;const ok=(x)=>{checks++;if(!x)throw Error('invariant '+checks)};for(let seed=start;seed<start+n;seed++){const d=e.dealThreeByNine(seed),all=[...d.hands.flat(),...d.stock];ok(new Set(all.map(e.tileKey)).size===28);ok(d.hands.every(h=>h.length===9)&&d.stock.length===1);ok(JSON.stringify(d)===JSON.stringify(e.dealThreeByNine(seed)));seen.add(JSON.stringify(d));const k=d.hands[0].filter(t=>t[0]===t[1]).length;counts[k]++;if(d.stock[0][0]===d.stock[0][1])stock[d.stock[0][0]]++;}const C=(n,k)=>{if(k<0||k>n)return 0;let a=1;for(let i=1;i<=k;i++)a=a*(n-i+1)/i;return a};const expected=counts.map((_,k)=>C(7,k)*C(21,9-k)/C(28,9));const maxDeviation=Math.max(...counts.map((v,k)=>Math.abs(v/n-expected[k])));ok(maxDeviation<0.02);ok(seen.size===n);return {start,end:start+n-1,n,checks,unique:seen.size,counts,expected,maxDeviation,stock};}
console.log(audit(require('./engine')));
```

Confidence: narrow distribution and conservation regression only, broad 2pp threshold not proof of uniform RNG. No win/remainder/round length/block/minus/regret or strategy metrics measured. Next: native pinned checkout and both gates, not another repeat of empirical hidden-world oracle. No PWA changes.
