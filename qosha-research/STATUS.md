# Qoşa açdı research — current status

Last checkpoint: 2026-11-02T15:51:31+04:00 Asia/Baku.

- Added a leakage-safe opponent-choice trace temperature calibration layer under \`qosha-research/simulator/\`; no new deals were simulated and no real decision traces were available.
- Calibration supports per-decision mixture and stable latent policy per round-seat group. Fit temperature on train groups by mean log loss; evaluate the selected value on disjoint holdout groups; report Brier/top-one plus random-legal baseline.
- Synthetic scoring-core smoke check: 13/13 assertions passed in the orchestration JS runtime. The committed repository Node integration test was not executed in a checkout during this run.
- Branch-opening models, block/scoring details, and opponent-policy prior/likelihood remain provisional. No strategy promoted and no temperature claimed calibrated.
- Cumulative separate cohorts unchanged: 88,886 deal allocations, 1,074 selected multi-action positions, 5,863 state-world assignments; additive cohorts, no global dedup.
- Exact next: collect/import round-seat grouped real decision traces; run the calibration Node test in a repository checkout; fit on train groups only and score disjoint holdout log loss/Brier. If no traces, keep calibration provisional.

Report: qosha-research/runs/2026-11-02-1551-pass-history-trace-calibration-harness.md
Data: qosha-research/runs/2026-11-02-1551-pass-history-trace-calibration-harness.json
Module/test: qosha-research/simulator/pass-history-trace-temperature-calibration.js and qosha-research/simulator/pass-history-trace-temperature-calibration-test.js
