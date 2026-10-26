# Qoşa research status

Updated: 2026-10-26 05:55:13 +04 (Asia/Baku)

## Verified cumulative scale
- **1065375** complete full-round discovery/tournament/policy-swap continuations.
- **1314736** forced matched hidden-world continuations; historical 4,000 separate.
- Engine `qosa-research-0.5.3` / recovered `qosa-1.0.0`, primary 3×9; four-branch number-lock **PROVISIONAL**.
- Latest fresh seeds **1560340..1560579**, 240 deals; next fresh seed **>=1560580**.

## Latest checkpoint
- New `simulator/random-opponent-policy-holdout.js` and `runs/2026-10-26-0553-random-opponent-holdout-1560340.json`.
- **8640** matched complete rounds, 8326 finishes, 314 blocks, 0 unresolved; four focal policies × three seats × three opponent mixes; 120/120 discovery/holdout.
- random-legal+random-legal: fast−closed finish-first -18.89 ±4.13 pp, discovery -18.89, holdout -18.89 pp; remainder +1.49 pips; min−closed -8.06 pp; moderate−closed -7.36 pp.
random-legal+closed-branch-control: fast−closed finish-first -18.33 ±4.04 pp, discovery -17.22, holdout -19.44 pp; remainder +2.12 pips; min−closed -9.44 pp; moderate−closed -7.08 pp.
random-legal+min-hand-pips: fast−closed finish-first -19.72 ±4.14 pp, discovery -17.50, holdout -21.94 pp; remainder +1.28 pips; min−closed -10.69 pp; moderate−closed -7.36 pp.
- Deterministic replay, four-branch synthetic and score/block contract tests passed. Node CLI not executed; V8 CommonJS execution. No live scoreboard/PWA edits.
- Within-model findings only. Opening geometry, block winner, loneZero, bust, and 101-point match scoring remain unvalidated.

## NEXT ACTION
- Independent seeds **>=1560580**: test branch-control robustness against a stronger tempo/mobility hybrid and mixed random opponents, then obtain authentic four-branch lock/open and block-winner fixtures. Do not promote real-game tactical claims before geometry validation.
