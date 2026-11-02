# Opponent-choice prior-grid sensitivity — 2026-11-02T13:10:52+04:00 (Asia/Baku)

## Engine, rules, and seeds

- Engine: qosha-research-0.5.3 + trace-instrumented pass-history support + common-world regret evaluator + prior-grid weighting.
- Rules: recovered qosa-1.0.0, primary 3 players × 9 stones. Global-ever-open/current-only remain provisional.
- Fresh disjoint seed window: 3521601–3537600; scanned through 3533278.
- Unique deal allocations: 11678; duplicates: 0. Discovery produced 1500 selected late states and 211 prepared joint multi-action positions; the final sample contains 100 positions (50 with opponent hands 3–3, 50 with 2–3).
- Current-only-counterfactual discovery outcomes: 390 finishes / 11288 blocks / 0 unresolved. These are model-specific discovery counts, not real-game rates.

## Exact support and paired continuations

- Exact support over selected states: 1500 labeled allocations; global 570; current-only 1112; joint 570; global-only 0; current-only-exclusive 542; neither 388.
- 570 joint state-world assignments; within-state allocations are exact and deduplicated.
- Opponent-policy priors: uniform (1/3 each), random-legal-heavy (0.60 / 0.20 / 0.20), fast-doubles-heavy (0.20 / 0.20 / 0.60). Stable-style assigns one latent policy per opponent per round; per-decision re-mixes at each observed decision.
- Continuation profiles: closed-branch-control, min-hand-pips, fast-doubles. 1502 candidate-world pairs / 3004 model rollouts per profile; 9012 total rollouts; 0 unresolved. Candidate arms, branch models, and continuation seeds are paired.

## Global branch model, closed-branch-control: prior sensitivity

Entries show weighted decision-regret shift versus pass-only, in percentage points; ± is a descriptive state-cluster 95% normal interval. ESS is mean effective hidden-world count after weighting.

| Prior | Stable-style shift | Per-decision shift | Mean ESS stable / per-decision |
|---|---:|---:|---:|
| uniform | 1.04 ± 1.46 pp | 0.66 ± 1.00 pp | 3.32 / 3.92 |
| random-legal-heavy | 0.89 ± 1.36 pp | 0.27 ± 0.71 pp | 3.42 / 4.51 |
| fast-doubles-heavy | 1.05 ± 1.46 pp | 0.76 ± 1.14 pp | 3.31 / 3.71 |

Across the three priors, the stable-style point estimate ranges by only 0.16 pp; per-decision by 0.49 pp. All reported intervals include zero. This does not show a reliable effect of opponent-choice weighting on candidate regret. Mean ESS is only about 3.3–4.5 worlds, so posterior concentration still depends on the assumed action model.

## Finding and limitations

The likelihood assumes random-legal is uniform over all legal actions and the other policies are uniform over top-ranked actions. The states are selected late positions generated under a current-only counterfactual; forced-pass support is exact only for the specified masks. Branch semantics, block scoring, and scoring rules remain unauthenticated. This is model sensitivity, not tactical advice. No strategy promoted.

## Validation and cumulative scale

- Regression: 9 existing likelihood assertions + 11 prior-grid assertions passed (20 total) in a V8 harness.
- Cumulative separate pass-history cohorts: 64706 deal allocations, 874 selected joint-support multi-action states, 4741 state-world assignments. These are additive cohort summaries; no global dedup across cohorts or state-world assignments.
- Clean local Node checkout remains blocked by GitHub DNS. Live scoreboard/PWA files were not touched.

## Exact next action

Use a fresh disjoint holdout to replace the uniform-top-action likelihood with a softmax/temperature family, comparing stable-style and per-decision posterior shifts on identical hidden worlds and continuation seeds. Keep priors fixed to this grid for that test; continue seeking an authenticated branch/block ruling. No strategy promotion.

Report/data/reproducer: [JSON](./2026-11-02-1310-pass-history-opponent-choice-prior-grid.json), [runner](../simulator/pass-history-opponent-choice-prior-grid.js), [test](../simulator/pass-history-opponent-choice-prior-grid-test.js).
