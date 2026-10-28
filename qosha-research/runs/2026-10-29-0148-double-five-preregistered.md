# 2026-10-29 01:48 (+04 Asia/Baku) — pre-registered 5-5 predictor, third disjoint exact cohort

- **Engine/rules:** `qosa-research-0.5.3 + double-five-preregistered-1.0` (analysis-only); recovered `qosa-1.0.0`, 3 players × 9 stones. Both branch unlock models **PROVISIONAL**; synthetic public history and opponent policies unverified.
- **Pre-registered prediction:** after the previous post-hoc 5-5 audit, `STATUS.md` specified unseen hash-ranked hands **16..23** in each of the four zero/six connector strata. The directional prediction, before evaluating these outcomes, was that presence of 5-5 would be associated with higher robust second-return mobility for `chain06/high` within each stratum.
- **New seeds:** `2811496..2813543`; **2,048 fresh deterministic hidden allocations** (32 hands × 64). **0 new complete model rounds, 0 new independent opening deals, 0 new full-game forced continuations.**
- **Exact analysis:** **32 previously unseen hands × 924 = 29,568 exact conditional opponent partitions** (12 unknown stones distributed 6+6); these partitions are **not counted** as independent random allocations. 32 hands disjoint from prior 64, 8 per stratum, 28 unique tiles, deterministic seed replay. `double-hand-perturbation.test()` and `double-connectivity-strata.test()` passed in V8 CommonJS-compatible execution; **Node CLI not run**.
- **Matched policies:** `single0/low`, `single6/high`, `chain06/high`, `chain06/low`, same exact hidden partitions within each hand; safety requires a legal focal move on the second return and no earlier terminal **in all six combinations** of 2 provisional branch models × 3 greedy opponent policies. The six scenarios are not a probability distribution.

## Primary confirmatory-direction result (structural association only)

| Focal connector stratum | Hands with 5-5 / without | 5-5: chain06/high safe | No 5-5: safe | Gap |
|---|---:|---:|---:|---:|
| Z0/S0 | 5 / 3 | 41.52% | 22.08% | +19.44 pp |
| Z+/S0 | 2 / 6 | 67.64% | 48.70% | +18.94 pp |
| Z0/S+ | 4 / 4 | 44.64% | 25.70% | +18.94 pp |
| Z+/S+ | 2 / 6 | 62.28% | 23.97% | +38.31 pp |

- **All four pre-specified stratum directions positive**, equal-stratum gap **+23.9069 percentage points**; exploratory stratified hand-level bootstrap 95% interval **[+9.7168, +38.0844] pp**, 10,000 fixed-seed resamples (`0x5a551030`). Previous cohorts showed +36.58 and +35.22 pp; this new cohort supports the direction, with a smaller gap.
- **Critical practical counterweight:** across these same 32 hands, robust safety is **92.94%** for `single0/low`, **84.39%** for `single6/high`, but only **39.10%** for `chain06/high` and **22.22%** for `chain06/low`. `chain06/high` beats `single0/low` on only **1/32** hands (ties **1/32**).
- **Counterexample even with 5-5:** `0-0,6-6,1-4,1-5,2-3,3-4,5-5` gives only **31/924 = 3.35%** robust safety for `chain06/high`. Presence of 5-5 is not a guarantee.
- **Interpretation:** the 5-5 feature is a reproducible *predictor of this narrow synthetic mobility metric* across three disjoint cohorts. It is **not causal**: hands with and without 5-5 have different other stones and conditional opponent pools. These hash-selected hands are not representative population samples. No win-rate, median pips, block, minus, regret or 101-match advantage has been established.

## Reproduction and controls

Existing executable modules contain the full board transition, exact enumeration and seeded sampler:
`simulator/double-hand-perturbation.js`,
`simulator/double-connectivity-strata.js`, and
`simulator/double-connectivity-holdout.js`.
The new cohort is exactly the next eight positions per stratum, selected without inspecting outcomes. Recompute the exact primary metric from repository root with:

```js
const base = require('./qosha-research/simulator/double-hand-perturbation');
const strata = require('./qosha-research/simulator/double-connectivity-strata');
base.test(); strata.test();
const names = ['Z0/S0','Z+/S0','Z0/S+','Z+/S+'];
const hands = strata.choose(24).filter(x => Number(x.id.split('-').at(-1)) >= 16);
if (hands.length !== 32) throw Error('cohort size');
const prev = new Set(strata.choose(16).map(x => x.signature));
if (hands.some(x => prev.has(x.signature))) throw Error('overlap');
const rows = hands.map(x => {
  const v = strata.variant(x), worlds = base.exactWorlds(v.pool);
  if (worlds.length !== 924) throw Error('partition count');
  const a = base.audit(v, worlds);
  return {id:x.id, hand:x.hand.map(t=>t.join('-')), stratum:x.features.stratum,
          has55:x.hand.some(t=>t.join('-')==='5-5'),
          single0:a.plans['single0/low'].safe,
          single6:a.plans['single6/high'].safe,
          chain:a.plans['chain06/high'].safe,
          chainLow:a.plans['chain06/low'].safe};
});
const mean = (xs,key) => xs.reduce((a,r)=>a+r[key],0)/(924*xs.length);
const groups = names.map(s => {
  const r=rows.filter(x=>x.stratum===s), y=r.filter(x=>x.has55), n=r.filter(x=>!x.has55);
  return {stratum:s, with55:y.length, without55:n.length,
          yes:mean(y,'chain'), no:mean(n,'chain'),
          difference:mean(y,'chain')-mean(n,'chain')};
});
const balanced = groups.reduce((a,g)=>a+g.difference,0)/4;
console.log(JSON.stringify({groups,balanced,rows},null,2));
```

For the **2,048 additional seeded allocations**, reuse the `world(pool, seed)` sampler from `double-connectivity-holdout.js` with starting seed `2811496`, 64 allocations for each selected hand in the deterministic order. They are an independent seeded diagnostic of the exact counts, **not** extra 2,048 full games. The bootstrap is stratified by the four strata and 5-5 status, resampling hands within each cell with xorshift32 seed `0x5a551030` and 10,000 replicates.

## Cumulative and next hypothesis

- **Cumulative:** 1,380,975 complete model rounds under incompatible assumptions (unchanged); 1,898,856 forced continuations (unchanged); 490,000 opening deals (unchanged); **742,544** separate synthetic hidden allocations (**740,496 + 2,048**). Historical 4,000 baseline rounds separate. Next fresh hidden seed **>=2813544**.
- **Confidence:** high for exact conditional counts, fixed-seed reproducibility and independent directional replication of an association; low for real-game tactical use because late-arrival branch reopening, block ties, optional double timing, loneZero and 101 scoring remain unauthenticated.
- **Exact next action:** compare **within-hand matched policies** conditional on 5-5 (not merely across-hand association); seek an authenticated physical-game late-arrival branch example and block-tie outcome. If authentic rules remain unavailable, pre-register a fourth disjoint hash-ranked cohort (indices 24..31), with the same six-scenario metric and seed >=2813544, and test whether the positive gap persists without claiming win-rate benefit.

Only `qosha-research/` is changed; scoreboard/PWA files and GitHub Actions are untouched.
