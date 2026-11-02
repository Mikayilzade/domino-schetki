# Exact pass-history joint-support continuation-profile audit — 2026-11-02 05:54:43+04 (Asia/Baku)

## Reproducible cohort

- Engine: `qosha-research-0.5.3`; recovered `qosa-1.0.0`, 3 players × 9 stones; profile-aware paired audit v2.
- Reserved seeds: `3455101–3457600`; deterministic scan stopped at `3457406` after reaching 300 selected late positions.
- 2,306 generated complete deals, 2,306 unique allocations, 0 duplicates. Discovery outcomes under the current-only counterfactual: 73 finishes, 2,233 blocks, 0 unresolved; 10,946 no-stock pass observations. This high block count is model-specific and is not a real-game frequency.
- 300 selected late positions; 50 had non-empty joint pass-conditioned support and at least two common legal root actions.
- Exact labeled allocation accounting across those 50 states: raw 617; global-ever-open 249; current-only 457; joint 249; global-only 0; current-only-exclusive 208; neither 160. All 617 allocations enumerated; 0 within-state duplicates. Counts are state-world assignments, not globally unique worlds.

## Matched continuation profiles

Each profile uses the same 698 candidate × hidden-world pairs and identical continuation seeds; global and current-only models are continued separately. Orbit/member tie-break remains seeded and branch-label symmetric.

| Continuation profile | Model | First-finish chance | Mean focal remainder | Finish / block / unresolved |
|---|---|---:|---:|---:|
| closed-branch-control | global-ever-open | 38.97% | 3.302 pips | 616 / 82 / 0 |
| closed-branch-control | current-only | 1.15% | 9.479 pips | 31 / 667 / 0 |
| min-hand-pips | global-ever-open | 38.97% | 3.302 pips | 616 / 82 / 0 |
| min-hand-pips | current-only | 1.15% | 9.479 pips | 31 / 667 / 0 |
| fast-doubles | global-ever-open | 38.11% | 3.328 pips | 616 / 82 / 0 |
| fast-doubles | current-only | 1.15% | 9.479 pips | 31 / 667 / 0 |

- 698 candidate-world pairs per profile; 1,396 model rollouts per profile; 2,094 pairs / 4,188 rollouts total.
- State-cluster global-minus-current-only first-finish delta: closed-branch-control and min-hand-pips +20.08 ± 9.62 pp; fast-doubles +19.48 ± 9.57 pp. Mean-remainder delta: −5.007 ± 1.001 vs −4.989 ± 1.001 pips (95% normal cluster intervals).
- Average within-state candidate regret (descriptive state-cluster CI): global first-finish 8.73 ± 3.89 pp / 8.33 ± 3.84 pp; current-only 2.95 ± 3.09 pp for all profiles. Mean-remainder regret: global 1.343 ± 0.399 / 1.329 ± 0.402 pips; current-only 1.757 ± 0.490 pips.

## Finding and limitations

The model gap stays large under all three continuation profiles, while switching from closed-branch-control to fast-doubles changes the global-model first-finish estimate by only −0.86 pp and the state-cluster model gap by −0.60 pp; current-only aggregate outcomes are unchanged. On this selected cohort, continuation-policy choice is not the main source of the branch-model separation. This is a sensitivity result, not proof of the physical branch rule and not a tactic recommendation.

The exact support and paired calculations are reproducible for these positions. Population confidence is limited: only 50 selected synthetic state clusters; current-only is a counterfactual; pass consistency is used without opponent-choice likelihood; discovery policies are synthetic; branch opening and block scoring remain unauthenticated. No strategy is promoted. Base regression (8 assertions) and the new fixed-cohort profile regression (29 assertions) passed in the V8 harness; a clean Node checkout remains blocked by GitHub DNS in the container.

## Exact next action

On a fresh seed window, target 100 joint-support multi-action states and add an orbit-symmetric moderate-double-hold continuation profile. Keep model-specific support counts separate, and continue seeking an authentic table trace or explicit ruling for branch opening and block scoring.

Raw data: [JSON](2026-11-02-0554-pass-history-continuation-profile-audit.json). Runner/test: [profile-aware joint-support audit](../simulator/pass-history-joint-support-choice-audit.js), [profile regression](../simulator/pass-history-joint-support-profile-audit-test.js).
