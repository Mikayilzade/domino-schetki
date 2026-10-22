# 2026-10-22 06:49 (+04) — independent high-double forced-choice holdout

- Engine/rules: qosa-research-0.5.3 / recovered qosa-1.0.0, primary 3x9. No engine or scoreboard changes.
- Seeds: 1311840..1313839; first 25 optional high-double positions per 3-3, 4-4, 5-5, 6-6 and per opponent profile = **200 positions**. Discovery scanned 568/564 seeds (min-pips/branch-control).
- **128 matched pass-constrained worlds per position**, **51,200 forced-choice continuations**, no unresolved. Deterministic V8 CommonJS regression passed; Node CLI not run. These are NOT full-deal strategy rounds.
- Policies: alpha20-joint selects optional single high double after an opponent no-stock pass; force chosen double open vs best available non-double deferral; both actions evaluated in identical hidden allocations with min-hand-pips or closed-branch-control bots.
- Outcomes below: deferral minus opening, finish-first probability in percentage points. Exploratory Bonferroni eight-cell intervals use normal z=2.735 and equal position weighting.

| Opponent policy | Double | Positions | Delta pp | Exploratory Bonferroni 95% pp | Mean distinct worlds | Deferral better / opening better / tied |
| --- | --- | ---: | ---: | --- | ---: | --- |
| min-hand-pips | 3-3 | 25 | +12.03 | [-1.13, 25.19] | 120.68 | see raw runner |
| min-hand-pips | 4-4 | 25 | +5.81 | [-5.37, 17.00] | 127.96 | see raw runner |
| min-hand-pips | 5-5 | 25 | +1.91 | [-5.87, 9.68] | 127.92 | see raw runner |
| min-hand-pips | 6-6 | 25 | +6.81 | [-2.78, 16.41] | 128.00 | see raw runner |
| closed-branch-control | 3-3 | 25 | +15.69 | [3.42, 27.96] | 118.72 | see raw runner |
| closed-branch-control | 4-4 | 25 | +15.91 | [8.43, 23.38] | 127.16 | see raw runner |
| closed-branch-control | 5-5 | 25 | +14.34 | [4.96, 23.72] | 127.96 | see raw runner |
| closed-branch-control | 6-6 | 25 | +12.84 | [4.48, 21.21] | 128.00 | see raw runner |

**Finding:** conditional forced-choice deferral is favorable against the branch-control continuation policy across all four doubles in this selected sample, but this does **not** establish that deferral improves full-deal win rates. Previous independent full-deal holdout had much smaller/non-replicated per-double effects.

**Limitations:** existing paired runner samples hidden worlds *with replacement*, so repeated allocations inflate nominal observations when support is small. Position intervals do not account for multiple positions from a single deal/seed; normal approximation is exploratory, not a corrected confirmatory test. Selection on the first high-double decision; fixed deterministic bots; provisional branch-opening rules; no block winner; prior opponent action likelihood omitted. Results must not be generalized to human play.

**Reproduce:** `node qosha-research/simulator/high-double-paired.js test`; `node qosha-research/simulator/high-double-paired.js 1311840 2000 25 128`.

**Cumulative:** 389,700 complete strategy continuations (unchanged) + **105,284** separate counterfactual continuations (previous 54,084 + 51,200); historical/quarantined excluded.

**Exact next action:** implement exact enumeration when hidden support <=128 and unique-without-replacement sampling otherwise, rerun these 200 positions, calculate seed-cluster confidence intervals; test 3-3 and 5-5 on disjoint fresh seeds and alternate continuation policies.
