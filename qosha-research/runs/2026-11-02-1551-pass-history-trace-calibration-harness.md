# Opponent-choice trace calibration harness — 2026-11-02T15:51:31+04:00 (Asia/Baku)

- **Purpose:** prepare a leakage-safe way to fit the softmax temperature from real observed opponent decisions. This is infrastructure work, not a new strategy result.
- **Engine/rules:** qosha-research-0.5.3 calibration layer; recovered qosa-1.0.0, 3×9. Branch opening and block/scoring interpretations remain provisional.
- **Simulation count:** 0 new deals; no seed range/set for this run. The last simulator cohort remains the 2026-11-02 14:50 temperature-grid cohort.
- **Trace data:** 0 real decision rows available in this run. No empirical temperature was fitted.
- **Method added:** score both per-decision mixture and stable latent style per round-seat group using mean log loss; fit only on train groups and evaluate on a disjoint holdout. Also report multiclass Brier and top-one accuracy, with random-legal as a baseline. A group must contain one opponent seat within one round; all of its turns remain in the same split.
- **Synthetic fixture only:** 6 train groups / 24 decisions and 2 holdout groups / 8 decisions, where every observed action is the top-ranked action. The pure scoring-core smoke check passed 13/13 assertions in the orchestration JS runtime. This is a code-path check, not evidence about human play. The repository Node test file is committed but was not executed in a repository checkout in this run.
- **Finding:** no new gameplay finding. A temperature should not be called calibrated until real or independently collected action traces are available and holdout log loss/Brier are reported.
- **Cumulative separate cohorts:** 88,886 deal allocations, 1,074 selected multi-action positions, 5,863 state-world assignments; unchanged additive totals, no global dedup.
- **Limitations:** action traces need a correct reconstructed legal-action set; branch-model disagreement must be separated rather than silently merged. The prior and policy families remain assumptions. The current environment did not provide an execution-capable checkout of the repository, so integration tests still need to be run there.
- **Exact next action:** collect/import real round-seat decision traces with legal actions and chosen action keys; run \`node qosha-research/simulator/pass-history-trace-temperature-calibration-test.js\` in a checkout; split by round-seat groups, fit on train only, then report holdout scores. If no traces are available, do not claim a calibrated temperature.

Files: [calibration module](../simulator/pass-history-trace-temperature-calibration.js), [test](../simulator/pass-history-trace-temperature-calibration-test.js), [machine data](./2026-11-02-1551-pass-history-trace-calibration-harness.json).
