# Independent prior-pass holdout — 2026-10-12 12:52 Asia/Baku

Engine `qosa-research-0.5.3`, recovered rules `qosa-1.0.0`; 3 players × 9 tiles. Independent deal seed search `2400000..2999999`: 136,545 initialized deals scanned, 30 eligible positions selected under min-hand-pips discovery. Exact unseen allocations: 223; compatible with observed next-opponent empty-stock pass history: 149; 13/30 positions informative. 2,142 paired candidate continuations, zero unresolved. Three continuation strategies: closed-branch-control, min-hand-pips, fast-doubles. Deterministic V8 CommonJS test green for seeds 1800303 and 2405676; Node CLI not run.

**Finding (provisional):** Brier error for predicting the next opponent's forced pass, evaluated on both possible next-pass outcomes of each actual original deal (60 paired observations), improved from 0.10344 with uniform unseen-hand distribution to 0.04544 after conditioning on prior observed pass. The preferred action's forecast rank or tie status changed in 6/30 positions, not necessarily a strict reversal. This is a selected small sample; do not claim a general human strategy yet.

Choosing the higher conditional-pass-probability move gave mean finish-first differences +7.54 / +7.97 / +4.35 percentage points across 23 non-tied positions, respectively, but only 7/3/13, 7/3/13 and 3/0/20 positive/negative/tied position counts. **Not a reliable win-rate advantage.** Earlier pass constraints exclude currently unseen stones that would have been playable then; exact posterior probabilities matched brute-force enumeration for all 30 positions.

Cumulative validated full strategy rounds **180,000** unchanged; 0 added. Historical 4,000 separate. This pass's 223 exact allocations and 2,142 candidate continuations are not full strategy rounds.

Reproduce: `node qosha-research/simulator/pass-history-independent-runner.js test`; `node qosha-research/simulator/pass-history-independent-runner.js 2400000 3000000 30`. Data: `runs/2026-10-12-1252-pass-history-independent.json`. Continuation seed formula: `73000000+1000*dealSeed+compatibleAllocationIndex`.

Limits: first-eligible selection, conditioned on target's empty-stock pass only (not full opponent action history), assumed branch opening, bot continuations, no block winner, position-dependent observations and small informative subgroup. Next: disjoint 30+ positions from `3000000..3599999`, position-cluster uncertainty, analyze actual changed move choices, and test alternative policies/hand sizes.
