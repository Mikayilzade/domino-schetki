# Qoşa research status

Updated: 2026-10-25 17:52:08 +04

## Verified cumulative scale
- **885735** complete full-round discovery/tournament continuations.
- **1095680** forced hidden-world continuations. Historical 4,000 separate.
- Engine `qosa-research-0.5.3` / recovered `qosa-1.0.0`, primary 3×9; number locking **PROVISIONAL**.
- Fresh seed window `1534940..1542939`; next seed **>=1542940**.

## Latest checkpoint
- New `simulator/connector-high-x-runner.js`: full-trajectory targeted legal X-X vs X-Y, X>Y, X≥4. 8,000 unique deals, 24,000 complete trajectories, 283 selected positions, 4,528 matched worlds, 18,112 forced continuations. 0 unresolved.
- Double breakdown: **4-4 n=208, 5-5 n=67, 6-6 n=8**; next opponent had 2–4 tiles in every selected state; **no one-stone positions**.
- High-double minus connector: opponent immediately playable tiles **+1.667**, focal finish-first **−13.96 pp** (min-pips continuation) / **−22.42 pp** (closed-branch continuation). Exploratory noncausal within-engine contrast; arms retain different tiles/doubles. Confidence for 6-6 low (n8); real number-lock rule unverified.
- Raw data and per-X/connector strata: `qosha-research/runs/2026-10-25-1752-high-x-1534940.json`. Reproduce `node qosha-research/simulator/connector-high-x-runner.js test` and `node qosha-research/simulator/connector-high-x-runner.js 1534940 8000 16`.
- Deterministic V8 CommonJS regression passed; Node CLI not executed; live scoreboard/PWA untouched.

## NEXT ACTION
Fresh seeds **>=1542940**: independent high-X holdout with deal-cluster uncertainty; oversample 6-6, separate next opponent 1 vs 2–4; validate authentic four-branch locking and block-winner rules. Finish-first != 101-point match win.
