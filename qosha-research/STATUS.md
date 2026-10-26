# Qoşa research status

Updated: 2026-10-26 04:50:13 +04 (Asia/Baku)

## Verified cumulative scale
- **1056735** complete full-round discovery/tournament/policy-swap continuations.
- **1314736** forced matched hidden-world continuations; historical 4,000 separate.
- Engine `qosa-research-0.5.3` / recovered `qosa-1.0.0`, primary 3×9; four-branch number-lock **PROVISIONAL**.
- Latest fresh seeds **1559740..1560339**, 600 deals; next fresh seed **>=1560340**.

## Latest checkpoint
- Added `simulator/broad-policy-contract-audit.js` and `runs/2026-10-26-0450-broad-policy-contract-1559740.json`.
- **21,600** matched complete rounds, 20,883 finishes, 717 blocks, 0 unresolved; four focal policies × three seats × three opponent mixes, 300/300 discovery/holdout.
- Across three opponent mixes, `fast-doubles` minus `closed-branch-control` focal finish-first: **−15.39 / −19.44 / −12.33 pp**, with mean remainder **+1.93 / +1.38 / +1.05 pips**. Same direction in both seed halves. Within-model finding only.
- Reachable-state audit: 36 regression rounds (not credited), 835 turns, 3,070 legal alternatives; tile conservation, source immutability, branch isolation and opening monotonicity passed. Four-side synthetic −40 and scoring contract passed.
- V8 CommonJS deterministic replay passed; Node CLI not executed. No authenticated real-game tactical claim. Live scoreboard/PWA untouched.

## NEXT ACTION
- Test branch-control robustness on disjoint seeds **>=1560340** against alternative opponent policies including random legal; obtain authentic four-branch lock/open and block-winner fixtures. Keep block winner/loneZero/bust/101-match unresolved.
