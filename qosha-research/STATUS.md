# Qoşa research status

Updated: 2026-10-25 16:56:32 +04

## Verified cumulative scale
- **861735** complete full-round discovery/tournament continuations.
- **1077568** forced hidden-world continuations. Historical 4,000 separate.
- Engine `qosa-research-0.5.3` / recovered `qosa-1.0.0`, primary 3×9; number locking **PROVISIONAL**.
- Fresh disjoint cohorts `1522940..1528939`, `1528940..1534939`; next seed **>=1534940**.

## Latest checkpoint
- 12,000 distinct deals, 35503 complete discovery continuations, 32 positive-gap and 32 observational negative-gap controls, 4096 forced continuations.
- Positive-gap next-opponent immediate finish **+61.52 ±8.03 pp**, focal finish-first **-26.95 ±13.24 pp**; exploratory uncorrected position-cluster normal half-widths. Both independent cohorts same direction.
- By X: 2-2 n=20, 3-3 n=9, 4-4 n=2, 5-5 n=1, 6-6 n=0. High X underpowered, no human-play rule.
- Full raw rows, metrics, seed formula and strata: `qosha-research/runs/2026-10-25-1650-positive-gap-x-strata-1522940.json`. Reproduce `node qosha-research/simulator/connector-positive-gap-runner.js test`; `node qosha-research/simulator/connector-positive-gap-runner.js 1522940 6000 32`; repeat with `1528940`.
- Deterministic V8 CommonJS regression passed; Node CLI not executed; live scoreboard/PWA untouched.

## NEXT ACTION
Fresh seeds **>=1534940**: oversample eligible late legal positive-gap positions X>=4 rather than selecting only the first eligible one-stone state; independent holdout and alternate continuation policy; authenticate real four-branch number locking and block winner. Finish-first != 101-point match win.
