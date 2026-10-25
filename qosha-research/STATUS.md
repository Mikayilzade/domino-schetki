# Qoşa research status

Updated: 2026-10-25 11:51:07 +04

## Verified cumulative scale
- **757,717** complete full-round discovery/tournament continuations (**721,807** prior + **35,910** new).
- **1,056,384** forced hidden-world counterfactual continuations (**1,051,200** prior + **5,184** new). Historical 4,000 baseline separate; exploratory 600-deal pilot excluded.
- Engine `qosa-research-0.5.3` / recovered `qosa-1.0.0`; 3×9 primary; four-branch number locking **PROVISIONAL**.
- Fresh disjoint 12,000 deal seeds `1487540..1499539`; next fresh seed **>=1499540**.

## Latest checkpoint
- Added `simulator/branch-legal-equal-pip.js`; two independent cohorts, 35,910 complete discovery trajectories (0 unresolved), **81 selected late legal-choice positions**, **2,592 matched hidden allocations**, **5,184 forced continuations**.
- Both arms are legal within the provisional engine: single tile versus newly number-opening one-double; **discarded pips exactly equal**. Tile identity, remaining doubles and hand shape differ, so this is NOT a pure branch-opening effect.
- Next opponent **1 stone** (33 positions): immediate finish probability **+33.71 ±16.03 pp** for double; focal finish-first **−13.26 ±10.31 pp**.
- Next opponent **2–4 stones** (48 positions): focal finish-first **−14.78 ±6.26 pp**, mean remaining pips **+1.404 ±0.633**, next-opponent playable tiles **+1.233 ±0.254**. Two independent seed cohorts and both continuation bots showed the same direction, but selection/confounding remain.
- Uncorrected exploratory 95% position-cluster intervals; 101-point scoring, real four-branch lock, block-winner, loneZero/bust not validated. No human-play claim yet.
- Data: `runs/2026-10-25-1147-legal-equal-pip-1487540.json` and `runs/2026-10-25-1147-legal-equal-pip-holdout-1493540.json`. V8 CommonJS tests/replay passed, Node CLI not run. No scoreboard/PWA edits.

## NEXT ACTION
- On seeds **>=1499540**, increase exact-pip one-stone positions and stratify by next-opponent mobility and retained double/connector geometry. Seek real-table branch-lock fixture independently.
