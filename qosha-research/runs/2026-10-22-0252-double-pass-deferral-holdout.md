# 2026-10-22 02:52 (+04) — independent optional-double deferral holdout

- Engine/rules: qosa-research-0.5.3 / recovered qosa-1.0.0, primary 3x9; provisional branch-opening semantics unchanged.
- Fresh deterministic seeds 1309740..1310239: 500 deals x 3 focal seats x 2 opponent profiles x 4 variants = 12,000 complete continuations, zero unresolved.
- Strategies: a20-one, a20-joint, joint-defer-either, joint-defer-both. Opponents: min-hand-pips and closed-branch-control. Matched initial deal and seat. Deferral is allowed only after an observed no-stock pass and only with a legal non-double alternative.
- V8 CommonJS deterministic replay and pass-gate test passed; Node CLI not run (120 test continuations not counted).

## Main metrics (1500 focal-seat continuations per strategy/profile)
- Min-hand-pips opponents: a20-one finish-first 45.33%, a20-joint 44.13%, joint-defer-either 46.27% (**+2.13 pp vs joint**, exploratory seed-cluster 95% CI +1.06..+3.21 pp), joint-defer-both 44.07% (-0.07 pp vs joint). Joint/either mean remaining pips 3.469/3.358; medians 2/1; block rates 5.07%/5.07%; mean round turns 24.557/24.562; minus wins -10: 114/127, -20: 5/5, -30: 0/0, -40: 0/0. Defer-either triggered 236 times.
- Closed-branch-control opponents: a20-one finish-first 33.93%, a20-joint 33.20%, joint-defer-either 34.80% (**+1.60 pp vs joint**, exploratory CI +0.55..+2.65 pp), joint-defer-both 33.33% (+0.13 pp vs joint). Joint/either mean remaining pips 5.602/5.479; medians 4/3; block rates 5.20%/4.93%; mean turns 26.079/26.053; minus wins -10: 64/75, -20: 3/2, -30: 0/0, -40: 0/0. Defer-either triggered 219 times.
- Starting double strata: 0/1/2+ doubles: 96/394/1010 seats per opponent profile. Defer-either minus joint: min-pips 0/+1.52/+2.57 pp; branch-control 0/+1.78/+1.68 pp. Descriptive only; no double-number causal claim.
- Prior independent 250-deal cohort also showed a positive effect for defer-either against both bots. Waiting for both opponents to pass did not replicate this advantage.

## Limitations, cumulative and next
- Provisional model-specific result, not yet a human-play rule. Exploratory intervals are not multiple-testing corrected. Assumed branch semantics, fixed deterministic bots, no block winner, preprocessed opening 1-1, no earlier opponent action likelihood; trajectories diverge after deferral.
- Prior verified 335,700 complete continuations + 12,000 = **347,700**. Historical 4,000 and 49,988 separate changed-choice continuations remain excluded.
- Reproduce: node qosha-research/simulator/double-pass-deferral.js test; node qosha-research/simulator/double-pass-deferral.js 1309740 500.
- **Exact next action:** first-deferral same-visible-position paired hidden-world counterfactual, identical continuation policy/world seeds; stratify by actual double number, one/both opponents passed and hand size; execute Node CLI regression when available.
