# Tie-break priority holdout — 2026-10-17 08:55 Asia/Baku

- Engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0`; 3×9. No gameplay-rule changes.
- Test: deterministic repeat on 12 seeds × 3 rotations per mode; primary strategy-score invariant checked on all legacy-path decisions; test passed.
- Fresh seeds: `818000..818799`; 800 deals × 3 rotations = 2400 rounds/mode. **Only tile-first mode is newly credited**; legacy, side-free and to-first are matched counterfactual replays.
- Strategies: closed-branch-control / min-hand-pips / fast-doubles.
- Blocks (out of 2400): legacy 109; side-free 18; tile-first 12; to-first 18; all modes have 0 unresolved.
- Distinct-tile divergence from legacy at identical observed legacy-path decisions: side-free 628/52135; tile-first 672/52135; to-first 628/52135.
- Legacy-path primary policy-score mismatches: 0. These are tie-break interventions, not changes to the strategy's main objective.
- Closed-branch-control finish-first: legacy 47.00%; side-free 48.67%; tile-first 49.08%; to-first 48.67%.
- Finding: choice among **different tiles with equal primary score** is highly sensitive to how side, tile and destination are ordered in the deterministic tie-break. A block-rate change after removing side labels cannot be attributed solely to physical branch choice. This is a software-policy sensitivity, not a validated human strategy.
- Confidence: high for this deterministic paired comparison; provisional branch-opening semantics, simplistic bots, fixed initializer follow-up, block winner unassigned, no 5-player/loneZero.
- Cumulative validated complete rounds: previous 210000 + newly credited 2400 = **212400**; historical 4000 excluded. Counterfactual replays not counted twice.
- Reproduce: `node qosha-research/simulator/tiebreak-priority-holdout.js test`; `node qosha-research/simulator/tiebreak-priority-holdout.js run 818000 800`.
- Exact next action: build a side-permutation-invariant state/action key, then repeat on disjoint seeds while explicitly fixing distinct-tile ranking; verify whether block-rate shifts persist.
- Full data: `runs/2026-10-17-0855-tiebreak-priority-holdout.json`.
