# Round-seat cluster uncertainty for opponent-choice calibration — 2026-11-02T16:51:09+04:00 (Asia/Baku)

- **Purpose:** improve uncertainty reporting for trace-based opponent-choice calibration. This is calibration infrastructure, not a strategy result.
- **Engine/rules:** qosha-research-0.5.3 calibration layer; recovered qosa-1.0.0, 3×9. Global-ever-open/current-only, branch opening, and block/scoring details remain provisional.
- **Deals/seeds:** 0 new deals; no seed set. No simulator cohort was generated.
- **Trace data:** 0 real observed action rows; no temperature fit.
- **Change:** added CR1 cluster-robust standard errors for mean log loss, multiclass Brier, and top-one accuracy, using one round-seat group as the independent unit. The point metrics remain decision-weighted; uncertainty no longer treats repeated decisions in a group as independent.
- **Checks:** isolated hand-calculated CR1 formula fixture passed 4/4 assertions. The repository Node regression was not run because this environment could not resolve github.com for a checkout. The committed test adds checks for a between-group SE signal and the one-group null case; those integration assertions remain unexecuted here.
- **Finding:** no gameplay finding. No real trace corpus, no empirical temperature, and no strategy promoted.
- **Cumulative separate cohorts:** 88,886 deal allocations, 1,074 selected multi-action positions, 5,863 state-world assignments; unchanged additive summaries, no global dedup.
- **Confidence/limitations:** uncertainty is meaningful only with enough independent round-seat groups; CR1 is not reliable with very few groups. It does not resolve legal-action reconstruction or provisional branch/block rules.
- **Exact next action:** collect/import real round-seat grouped traces; run the calibration Node test in a repository checkout; fit only on train groups and evaluate selected temperature on disjoint holdout groups with log loss/Brier and CR1 intervals. Do not claim calibration without traces.

Files: [module](../simulator/pass-history-trace-temperature-calibration.js), [test](../simulator/pass-history-trace-temperature-calibration-test.js), [machine data](./2026-11-02-1651-trace-calibration-cluster-se.json).
