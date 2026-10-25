# Qoşa research status

Updated: 2026-10-25 14:54:05 +04

## Verified cumulative scale
- **808,531** complete full-round discovery/tournament continuations.
- **1,070,016** forced hidden-world continuations. Historical 4,000 separate.
- Engine `qosa-research-0.5.3` / recovered `qosa-1.0.0`, primary 3×9; four-branch number locking **PROVISIONAL**.
- Reserved seed windows `1504940..1510939`, `1510940..1516939`; next fresh seed **>=1516940**.

## Latest checkpoint
- 12000 distinct deals, 35510 full discovery continuations, 42 positive X>Y and 42 matched negative-gap positions; 5376 forced continuations. Zero unresolved.
- Positive X>Y: next opponent immediate finish **64.58 pp**; focal finish-first **-20.91 pp** (double minus connector), exploratory position-cluster CIs in `RESULTS.md`.
- Positive-gap means X-X discards **more** pips than X-Y. Still **not causal**: retained tiles and branch geometry differ. Unverified number locking; no block winner/loneZero/bust/101 match validation.
- Reproduce with `simulator/connector-positive-gap-runner.js`; detailed per-position rows `runs/2026-10-25-positive-gap-1504940-1510940.json`. Scoreboard/PWA untouched.

## NEXT ACTION
Fresh seeds **>=1516940**: independent holdout, stratify by X/|gap|/connector count and alternate continuation bot. Confirm real-table four-branch locking and block winner.
