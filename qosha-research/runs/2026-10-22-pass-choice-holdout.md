# Qoşa açdı research — 2026-10-22 22:47 Asia/Baku

Engine qosa-research-0.5.3; rules qosa-1.0.0; mode 3 players x 9. V8 CommonJS sampler test passed; Node CLI not executed.

Reproduce: node qosha-research/simulator/pass-choice-regret-runner.js 1304990 450 18 256

Fresh seeds 1304990..1305439; 36 changed-choice positions (18 per opponent policy), 256 matched hidden worlds each, 9,216 allocations, 18,432 paired continuations, zero unresolved. Policies: a20-joint vs a20-one, with min-hand-pips and closed-branch-control continuation.

Joint minus one finish-first: min-hand-pips +0.760 percentage points (position-cluster exploratory 95% CI -13.475 to +14.994); closed-branch-control +6.033 pp (CI -2.931 to +14.997). Mean remainder changes: -0.706 and +0.791 pips. Both intervals span zero. Prior branch-control cohorts had negative effects, so no reliable gameplay finding.

Previously verified full continuations: 290,100, unchanged. Separate pass-choice counterfactuals: prior 23,040 plus 18,432 = 41,472. Historical and quarantined rounds excluded.

Limitations: selected changed-choice positions, uniform hidden-world allocations conditional on observed passes but not prior move likelihood, provisional branch opening, fixed bots, no block winner. Next: inspect opposite-sign positions 1305009, 1305004 and earlier 1304562; prespecify pass-history strata and repeat on disjoint seeds.
