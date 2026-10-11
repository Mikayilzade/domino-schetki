# Independent exact late-double holdout — 2026-10-11 04:51 Asia/Baku

Engine `qosa-research-0.5.3`; recovered rules `qosa-1.0.0`; 3×9. Scanned **1,256 deals** starting at seed **82000**, selected **60 positions** (30 X=0 / 30 X>0) using **min-hand-pips** discovery, not the earlier closed-branch-control discovery. Exhaustively enumerated **500** hidden allocations and **5,148** candidate continuations, with zero unresolved. All exact-world regression fixtures passed in the V8 CommonJS harness; Node CLI not run.

Holding X-X by playing an X-Y connector rather than opening X-X: finish-first **+30.80 pp** closed-branch-control (36 positive, 24 tied, 0 negative positions), **+26.99 pp** min-hand-pips (32/28/0), **+23.94 pp** fast-doubles (26/34/0). Opening increased immediate next-player legal-finish opportunity by **9.75 pp**. These are equal-weighted position and action-class effects, not universal optimal-play estimates.

Cumulative verified full strategy rounds remain **180,000**; historical 4,000 separate. Exact late-game allocation counts tracked separately: 671 previous + 166 one-stone + 500 new = 1,337 position-world allocations (not distinct full deals).

Reproduce: `node qosha-research/simulator/exact-minpips-holdout-runner.js test` then `node qosha-research/simulator/exact-minpips-holdout-runner.js 82000 90000 30`. Full per-position results in `runs/2026-10-11-exact-minpips-82000.json`.

Confidence: repeated model-specific direction on independent seeds/discovery, but branch-opening rules remain assumption-labelled; uniform unseen allocations ignore opponents' prior decisions, block winners are not assigned, and first-eligible quotas bias selection. Position intervals exploratory. **Next hypothesis:** matched non-pattern double-versus-single controls, then one-stone independent holdout with min-pips discovery.
