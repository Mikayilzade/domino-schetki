# Tied-minimum block paired mix/rotation holdout — 2026-11-03T08:50:37+04:00 (Asia/Baku)

## Design and reproducibility

- **Engine/rules:** qosha-research-0.5.3; recovered qosa-1.0.0; 3 players × 9 stones + one stock. Branch opening and block candidate interpretation remain provisional.
- **Fresh holdout:** seeds 9,004,000–9,005,999; 2,000 draws, 2,000 unique seat-labelled allocations, 0 duplicate allocations.
- **Rounds:** 48,000 resolved model-rounds (12,000 per branch model); four branch models × two policy mixes × three seat rotations. No unresolved rounds.
- **Strategies:** mix 1 = random-legal / min-hand-pips / closed-branch-control; mix 2 = fast-doubles / moderate-double-hold / closed-branch-control. Policy assignment rotates across seats.
- **Trace replay:** 1,976/1,976 tied-minimum traces replayed exactly; 0 mismatches. Aggregate sorted-trace checksum: `3e86d6da`.
- **Regression:** audit pilot passed (24 deals, 576 model-rounds, 39 traces replayed); paired-contrast fixture passed (7 assertions).
- **Execution:** exact source blobs fetched from GitHub and executed in an isolated V8 harness. A clean git clone was blocked by DNS resolution for github.com; repository writes use the GitHub API.

## Overall model diagnostics

| Branch model | Blocks / 12,000 (rate, deal-clustered 95% CI) | Tied-minimum traces | Min-pip tie among blocks | Last passer in min-pip set | Pip/fewest-tile set agreement |
|---|---:|---:|---:|---:|---:|
| global | 458/12000 (3.82%, 3.46%–4.17%) | 24 | 5.24% | 34.28% | 13.54% |
| currentAll | 11196/12000 (93.30%, 92.79%–93.81%) | 657 | 5.87% | 44.59% | 48.61% |
| localFirst | 11819/12000 (98.49%, 98.22%–98.77%) | 655 | 5.54% | 41.16% | 44.37% |
| localLast | 11863/12000 (98.86%, 98.63%–99.08%) | 640 | 5.39% | 41.47% | 44.23% |

A block is empty stock plus at least three consecutive passes. Candidate sets and last passer are diagnostics only; no block winner, tie split, points, or match score is assigned.

## Paired mix/rotation contrasts

For each deal seed, tied-minimum trace presence is a binary endpoint in each mix/rotation cell. Mix contrasts pair the two mixes at the same rotation; rotation contrasts pair rotations within the same mix. The interaction is a paired difference-in-differences:
`(mix2 − mix1 at rotation r1) − (mix2 − mix1 at rotation r2)`.
Uncertainty is computed across deal clusters, not individual model-rounds.

| Model | Discovery-selected rotation pair | Discovery interaction (pp, 95% CI) | Same contrast in holdout (pp, 95% CI) |
|---|---|---:|---:|
| global | 0 vs 2 | -0.15 pp [-0.48 pp, 0.18 pp] | -0.05 pp [-0.38 pp, 0.28 pp] |
| currentAll | 0 vs 2 | 1.00 pp [-0.97 pp, 2.97 pp] | -1.40 pp [-3.35 pp, 0.55 pp] |
| localFirst | 1 vs 2 | 0.50 pp [-1.34 pp, 2.34 pp] | 0.15 pp [-1.68 pp, 1.98 pp] |
| localLast | 0 vs 1 | -1.50 pp [-3.32 pp, 0.32 pp] | -0.70 pp [-2.49 pp, 1.09 pp] |

Within each model, the displayed rotation pair was selected as the largest absolute interaction among three pairs in the discovery cohort (seeds 9,002,000–9,003,999); the identical pair was evaluated in this disjoint holdout. All displayed intervals include zero; currentAll and localLast signs do not reproduce directionally. Intervals are exploratory and unadjusted for selection.

## Finding, confidence, and limitations

**Useful finding:** no stable policy-mix-by-seat-rotation interaction in tied-minimum block incidence was established. The prior cohort's descriptive differences did not replicate directionally in the disjoint holdout. This is not evidence for or against a playing strategy; no strategy was promoted.

Confidence is high for deterministic replay and internal measurements under coded assumptions. The four branch models are counterfactual, not authenticated physical rules. Tied-minimum trace presence is not a block-winner or scoring outcome. No historical baseline was pooled.

## Separate cohort scale and exact next action

- This run adds 2,000 unique deals / 48,000 model-rounds.
- The block-audit series now has three disjoint seed windows: 9,000,000–9,001,999; 9,002,000–9,003,999; 9,004,000–9,005,999 — **6,000 seed draws / 144,000 model-rounds**. Allocation uniqueness is checked within each cohort; no cross-cohort allocation deduplication was performed.
- Other research cohorts remain separate; no pooling with the historical baseline.
- **Exact next action:** stop expanding this interaction after the disjoint holdout failed to reproduce a directional effect. Return to engine validation: exhaustive mixed-finish fixtures for 1–4 closing doubles (−10/−20/−30/−40), score-floor boundaries, and legal branch/open-state transitions. Keep block winner/scoring provisional.

## Data and reproducer

- [Run summary JSON](2026-11-03-0850-block-tied-minimum-paired-mix-rotation-holdout.json)
- [Paired-contrast runner](../simulator/block-tied-minimum-paired-contrast.js)
- [Regression test](../simulator/block-tied-minimum-paired-contrast-test.js)
- [Prior discovery traces](2026-11-03-0759-block-tied-minimum-stratified-holdout-traces-currentAll.json) and companion model files.
