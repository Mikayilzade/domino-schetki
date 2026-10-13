# Matched-double retention checkpoint — 2026-10-14 01:00 Asia/Baku

Engine `qosa-research-0.5.3`, rules `qosa-1.0.0`, 3x9. V8 CommonJS deterministic self-test passed; Node CLI not run.

Reproduce:
`node qosha-research/simulator/matched-double-retention-runner.js test`
`node qosha-research/simulator/matched-double-retention-runner.js 2985000 3065000 30 60`
`node qosha-research/simulator/matched-double-retention-runner.js 3065000 3145000 30 60`

Method: first eligible action pair after two consecutive verified empty-stock passes. Compare retaining versus spending one more double, controlling discarded pip sum, K (number of newly playable unknown tiles) and remaining hand size. All candidates use identical hidden worlds and continuation seeds; three continuation policies: closed-branch-control, min-hand-pips, fast-doubles. World seed `(930000000+Math.imul(dealSeed,677)+worldIndex)>>>0`.

Discovery: 45,342 deals scanned; 30 selected positions, 1,800 hidden worlds. Holdout (disjoint): 43,878 deals scanned; 30 positions, 1,800 hidden worlds. Total 3,600 worlds, 10,800 policy-world evaluations, 0 unresolved, 0 new complete strategy rounds.

Keep-minus-spend finish-first deltas (discovery / holdout, percentage points):
- closed-branch: +28.00 (exploratory 95% CI +16.22..+39.78) / +33.94 (+21.96..+45.93).
- min-hand-pips: +26.61 (+14.46..+38.77) / +28.11 (+15.34..+40.88).
- fast-doubles: +27.83 (+16.03..+39.63) / +24.28 (+11.53..+37.03).
Minus-finish deltas: closed +39.50 / +34.33 pp; min-pips +35.33 / +30.50 pp; fast-doubles +35.33 / +26.17 pp. Closed-branch mean remainder difference -1.22 / -1.71 pips.

Discovery selected seeds: 2988116,2989006,2989575,2990700,2991229,2991714,2995935,2996027,2996301,3001434,3004224,3006093,3009589,3012104,3012590,3012745,3013705,3013962,3014914,3015724,3018836,3019380,3020529,3020568,3024158,3024866,3026182,3027574,3030218,3030341.
Holdout selected seeds: 3066102,3066875,3072112,3073053,3074777,3075337,3076869,3077474,3079545,3081207,3083527,3086669,3086845,3092294,3093243,3094648,3096914,3097654,3099005,3102632,3102932,3103122,3104742,3106013,3106808,3106928,3108182,3108302,3108549,3108877.

Provisional finding: retaining a double rather than spending it can be strongly favorable in selected two-pass positions, e.g. hand 0-4,2-5,2-2 (seed 2988116): play 0-4 and keep 2-2 plus its connector. NOT a general causal rule: matched K count is not matched exact branch geometry, the ordinary-vs-double action changes opening state, and 2-2/3-3 dominate. Uniform hidden-world prior, first-eligible selection, assumed branch rules, deterministic bots, block winner unassigned, exploratory intervals.

Verified cumulative full strategy rounds unchanged: 180,000 (historical 4,000 separate). Next: fresh earlier-game and number-balanced holdouts, exact branch geometry control, connector/nonconnector and -10/-20 stratification; Node CLI verification.
