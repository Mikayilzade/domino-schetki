# Qoşa açdı research — current status

Last checkpoint: 2026-11-02T17:56:32+04:00 Asia/Baku.

- Ran a deterministic synthetic finite-sample diagnostic for the round-seat CR1 standard error used by trace calibration: 12 configurations × 30,000 replications, seed 202611021756; 6 formula/invariance assertions passed.
- Main method finding: with only 4 independent groups and severe cluster-size imbalance (half 1 decision, half 12), mean CR1 SE was 0.682× empirical SD; nominal 95% coverage was 67.7% using normal 1.96 and 81.1% using t(G−1). At 50 groups it was 93.5% / 94.1%. Small-G intervals need caution.
- No new deals, no real decision traces, no empirical temperature fit, and no gameplay finding. No strategy promoted.
- The actual repository Node calibration regression remains unrun because a checkout could not resolve GitHub DNS; this run executed the independent Python reproducer.
- Cumulative separate game cohorts unchanged: 88,886 deal allocations, 1,074 selected multi-action positions, 5,863 state-world assignments; additive summaries, no global dedup.
- Branch-opening, block/scoring, and opponent-choice likelihood remain provisional.
- Exact next: when real round-seat traces arrive, report group counts and cluster-size imbalance; validate wild-cluster bootstrap or CR2 small-sample intervals on synthetic coverage before sparse-trace inference. Preserve group-level train/holdout separation. If traces remain unavailable, return to unresolved simulator branch/block invariants.

Report: qosha-research/runs/2026-11-02-1756-trace-calibration-cr1-small-cluster-sensitivity.md
Data: qosha-research/runs/2026-11-02-1756-trace-calibration-cr1-small-cluster-sensitivity.json
Reproducer: qosha-research/simulator/cluster-se-synthetic-validation.py
