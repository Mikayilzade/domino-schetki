# Opponent-choice softmax temperature disjoint holdout — 2026-11-02T14:50:21+04:00 (Asia/Baku)

- **Engine/rules:** qosha-research-0.5.3 + trace-instrumented pass-history support + common-world regret evaluator; recovered qosa-1.0.0, 3×9. Global-ever-open/current-only remain provisional.
- **Fresh seed window:** 3553601–3569600; scanned through 3565552; 11952 unique deal allocations, 0 duplicates.
- **Selection:** 1500 late states discovered; 231 joint-support-positive; 204 prepared; final 100 joint-support multi-action positions (50 with opponent hands 3–3, 50 with 2–3).
- **Exact support:** 1500 labeled allocations; global 599; current-only 979; joint 599; global-only 0; current-only-exclusive 380; neither 521. 599 exact state-world assignments; no within-state duplicate allocations.
- **Paired continuation:** 1449 candidate-world pairs per profile; 2898 model rollouts/profile; 8694 total rollouts across closed-branch-control, min-hand-pips, fast-doubles; 0 unresolved.
- **Opponent-choice model:** uniform prior over random-legal / min-hand-pips / fast-doubles; stable latent style per opponent versus per-decision mixture; temperatures 0.1 / 0.3 / 1.5. Same hidden worlds, candidates, and continuation seeds are paired.
- **Global model / closed-branch-control:** weighted-minus-pass-only first-finish regret shift (state-cluster descriptive 95% CI, pp):
  - τ=0.1: stable 0.555 ± 1.106; per-decision 0.338 ± 0.805.
  - τ=0.3: stable 0.921 ± 0.941; per-decision 0.438 ± 0.690.
  - τ=1.5: stable 0.290 ± 0.467; per-decision 0.262 ± 0.463.
- **ESS:** stable-style mean 3.42 → 3.89 → 5.12; per-decision 3.96 → 4.40 → 5.16. Higher temperature makes the posterior less concentrated.
- **Finding:** all first-finish regret shifts are under 1 pp and all descriptive intervals include zero. Temperature mainly changes posterior concentration, not a reliable tactical/action-choice signal. No strategy promoted.
- **Limitations:** selected synthetic late states discovered under a current-only counterfactual; assumed opponent-policy prior and softmax rank likelihood; branch opening, block scoring, and global/current-only semantics are unauthenticated. No real opponent decision traces used.
- **Validation:** 27 regression assertions passed; support partition reconciled; 0 unresolved. Live scoreboard/PWA files untouched.
- **Cumulative separate cohorts:** 88,886 deal allocations, 1,074 selected multi-action positions, 5,863 state-world assignments. Additive cohort totals; no global dedup across cohorts.
- **Exact next action:** calibrate/fine-fit opponent-choice temperature against held-out real decision traces (or an independent action corpus), then rerun on fresh seeds with common hidden worlds and continuation seeds; keep seeking an authenticated branch/block ruling.

Reproducer/test: [temperature-grid runner](../simulator/pass-history-opponent-choice-temperature-grid.js), [test](../simulator/pass-history-opponent-choice-temperature-grid-test.js), [machine data](./2026-11-02-1450-pass-history-opponent-choice-temperature-grid.json).
