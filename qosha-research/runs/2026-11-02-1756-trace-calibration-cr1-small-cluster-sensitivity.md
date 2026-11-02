# Finite-sample sensitivity of round-seat CR1 uncertainty — 2026-11-02T17:56:32+04:00 (Asia/Baku)

## Scope

This is a calibration-method diagnostic, not a gameplay simulation. No new deals were generated, no real decision traces were available, and no opponent temperature was fitted. The recovered qosa-1.0.0 3×9 mode remains the research context; branch-opening, block and scoring details remain provisional.

## Reproducible synthetic check

- Generator: one independent round-seat random intercept, (u_g\sim N(0,1)), plus within-group noise (e_{gi}\sim N(0,0.5^2)); true mean 0.
- Estimator: decision-weighted mean; CR1 formula matches the calibration module’s documented formula.
- Cluster counts: 4, 8, 20, 50. Cluster sizes: balanced (n_g=4), independently random integers 1–12, or severe imbalance (half 1, half 12).
- 30,000 replications per configuration (360,000 synthetic datasets total), NumPy PCG64 seed `202611021756`. Six exact formula/invariance assertions passed. Reproducer: [Python script](../simulator/cluster-se-synthetic-validation.py); full metrics: [JSON](./2026-11-02-1756-trace-calibration-cr1-small-cluster-sensitivity.json).

| Independent groups | Cluster sizes | Mean CR1 SE / empirical SD | Normal 95% coverage | t(G−1) 95% coverage |
|---:|---|---:|---:|---:|
| 4 | balanced n=4 | 0.917 | 85.4% | 94.8% |
| 4 | random 1–12 | 0.805 | 79.8% | 92.0% |
| 4 | half 1 / half 12 | 0.682 | 67.7% | 81.1% |
| 8 | balanced n=4 | 0.969 | 91.1% | 95.1% |
| 8 | random 1–12 | 0.908 | 87.9% | 92.6% |
| 8 | half 1 / half 12 | 0.858 | 83.6% | 88.9% |
| 20 | balanced n=4 | 0.989 | 93.7% | 95.2% |
| 20 | random 1–12 | 0.963 | 92.4% | 94.0% |
| 20 | half 1 / half 12 | 0.949 | 91.3% | 92.9% |
| 50 | balanced n=4 | 0.993 | 94.5% | 95.2% |
| 50 | random 1–12 | 0.988 | 94.0% | 94.5% |
| 50 | half 1 / half 12 | 0.976 | 93.5% | 94.1% |

## Finding and limitation

The most important failure mode is few independent groups combined with size imbalance: at G=4, the CR1 standard error averaged only 68% of the estimator’s empirical SD in the severe-imbalance case. A t critical value helps but does not rescue that case (81% coverage). Coverage improves as G grows, but the severe-imbalance toy case remains below nominal even at G=50.

This is evidence about the uncertainty method under one Gaussian random-intercept model—not empirical calibration of players and not a game-strategy result. No strategy is promoted. Use CR1 as a reported standard error, expose the number and size distribution of independent round-seat groups, and avoid presenting small-G normal intervals as reliable. A wild-cluster bootstrap or CR2 small-sample correction should be tested before making intervals from sparse/unequal trace groups.

## Exact next action

If real decision traces arrive, split train/holdout by round-seat as already specified, report group counts and group-size imbalance, and compare CR1 against a synthetic-validated wild-cluster/CR2 interval. Do not claim a calibrated temperature until disjoint held-out real choices are scored. If no trace data is available, return to the simulator’s unresolved branch/block invariants rather than manufacture calibration evidence.

- **Game-cohort cumulative scale (unchanged, separate cohorts):** 88,886 deal allocations; 1,074 selected multi-action positions; 5,863 state-world assignments. No global deduplication across cohorts.
- **Live scoreboard/PWA:** untouched.
