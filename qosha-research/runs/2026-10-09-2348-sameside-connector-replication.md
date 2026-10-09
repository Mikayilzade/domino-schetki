# Same-side connector independent replication — 2026-10-09 23:48:43 +04:00

Engine `qosa-research-0.5.3`; rules `qosa-1.0.0`; 3 players × 9 stones. Independent deal-seed scan **403000..405999**, disjoint from prior scan **400000..402999**. Quota: 8 reachable positions each in bothOpen/oneOpen/bothClosed, **24 positions**; **30 fixed-visible hidden worlds per position = 720 worlds**; **8820 forced candidate continuations**, 0 new complete strategy rounds. World seeds `4100000+1000*dealSeed+worldIndex` (index 0..29). Three continuation policies: closed-branch-control, min-hand-pips, fast-doubles. Candidate choice: spend low connector / keep high vs spend high connector / keep low on the SAME open side, SAME starting end, identical hidden worlds.

Finish-first keep-high minus keep-low in percentage points; exploratory unadjusted 95% position-level normal CIs (n=8 per group):

| Continuation | Both opened | One opened | Both closed |
|---|---:|---:|---:|
| closed-branch-control | -1.67 [-11.62, 8.29] | 2.50 [-8.32, 13.32] | 0.83 [-6.55, 8.22] |
| min-hand-pips | -2.50 [-8.52, 3.52] | 2.92 [-2.93, 8.77] | 4.17 [-5.46, 13.79] |
| fast-doubles | -4.58 [-15.20, 6.03] | -9.17 [-14.07, -4.27] | 3.33 [-4.76, 11.43] |

**Main finding:** the previous positive bothOpen signal is **not replicated**: the new bothOpen point estimates are negative for all three policies, and all three confidence intervals include zero. The fast-doubles oneOpen estimate is -9.17 pp [-14.07,-4.27] but is a post-hoc, multiply-tested n=8 cell and **not** a confirmed general rule. A claimed universal high-connector preservation advantage is unsupported.

Validation: same-side invariant self-test passed in V8 CommonJS harness; Node CLI remains unexecuted. Every selected position has opponent minimum hand **>=3** (0 with <=2), so opponent-immediate-finish/urgent subgroup is **not tested**. Quota selection strongly favors the first eight bothClosed seeds, creating a potential selection bias; opponent vector/hand size and branch geometry not matched across positions. Locked/open branch semantics assumption-labelled; three simple bots; official winner at block unknown; correlated worlds; no multiple-comparison adjustment.

Cumulative after this run: **180000** complete matched-seat strategy rounds (historical 4000 separate), **92906** credited fixed-visible hidden worlds; 400 pilot worlds excluded.

Reproduce with `node qosha-research/simulator/same-side-holdout.js 403000 406000 8 30`. Exact selected seeds, row-level deltas and CIs are in matching JSON. **Next:** preregister seed-spaced quota selection and exact opponent-size matching; compare fresh same-side positions under side-neutral policies, oversampling positions where an opponent has <=2 tiles. Do not infer a human-ready rule from these data.
