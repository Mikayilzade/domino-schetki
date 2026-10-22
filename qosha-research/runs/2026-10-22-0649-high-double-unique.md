# 2026-10-22 06:49 (+04) — exact/unique high-double paired holdout

- Engine/rules: qosa-research-0.5.3 / qosa-1.0.0, primary 3x9; no scoreboard changes.
- Independent seeds **1311840..1313839**; 200 selected positions, 25 per double (3-3,4-4,5-5,6-6) and opponent policy. Discovery scans: {"min-hand-pips":{"seedsScanned":568,"positions":{"3":25,"4":25,"5":25,"6":25}},"closed-branch-control":{"seedsScanned":564,"positions":{"3":25,"4":25,"5":25,"6":25}}}.
- Fixed-visible pass-conditioned worlds, **61 exact-support positions** and remaining positions with 128 distinct worlds sampled without replacement. Total **21085 unique position-world allocations** and **42170 paired continuations**; zero unresolved. Same hidden world and deterministic continuation bot for forced opening vs deferring. V8 CommonJS deterministic replay and world-integrity tests passed; Node CLI not run.
- Delta = deferral minus immediate double opening, finish-first percentage points. Approx Bonferroni 95% position intervals over eight inspected cells (z=2.735; ignores seed clustering):

| Bot | Double | Positions | Exact | Delta pp | Bonferroni 95% pp | Better / worse / tied |
|---|---|---:|---:|---:|---|---|
| min-hand-pips | 3-3 | 25 | 15 | 12.73 | [-0.67, 26.14] | 15/6/4 |
| min-hand-pips | 4-4 | 25 | 14 | 5.09 | [-6.44, 16.61] | 13/8/4 |
| min-hand-pips | 5-5 | 25 | 3 | 2.72 | [-5.21, 10.64] | 12/12/1 |
| min-hand-pips | 6-6 | 25 | 1 | 6.66 | [-2.96, 16.28] | 16/7/2 |
| closed-branch-control | 3-3 | 25 | 16 | 16.41 | [3.77, 29.05] | 17/4/4 |
| closed-branch-control | 4-4 | 25 | 8 | 15.67 | [8.18, 23.15] | 20/3/2 |
| closed-branch-control | 5-5 | 25 | 3 | 13.18 | [5.06, 21.30] | 20/5/0 |
| closed-branch-control | 6-6 | 25 | 1 | 13.11 | [4.66, 21.57] | 19/6/0 |

- Finding: conditional deferral versus opening shows a model-specific signal in selected pass-conditioned positions, but this is not a full-deal strategy advantage or a universal double ranking. The old with-replacement runner on the same seeds is recorded in the preceding checkpoint, but its repeated small-support worlds are not pooled with this unique/exact rerun.
- Limitations: first eligible high-double selection, 25 positions per cell, deterministic bots, no block winner, provisional branch semantics, uniform hidden worlds omit opponent choice likelihood; exploratory position intervals may be optimistic due to shared deal seeds. Not a human-play law.
- Cumulative: **389,700 full strategy continuations unchanged**; **147454 separate counterfactual continuations** (54,084 previous + 51,200 original with-replacement holdout + 42170 corrected rerun); historical and quarantined separate. Original and corrected reruns share positions and must NOT be treated as independent evidence.
- Reproduce: `node qosha-research/simulator/high-double-unique-holdout.js test`; `node qosha-research/simulator/high-double-unique-holdout.js 1311840 2000 25 128`.
- **Next hypothesis/action:** independent seeds starting 1313840, same predeclared 3-3/5-5 contrasts under at least one alternate continuation policy; seed-cluster confidence intervals; isolate holding X-X plus X-Y connector vs generic branch closure.
