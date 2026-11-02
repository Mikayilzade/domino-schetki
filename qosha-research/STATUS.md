# Qoşa açdı research — current status

Last checkpoint: 2026-11-02T16:51:09+04:00 Asia/Baku.

- Added round-seat cluster-robust CR1 standard errors to trace calibration metrics (log loss, multiclass Brier, top-one accuracy). This avoids treating repeated decisions from one opponent in one round as independent observations.
- No new deals were simulated and no real decision traces were available; temperature remains uncalibrated and no strategy was promoted.
- The calibration Node integration test was not run in a repository checkout because GitHub DNS was unavailable in this environment. The isolated CR1 formula fixture passed 4/4 checks; this is not a full module regression.
- Branch-opening models, block/scoring details, and opponent-policy prior/likelihood remain provisional.
- Cumulative separate cohorts unchanged: 88,886 deal allocations, 1,074 selected multi-action positions, 5,863 state-world assignments; additive cohorts, no global dedup.
- Exact next: import round-seat grouped real decision traces, run the committed Node regression in a checkout, fit temperature on train groups only, and report disjoint holdout log loss/Brier with group-level uncertainty. If no traces, do not claim calibration.

Report: qosha-research/runs/2026-11-02-1651-trace-calibration-cluster-se.md
Data: qosha-research/runs/2026-11-02-1651-trace-calibration-cluster-se.json
Module/test: qosha-research/simulator/pass-history-trace-temperature-calibration.js and qosha-research/simulator/pass-history-trace-temperature-calibration-test.js
