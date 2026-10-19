# Independent alpha-28 holdout (first 350 seeds) — 2026-10-20 ~00:57 Asia/Baku

## Reproduction / provenance
- Source of truth: GitHub `qosha-research/simulator/joint-pass-memory-runner.js` and its dependencies, fetched fresh at run start. Source SHA (blob): `7e46b6e33cdf98344f57a606d4cf4504dab2aa73`.
- Engine `qosa-research-0.5.3`; recovered rules `qosa-1.0.0`, **provisional branch semantics**, 3 players × 9 stones.
- Seed set: **1301950..1302299** inclusive (350 distinct deals); each deal: 3 focal seats × 2 opponent policies × 6 matched focal variants = **12,600 complete continuations**. No unresolved continuations.
- Opponents: `min-hand-pips` and `closed-branch-control`; focal variants `a20-plain`, `a20-one`, `a20-joint`, `a28-plain`, `a28-one`, `a28-joint`.
- Reproduce in Node: `node qosha-research/simulator/joint-pass-memory-runner.js test`; `node qosha-research/simulator/joint-pass-memory-runner.js 1301950 350 20,28`. Actual execution was GitHub-sourced V8 CommonJS harness, **not Node CLI**. Analytic joint posterior vs brute-force test and deterministic replay passed (36 small test continuations excluded from the new scale).
- Paired seed/seat/opponent comparisons; 95% CIs are exploratory **deal-cluster** intervals (unadjusted for multiple hypotheses).

## Holdout results (each cell: 1,050 focal continuations)

| Opponents | Variant | Finish-first | Mean / median pips | Block rate | Mean turns | Focal minus -10 / -20 / -30 / -40 |
|---|---|---:|---:|---:|---:|---|
| min-pips | a20-plain | 45.81% | 3.31 / 2 | 6.57% | 24.65 | 97 / 4 / 0 / 0 |
| min-pips | a20-one | 46.00% | 3.31 / 2 | 6.48% | 24.64 | 99 / 4 / 0 / 0 |
| min-pips | a20-joint | 44.86% | 3.38 / 2 | 6.38% | 24.69 | 88 / 4 / 0 / 0 |
| min-pips | a28-plain | 46.29% | 3.37 / 2 | 6.38% | 24.70 | 96 / 4 / 0 / 0 |
| min-pips | a28-one | 46.48% | 3.39 / 2 | 6.29% | 24.71 | 96 / 4 / 0 / 0 |
| min-pips | a28-joint | 45.71% | 3.41 / 2 | 6.00% | 24.73 | 89 / 4 / 0 / 0 |
| branch-control | a20-plain | 34.86% | 5.48 / 3 | 5.24% | 26.15 | 64 / 1 / 0 / 0 |
| branch-control | a20-one | 35.24% | 5.42 / 3 | 5.24% | 26.14 | 65 / 1 / 0 / 0 |
| branch-control | a20-joint | 33.81% | 5.65 / 4 | 5.05% | 26.10 | 58 / 1 / 0 / 0 |
| branch-control | a28-plain | 36.19% | 5.36 / 3 | 5.43% | 26.16 | 70 / 1 / 0 / 0 |
| branch-control | a28-one | 36.76% | 5.32 / 3 | 5.33% | 26.15 | 69 / 1 / 0 / 0 |
| branch-control | a28-joint | 35.43% | 5.53 / 3 | 4.76% | 26.10 | 63 / 1 / 0 / 0 |

### Paired comparisons (finish-first, percentage points)
- **a28-plain minus a20-plain**: min-pips **+0.48 pp** (95% exploratory CI **−1.10..+2.05**); branch-control **+1.33 pp** (**−0.13..+2.80**). Neither excludes zero. This **does not independently confirm** the prior exploratory 150-deal alpha28 advantage.
- a20-joint minus a20-one: min-pips **−1.14 pp** (CI **−2.19..−0.09**); branch-control **−1.43 pp** (**−2.67..−0.18**). This seed set supports the concern that a better pass posterior can worsen a heuristic's action choice.
- a28-joint minus a28-one: min-pips **−0.76 pp** (CI **−1.82..+0.29**); branch-control **−1.33 pp** (**−2.70..+0.03**). Not statistically decisive.

### Calibration (Brier; lower better; a20-plain trajectory only)
- min-pips: either opponent had passed, N=1,799: plain **0.08277**, one **0.06446**, joint **0.05160**; both passed N=445: **0.08181 / 0.07392 / 0.06843**.
- branch-control: either passed N=2,430: **0.10349 / 0.07754 / 0.05665**; both passed N=462: **0.09876 / 0.08006 / 0.06420**.
- These Brier results are descriptive on correlated decisions; do not claim independent significance.

## Finding, confidence, limitations, next action
**Finding:** The previous alpha28 vs alpha20 finish-first uplift did **not** replicate decisively on this independent 350-deal holdout. Joint conditioning improves one-step pass prediction but appears to *hurt* alpha20 full-round results under both deterministic opponent profiles. No validated real-world tactical rule is established here.

**Confidence:** medium for simulation-specific direction of alpha20 joint-vs-one on these paired deals; low for human generalization and alpha tuning. Assumptions: uniform allocation of unseen tiles given observed no-stock passes, no opponent action-choice likelihood; no block winner; finish-first is not match win; branch unlocking provisional; repeated seats within deal are correlated; multiple exploratory comparisons.

**Scale:** prior repository checkpoint **214,500** full continuations; **+12,600** new = **227,100** if this file is committed. Excludes historical 4,000, quarantined legacy runs, and the separate 24,000 local-only continuations.

**Exact next action:** finish the independent holdout on fresh seeds **1302300..1302599** with the same six variants and opponents, aggregate at the deal-cluster level (without double-counting), and examine same-state hidden-world decision regret for the **joint-vs-one changed actions**; test lower joint alpha weights rather than presuming better calibration implies better decisions. Run Node CLI when available. No scoreboard/PWA edits or GitHub Actions.
