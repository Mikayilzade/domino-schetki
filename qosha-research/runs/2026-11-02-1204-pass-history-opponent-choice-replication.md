# Pass-history opponent-choice likelihood disjoint replication — 2026-11-02T12:04:41+04:00 (Asia/Baku)

## Engine, rules, and seeds

- Engine: qosha-research-0.5.3 + trace-instrumented pass-history support + common-world regret evaluator; recovered qosa-1.0.0, primary 3×9.
- Branch models: global-ever-open and current-only remain provisional.
- Fresh disjoint seed window: 3505601–3521600; scanned through 3517833.
- Deals: 12233 unique allocations; 0 duplicates.
- Discovery: 16000 requested; 12233 generated; 1500 late states; 195 prepared joint multi-action states; selected 80 (40 3–3, 40 2–3).
- Current-only-counterfactual outcomes: 389 finishes / 11844 blocks / 0 unresolved; 57782 pass observations. These are not real-game rates.

## Exact support and paired continuations

- Support: 1200 labeled allocations; global 508, current-only 888, joint 508, global-only 0, current-only-exclusive 380, neither 312; no within-state duplicates.
- Opponent-choice likelihood: equal prior over random-legal, min-hand-pips, fast-doubles. Stable-style keeps one latent policy per opponent for the round; per-decision mixes action distributions independently. Forced passes remain exact support evidence and are not reweighted.
- Continuation profiles: closed-branch-control, min-hand-pips, fast-doubles; 1324 candidate-world pairs / 2648 model rollouts per profile; 7944 total; 0 unresolved. Candidate arms, branch models, and continuation seeds are paired.

## First-finish decision-regret sensitivity

Descriptive state-cluster 95% normal intervals; values are percentage points and ± is interval half-width. Continuation: closed-branch-control.

| Opponent hand sizes | Branch model | Pass-only regret | Stable-style regret | Stable − pass-only | Per-decision regret | Per-decision − pass-only | Mean ESS stable / per-decision |
|---|---|---:|---:|---:|---:|---:|---:|
| 3-3 | global | 10.98 ± 5.70 | 11.05 ± 5.93 | 0.07 ± 2.12 | 10.52 ± 5.61 | -0.46 ± 1.59 | 3.96 / 4.73 |
| 3-3 | currentOnly | 0.94 ± 1.29 | 0.94 ± 1.29 | 0.01 ± 0.01 | 0.92 ± 1.26 | -0.02 ± 0.05 | 3.99 / 4.71 |
| 2-3 | global | 6.52 ± 2.48 | 6.83 ± 3.46 | 0.31 ± 2.66 | 8.09 ± 3.68 | 1.57 ± 2.48 | 3.15 / 3.56 |
| 2-3 | currentOnly | 3.98 ± 4.19 | 4.34 ± 4.50 | 0.36 ± 1.99 | 4.35 ± 4.34 | 0.37 ± 1.36 | 2.89 / 3.52 |

## Finding and limitations

This is a fresh disjoint replication of the previous opponent-choice likelihood holdout. Read the deltas with their state-cluster intervals: intervals containing zero mean no reliable decision-regret effect in this selected sample. ESS describes posterior concentration under the assumed opponent-policy likelihood, not physical-rule certainty.

Late states are selected under the current-only counterfactual; opponent policy prior and top-ranked action likelihood are assumptions. Branch opening, block semantics, and scoring remain unauthenticated. This is model sensitivity, not a tactical recommendation. No strategy is promoted.

## Validation and cumulative scale

- Existing likelihood regression: 9/9 assertions passed.
- SHA-256 shim checked against the standard abc vector; committed source modules fetched from GitHub and run in a V8 harness. Local Node checkout remains unavailable because GitHub DNS fails in the container.
- Cumulative separate cohorts: 53,028 deal allocations, 774 selected joint-support multi-action states, 4,171 state-world assignments. Not globally deduplicated across states/cohorts; strategy tournament unchanged.

## Exact next action

Fresh disjoint seeds starting 3521601; target at least 100 selected joint-support multi-action states across 3-3 and 2-3 strata. Run opponent-policy prior-grid sensitivity (uniform, random-legal-heavy, fast-doubles-heavy) on identical exact hidden worlds and continuation seeds; compare stable-style vs per-decision posterior shifts and ESS. No strategy promotion. Continue seeking an authenticated branch/block ruling.

Report/data/reproducer: [JSON](./2026-11-02-1204-pass-history-opponent-choice-replication.json); [runner](../simulator/pass-history-opponent-choice-likelihood.js); [test](../simulator/pass-history-opponent-choice-likelihood-test.js).
