# Pass-history opponent-choice likelihood holdout audit — 2026-11-02T11:00:37+04:00 (Asia/Baku)

## Engine, rules, and seeds

- **Engine:** qosha-research-0.5.3 + trace-instrumented pass-history support + common-world regret evaluator; recovered `qosa-1.0.0`, primary 3×9.
- **Branch models:** global-ever-open and current-only remain provisional.
- **Fresh disjoint seed window:** 3489601–3505600; scanned through 3501758.
- **Deals:** 12158 unique deal allocations, 0 duplicate allocations; 1500 selected late states.
- **Current-only-counterfactual discovery:** 363 finishes / 11795 blocks / 0 unresolved, with 57495 pass observations. These outcomes are specific to the counterfactual, not real-game rates.
- **Holdout selection:** hash-ranked balanced sample of 40 3–3 and 40 2–3 opponent-hand states, each with at least two common legal root actions. 185 eligible states were available before selection.

## Exact support and paired continuation

- **Selected exact support:** 1200 labeled allocations checked; global 409, current-only 792, joint 409, global-only 0, current-only-exclusive 383, neither 408. 409 joint state-world assignments; no within-state duplicates.
- **Opponent-choice model:** equal prior over random-legal, min-hand-pips, fast-doubles. Stable-style assigns one latent policy per opponent for the round; per-decision mixes the three action distributions independently at each observed move. Forced passes are not reweighted because exact pass masks already require no legal tile.
- **Synthetic trace generator:** even seeds use min-hand-pips, odd seeds use fast-doubles; both choose uniformly among top-ranked actions.
- **Continuation profiles:** closed-branch-control, min-hand-pips, fast-doubles. 1102 candidate-world pairs per profile, 2204 model rollouts per profile, 6612 total; 0 unresolved. Hidden worlds and continuation seeds are matched across candidate arms and branch models.

## Decision-regret comparison

Regret is measured per state against the best posterior-expected candidate for each metric. Intervals are descriptive state-cluster normal intervals. The tables use the closed-branch-control continuation.

### First-finish and remainder regret

| Opponent hands | Branch model | First-finish regret pass-only → stable mixture | Δ stable − pass-only (95% CI) | Remainder regret pass-only → stable mixture | Δ stable − pass-only (95% CI) |
|---|---|---:|---:|---:|---:|
| 3-3 | global | 8.69 ± 5.48 → 9.69 ± 5.80 pp | 1.00 ± 2.40 pp | 1.32 ± 0.50 → 1.38 ± 0.51 pips | 0.07 ± 0.15 pips |
| 3-3 | currentOnly | 1.21 ± 1.73 → 1.05 ± 1.65 pp | -0.16 ± 0.67 pp | 2.05 ± 0.52 → 2.02 ± 0.52 pips | -0.03 ± 0.07 pips |
| 2-3 | global | 11.59 ± 5.82 → 12.59 ± 6.13 pp | 1.01 ± 1.65 pp | 1.31 ± 0.38 → 1.35 ± 0.38 pips | 0.04 ± 0.09 pips |
| 2-3 | currentOnly | 8.92 ± 6.38 → 8.84 ± 6.37 pp | -0.08 ± 0.17 pp | 2.02 ± 0.57 → 2.01 ± 0.57 pips | -0.00 ± 0.02 pips |


### Minus-risk and expected minus-loss regret

| Opponent hands | Branch model | Minus-risk regret pass-only → stable mixture | Δ stable − pass-only (95% CI) | Expected minus-loss pass-only → stable mixture | Δ stable − pass-only (95% CI) | Mean ESS stable / per-decision |
|---|---|---:|---:|---:|---:|---:|
| 3-3 | global | 0.00 ± 0.00 → 0.00 ± 0.00 pp | 0.00 ± 0.00 pp | 0.00 ± 0.00 → 0.00 ± 0.00 | 0.00 ± 0.00 | 3.30 ± 1.18 / 3.95 ± 1.32 |
| 3-3 | currentOnly | 0.00 ± 0.00 → 0.00 ± 0.00 pp | 0.00 ± 0.00 pp | 0.00 ± 0.00 → 0.00 ± 0.00 | 0.00 ± 0.00 | 3.56 ± 1.15 / 4.09 ± 1.33 |
| 2-3 | global | 1.25 ± 2.45 → 1.25 ± 2.45 pp | 0.00 ± 0.00 pp | 0.13 ± 0.24 → 0.13 ± 0.24 | 0.00 ± 0.00 | 2.85 ± 0.65 / 3.04 ± 0.72 |
| 2-3 | currentOnly | 0.00 ± 0.00 → 0.00 ± 0.00 pp | 0.00 ± 0.00 pp | 0.00 ± 0.00 → 0.00 ± 0.00 | 0.00 ± 0.00 | 2.95 ± 0.71 / 3.21 ± 0.79 |


### Per-decision mixture sensitivity

| Opponent hands | Branch model | Δ first-finish regret per-decision mixture − pass-only (95% CI) | Δ remainder regret (95% CI) | Mean ESS |
|---|---|---:|---:|---:|
| 3-3 | global | 0.37 ± 1.42 pp | -0.01 ± 0.11 pips | 3.95 ± 1.32 |
| 3-3 | currentOnly | -0.23 ± 0.60 pp | -0.02 ± 0.06 pips | 4.09 ± 1.33 |
| 2-3 | global | -0.08 ± 1.26 pp | -0.02 ± 0.05 pips | 3.04 ± 0.72 |
| 2-3 | currentOnly | -0.21 ± 0.29 pp | 0.00 ± 0.01 pips | 3.21 ± 0.79 |


## Finding and confidence

The new posterior uses observed opponent action choices to reweight exact pass-consistent hidden-world support. In this selected holdout, the stable-style mixture shifts global-model first-finish regret by about +1.0 pp in both 3–3 and 2–3 strata, while current-only shifts are small and negative. All state-cluster intervals for these deltas include zero. Per-decision mixture deltas are also small and uncertain.

The practical diagnostic is posterior concentration: mean ESS is about 2.9–3.6 hidden worlds per state under the mixture, despite exact joint support averaging several worlds. The likelihood model narrows the posterior substantially, but estimates depend on assumed opponent styles. This is not a reliable tactical signal; no strategy is promoted.

Limitations: late states are selected under the current-only counterfactual; pass support is exact only for the stated masks; equal policy prior and top-action likelihood are assumptions; hidden worlds are not globally deduplicated across states; branch-opening and block/scoring semantics remain unauthenticated. No authentic Qoşa açdı branch/block ruling was found in this search.

## Reproduction and next action

- Regression: 9 assertions passed.
- Reproducer: [runner](../simulator/pass-history-opponent-choice-likelihood.js); [test](../simulator/pass-history-opponent-choice-likelihood-test.js); trace source: [pass-history-current-only-cohort.js](../simulator/pass-history-current-only-cohort.js).
- **Next:** replicate posterior weighting and ESS on a fresh disjoint seed window; compare stable-style and per-decision mixtures; continue seeking an authenticated branch/block ruling.
