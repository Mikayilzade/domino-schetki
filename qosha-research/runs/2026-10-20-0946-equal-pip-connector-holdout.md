# Qoşa açdı — equal-pip connector preservation independent control
Timestamp: 2026-10-20, 09:50 Asia/Baku (+04).
Engine `qosa-research-0.5.3`, rules `qosa-1.0.0`, mode 3×9.
Validation: V8 CommonJS deterministic tests passed: {"newRunner":{"passed":true,"positions":1,"forced":24},"priorRunner":{"passed":true,"positions":3,"forced":48},"crossfit":{"passed":true,"selected":3,"forced":64}}. Node CLI not run.
Reproduce: `node qosha-research/simulator/connector-equal-pip-preservation-holdout.js test`; then `node qosha-research/simulator/connector-equal-pip-preservation-holdout.js 1307000 8000 64 28`.
Fresh discovery seeds **1307000..1314999**, 8000 scanned deals, 1997 late-double states, 29 eligible equal-pip connector-choice states, 28 selected; **1792 matched hidden allocations** (32 training + 32 holdout per state), **8576 forced continuations**, 0 unresolved.
Same fixed visible state and same hidden worlds; compare ordinary single that keeps X-X + X-Y with ordinary single that breaks it **while discarding the same number of pips**. Lowest common discarded pip sum preselected, best action per class chosen only on training worlds; separate holdout worlds measure result. Continuation bots: min-hand-pips and closed-branch-control.
- min-hand-pips: keep minus break first-finisher 17.75 pp, exploratory position CI [7.47 pp, 28.02 pp]; remainder -1.268 pips, minus finish 11.50 pp; keep/tie/break 15/9/4.
- closed-branch-control: keep minus break first-finisher 21.21 pp, exploratory position CI [11.22 pp, 31.19 pp]; remainder -1.520 pips, minus finish 18.19 pp; keep/tie/break 18/8/2.
**Finding:** Equal-pip comparison controls immediate pip shedding, but does not control which branch/end is altered; no human-game causal claim. Both exploratory position CIs exclude zero in this selected subgroup.
Limitations: only 28 selected late positions, branch-number opening provisional, deterministic bots, uniform unseen worlds conditional on public passes but not full history, first finisher not match winner, block winner unspecified, exploratory unadjusted CIs; 5-player and loneZero not studied.
Cumulative scale: **266,700** validated full strategy rounds unchanged; **66,768** earlier paired continuations + **8576** this run = **75344** paired continuations, separate from full rounds and historical 4,000.
Exact next hypothesis/action: replicate equal-pip test on disjoint seeds **1320000..1329999** with >=32 test worlds/state; stratify by whether keep/break placements create identical post-move active branch-end multisets to separate connector retention from branch geometry. Do not merge with old baseline.
Full per-position rows and strata: `runs/2026-10-20-0946-equal-pip-connector-holdout.json`.
