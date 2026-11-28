# Exact allocation composition audit — 2026-11-28 10:49 Asia/Baku

Engine qosha-research-0.5.3; recovered qosa-1.0.0. Source blobs engine.js 82e5bd544a57683d5b4f7812beb2d4abf80da894 and hidden-world-enumeration.js 06c3019e8581363c448244367d69bcb13c8432eb. Executed actual fetched modules in isolated V8 CommonJS adapter; no native Node gate or crypto hash ranking executed.

165 specifications, 9,841 exact allocations, 20,177 checks passed. Includes empty pool and empty seat/stock slots. Every allocation conserved the exact pool, had correct seat/stock sizes, and was unique within its specification. Reversing input pool order preserved the entire ordered fingerprint sequence. Counts independently compared with factorial multinomial formula. No seed needed, exact enumeration. No gameplay deals, strategy policies or rollouts; win, remainder, length, block, minus, double, branch and regret metrics not measured. Historical 180,000 matched-seat rounds separate. No strategic conclusion; high confidence in this bounded allocator contract only. Branch unlocking, block allocation and loneZero remain provisional.

Reproduce from simulator directory in Node or equivalent CommonJS adapter:

```js
const engine=require('./engine'), en=require('./hidden-world-enumeration');
let specs=0,worlds=0,checks=0;
const check=x=>{checks++;if(!x)throw Error('failed '+specs)};
const deck=engine.createDoubleSixDeck();
for(let n=0;n<=8;n++)for(let i=0;i<=n;i++)for(let j=0;j<=n-i;j++){
 let k=n-i-j,spec={pool:deck.slice(0,n),hiddenHandSizes:[i,j],stockSize:k};
 let w=en.enumerateAllocations(spec);specs++;worlds+=w.length;
 let expected=1;for(let t=1;t<=n;t++)expected*=t;
 for(let s of [i,j,k])for(let t=1;t<=s;t++)expected/=t;
 check(w.length===Math.round(expected));
 check(new Set(w.map(en.allocationFingerprint)).size===w.length);
 let target=spec.pool.map(engine.tileKey).sort().join(',');
 for(let v of w){
  check(v.hiddenHands[0].length===i&&v.hiddenHands[1].length===j&&v.stock.length===k);
  check([...v.hiddenHands.flat(),...v.stock].map(engine.tileKey).sort().join(',')===target);
 }
 let rev=en.enumerateAllocations({...spec,pool:spec.pool.slice().reverse()});
 check(JSON.stringify(w.map(en.allocationFingerprint))===JSON.stringify(rev.map(en.allocationFingerprint)));
}
console.log({specs,worlds,checks});
```

Next: complete SHA-verified native checkout, execute preflight, 17+4 gates and fingerprint replays. Specifically verify actual SHA-256 ranked subset in native Node; this audit does not substitute for that suite. No live PWA or Actions changes.
