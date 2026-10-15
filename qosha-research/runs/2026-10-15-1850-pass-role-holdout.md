# Pass-role holdout — 2026-10-15 18:50 +04 (Asia/Baku)

Engine: qosa-research-0.5.3; rules: recovered qosa-1.0.0 (provisional branch semantics); mode 3 players x 9.

New deterministic scan: seeds 330000..399999, 27,980 deals inspected, first 50 eligible positions selected using closed-branch-control. Exact 451 hidden allocations and 2,706 paired candidate continuations. Continuation strategies: closed-branch-control, min-hand-pips, fast-doubles. Continuation seed formula: 61000000 + 1000*dealSeed + lexicographicAllocationIndex.

Old pass evidence permits 416 of 451 worlds. Persistent empty-stock pass evidence (including subsequent played stones) permits 389; **27 additional worlds eliminated** (6.49% of 416).

Pass-role stratification: retained next-player passes in 6 positions, third-player passes in 36 positions, both in 1. All 27 additional exclusions were attributable to third-player retained passes, zero to next-player retained passes, using Shapley average of two role-addition orders. This is **not a general strategy rule**, because the evidence exposure is strongly imbalanced.

Equal-pip connector minus unrelated single: finish-first delta before/after pass conditioning: closed-branch-control -6.43 to -7.60 percentage points; min-hand-pips -5.16 to -6.50; fast-doubles +3.31 to +3.31. No reliable new gameplay rule.

Scale: 0 new full strategy rounds; cumulative validated full rounds remain 180,000 (historical 4,000 separate). 451 hidden allocations are separate, not full rounds.

Validation: existing pass-history-persistent-runner.js self-test passed in V8 CommonJS, as did an isolated deterministic attribution fixture (seed 281304); Node CLI was not executed. The existing runner can reproduce all policy outcomes using: node qosha-research/simulator/pass-history-persistent-runner.js 330000 400000 50. Full per-position JSON was not persisted here.

Method: for each observed pass with empty stock, reconstruct pass-time hand from hypothetical current hand plus publicly played stones after that pass. Attribute marginal eliminations to next or third opponent by averaging both addition orders. The true hidden deal remains compatible.

Confidence/limitations: exact conditional allocation counts under assumed branch rules, equal allocation prior, deterministic bot continuations, first-eligible position selection, no conditioning on voluntary choices, unassigned block winner, exploratory comparisons.

Next hypothesis/action: fresh 400000..480000 seeds, balance samples by pass role (target >=25 positions each), compare eliminated worlds per exposed position and next-turn pass prediction; persist executable role-attribution code and run Node CLI regression.
