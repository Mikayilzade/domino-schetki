# 2026-11-18 00:50 Asia/Baku — exact opening choice-set oracle

- Engine reference: `qosha-research-0.5.3`; recovered rules `qosa-1.0.0`, primary 3 players × 9 tiles, one stock tile. This is **not a gameplay-engine simulation**.
- Conditional experiment: starter holds 1-1; its eight other hand tiles plus the mandatory stock tile are an exchangeable uniform 9-subset of the remaining 27 tiles. Exactly six are ordinary 1-x tiles, x=0,2,3,4,5,6. For numerical comparison, their **other-end pip values** are [0,2,3,4,5,6], not [1,2,3,4,5,6].
- Seed set: none (exact weighted enumeration of 64 possible connector subsets); strategies: *choose highest other-end pip* versus *uniform random connector* for the **immediate tile-pip reduction only**. This metric does not represent game winning probability or long-term strategic quality.
- Important correction to the numeric experiment: the six ordinary 1-x connectors are 1-0, 1-2, 1-3, 1-4, 1-5, 1-6. Their other-end values are [0,2,3,4,5,6]. Do not treat 1-1 as another playable ordinary connector after it has opened the round.
- Exact method: for each subset S of these six connectors with k members, weight = C(21,9-k)/C(27,9). Sum weights over all 64 subsets; for k>=2 compute max(S) - mean(S). The difference is identical for full tile pip totals (1+x), because the common +1 cancels. Exact expected immediate advantage of choosing the highest-pip connector over a uniformly chosen available connector is **1.1075531232052973 pips per opening** (counting zero when fewer than two options), or **1.6365010432577594 pips conditional on at least two options**. These are immediate hand-pip reductions, not expected final scores.
- P(at least two legal ordinary 1-x follow-ups after mandatory stock draw) = **0.676781189824668**. This is an exact opening opportunity rate, not a strategy win rate.
- To reproduce without any simulator imports: run the JavaScript below in Node.

```js
const C=(n,k)=>{if(k<0||k>n)return 0;let z=1;for(let i=1;i<=k;i++)z=z*(n-i+1)/i;return z};
const values=[0,2,3,4,5,6], denominator=C(27,9);
let mass=0, pMulti=0, improvement=0;
for(let mask=0;mask<64;mask++){
  const s=values.filter((_,i)=>mask&(1<<i));
  const w=C(21,9-s.length)/denominator;
  mass+=w;
  if(s.length>=2){
    pMulti+=w;
    improvement+=w*(Math.max(...s)-s.reduce((a,b)=>a+b,0)/s.length);
  }
}
console.log({mass,pMulti,improvement,conditionalImprovement:improvement/pMulti});
if(Math.abs(mass-1)>1e-12 || Math.abs(pMulti-0.6767811898246681)>1e-12)throw Error('oracle mismatch');
```

- Gameplay deals: **0**; hidden worlds **0**; rollouts **0**; full gameplay validation **0/17**, hidden-world validation **0/4** executed this pass. Win rate, remaining pips, length, blocks, minus, double retention, branch effects and regret not measured. Historical 180,000 matched-seat rounds are separate legacy evidence.
- Confidence: exact combinatorial probability under uniform deal; immediate choice metric is exact under its narrow definition; **no validated strategy superiority**. Branch unlock, block scoring and loneZero remain provisional.
- Exact next action: execute the self-contained oracle, reconstruct the complete immutable simulator tree from GitHub, run SHA/size preflight and both validation gates and fingerprint replays, then compare high-pip and branch-control policies on matched opening deals with actual continuation rollouts. Do not modify live PWA or create Actions.
