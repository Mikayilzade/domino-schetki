# Opponent-choice softmax temperature holdout — 2026-11-02T13:50:23+04:00 (Asia/Baku)

## Engine, rules, and seeds

- Engine: qosha-research-0.5.3 + trace-instrumented pass-history support + common-world regret evaluator + softmax-temperature likelihood grid.
- Rules: recovered qosa-1.0.0; primary 3x9; global-ever-open/current-only remain provisional.
- Fresh disjoint seed window: 3537601–3553600; scanned through 3549828.
- Unique deal allocations: 12,228; duplicates: 0.
- Discovery: 1,500 late states; 196 prepared joint multi-action states; selected 100 positions (50 with opponent hands 3–3 and 50 with 2–3).
- Current-only-counterfactual discovery outcomes: 373 finishes / 11,855 blocks / 0 unresolved. These are model-specific discovery counts, not real-game rates.

## Exact support and paired continuations

- 1,500 labeled allocations checked; global support 523; current-only support 1,058; joint support 523; current-only-exclusive 535; neither 442; global-only 0.
- 523 exact joint state-world assignments; no within-state duplicate allocation.
- Continuation profiles: closed-branch-control, min-hand-pips, fast-doubles.
- 1,308 candidate-world pairs / 2,616 model rollouts per profile; 7,848 total model rollouts; 0 unresolved.
- Every candidate action and both branch models reused the same deterministic hidden-world continuation seed.

## Softmax likelihood family

Random-legal remains uniform over all legal actions. Min-hand-pips and fast-doubles use softmax over normalized ordinal action ranks (equal-ranked actions tie; finish remains top-ranked). Temperatures: 0.2, 0.5, 1.0. Priors are fixed to the previous grid: uniform, random-legal-heavy, fast-doubles-heavy. Compared stable-style (one latent policy per opponent per round) against per-decision mixtures.

Primary metric: global branch model / closed-branch-control, weighted average candidate regret shift versus pass-only, first-finish chance, percentage points. ± is a descriptive state-cluster 95% normal interval.

| Temperature | Prior | Stable-style shift (pp) | Per-decision shift (pp) | Mean ESS stable / per-decision |
|---|---|---:|---:|---:|
| tau-0.2 | uniform | 0.73 ± 1.36 | 0.39 ± 0.94 | 3.43 / 3.96 |
| tau-0.2 | random-legal-heavy | 0.81 ± 1.28 | 0.26 ± 0.68 | 3.62 / 4.35 |
| tau-0.2 | fast-doubles-heavy | 0.76 ± 1.39 | 0.56 ± 1.09 | 3.36 / 3.79 |
| tau-0.5 | uniform | 0.48 ± 0.88 | 0.36 ± 0.67 | 4.04 / 4.36 |
| tau-0.5 | random-legal-heavy | 0.49 ± 0.81 | 0.34 ± 0.54 | 4.18 / 4.57 |
| tau-0.5 | fast-doubles-heavy | 0.46 ± 0.88 | 0.41 ± 0.75 | 4.02 / 4.25 |
| tau-1.0 | uniform | 0.42 ± 0.59 | 0.38 ± 0.53 | 4.49 / 4.58 |
| tau-1.0 | random-legal-heavy | 0.41 ± 0.55 | 0.40 ± 0.49 | 4.55 / 4.63 |
| tau-1.0 | fast-doubles-heavy | 0.41 ± 0.59 | 0.39 ± 0.55 | 4.49 / 4.55 |

## Finding

Softmax temperature changes posterior concentration: mean ESS rises from about 3.4–4.3 at tau=0.2 to 4.5–4.6 at tau=1.0. Yet all regret shifts remain below 1 pp and all descriptive intervals include zero. This is likelihood-model sensitivity, not a reliable tactical effect; no strategy is promoted.

## Confidence and limitations

- Selected synthetic late states discovered under a current-only counterfactual; not population-representative.
- Opponent policy priors and ordinal-rank likelihoods are assumptions; forced-pass support is exact only for the stated masks.
- Global-ever-open/current-only semantics, block scoring, and scoring rules remain unauthenticated.
- State-cluster normal intervals are descriptive. No strategy promotion.

## Validation and cumulative scale

- 11 softmax assertions + 11 prior-grid assertions passed (22 total).
- Exact support partition reconciled; 0 duplicate allocations; 0 unresolved continuations.
- Cumulative separate pass-history cohorts: 76,934 deal allocations, 974 selected joint-support multi-action positions, 5,264 state-world assignments. No global dedup across cohorts or state-world assignments.

## Rule-authentication search

Public search surfaced descriptions of adjacent Azerbaijani domino variants, including Telefon's four-direction board, but not an authenticated ruling for this recovered qosa-1.0.0 configuration. These are context, not proof: [Dominoxana App Store listing](https://apps.apple.com/kr/app/dominoxana-domino-101-telefon/id6806390946), [Telefon 365 rules page](https://dominopeak.com/az/rules-365.html).

## Exact next action

Fresh disjoint holdout from seed 3553601; repeat with temperatures 0.1 / 0.3 / 1.5, compare stable-style and per-decision regret shifts and ESS on matched hidden worlds/continuation seeds; continue seeking an authenticated branch/block ruling. No strategy promotion.
