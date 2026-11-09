# Opening invariants — independently executed audit (2026-11-09 10:51 Asia/Baku)

**Scope:** recovered `qosa-1.0.0`, 3 players × 9 stones, confirmed opening with 1–1. Standalone audit, **not** a validated branch/multi-double simulator. Engine version: `opening-audit-1.0.0`.

- Deterministic seed: `0x51a2026` (decimal 85598246); 50,000 deals. Fisher–Yates over lexicographically enumerated double-six stones (a=0..6, b=a..6); xorshift32 RNG, next random = unsigned state / 2^32. Each draw uses a continuing PRNG stream, not a per-deal reseed.
- 1–1 in initial stock: **1,784 / 50,000** (first-round redeal); in one of the three hands: **48,216 / 50,000**.
- All 48,216 in-hand starts passed uniqueness, 28-tile conservation, removal of opening 1–1, replacement by the sole stock tile, hand-size and opponent-hand-size assertions.
- Number of 1-connected follow-up tiles in starter's post-draw hand: `0:3036, 1:12609, 2:17987, 3:11047, 4:3112, 5:411, 6:14`. **3,036 / 48,216 = 6.30%** have no immediate 1-connected follow-up and must pass under the confirmed rule.
- All unplayed doubles absent from the starter's post-draw hand were found in exactly one opponent hand, as required by empty-stock conservation.
- Exploratory first-two-sorted-unseen-double pairs (not unbiased fixed-pair sampling): eligible 47,824; same opponent 22,427; different opponents 25,397. **Do not interpret as a causal strategy result.**

## Reproduction

Run the following dependency-free Node.js snippet (Node 22 used for this checkpoint):

```js
const assert=require('node:assert/strict');
const tiles=[];for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)tiles.push(a+'-'+b);
let x=0x51a2026,counts={stock:0,hand:0},hist={};
function rnd(){x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;}
for(let i=0;i<50000;i++){
 const d=tiles.slice();for(let j=27;j>0;j--){const k=Math.floor(rnd()*(j+1));[d[j],d[k]]=[d[k],d[j]];}
 const h=[d.slice(0,9),d.slice(9,18),d.slice(18,27)],s=d[27];
 assert.equal(new Set([...h.flat(),s]).size,28);
 const p=h.findIndex(a=>a.includes('1-1'));
 if(p<0){assert.equal(s,'1-1');counts.stock++;continue;}
 counts.hand++;assert.notEqual(s,'1-1');
 h[p].splice(h[p].indexOf('1-1'),1);h[p].push(s);
 assert.equal(h[p].length,9);
 assert.equal(new Set([...h.flat(),'1-1']).size,28);
 const n=h[p].filter(t=>t.split('-').includes('1')).length;hist[n]=(hist[n]||0)+1;
 for(const z of [0,2,3,4,5,6].map(v=>v+'-'+v).filter(t=>!h[p].includes(t)))
   assert.equal(h.filter(a=>a.includes(z)).length,1);
}
console.log({counts,hist});
```

**Execution evidence:** local Node.js v22.16.0, completed with no assertion failures; expected `counts={stock:1784,hand:48216}` and `hist={0:3036,1:12609,2:17987,3:11047,4:3112,5:411,6:14}`.

**Strategies:** none. Win/first-place, remaining pips, block, minus, regret: not measured. **Full engine validation: 0/17 suites executed**; this independent opening audit does not change that status. Historical 180,000 matched-seat rounds are a separate legacy subtotal, not mixed with these 50,000 dealt hands.

**New finding:** 6.30% of in-hand 1–1 starts have no legal immediate 1-follow-up after the required draw, confirming that opening-pass handling is not merely an edge case. Confidence high for this standalone deterministic opening sample; branch and block rules remain provisional.

**Exact next action:** obtain executable GitHub checkout, run `validation-gate.js` and fingerprint replay, archive real JSON outputs, repair failures, then resume matched-seed strategy comparisons. GitHub shell DNS still fails; connector source access works. No PWA files touched.
