# 2026-11-25 10:48 Asia/Baku — opening, block and scoring partial execution

Source snapshot ea338a14afec98054313eda33047a7f9809da0d9; engine qosha-research-0.5.3, recovered qosa-1.0.0, primary 3×9+1. Read README, RULES, EXPERIMENTS, RESULTS, STATUS, previous run and gameplay gate. Executed source fetched from main via V8 CommonJS adapter (strict equality, recursive plain-object/array equality, truth assertions); not native Node or complete gate. Tree blob IDs, not independently byte-hashed:
- engine.js 82e5bd544a57683d5b4f7812beb2d4abf80da894
- initializer.js 2fad29e516454580ec9a06115354e9866f3096e6
- turn-kernel.js 94657896e1f8e471ceb2e9a65d1842b6102dff18
- turn-dispatcher.js 55b0bcf3f1653c64b4e06bc95d7e917a480562a0
- opening-stock-regression.js 1bcb7f10199699a27036db4d5e72e38fb306b022
- block-boundary-regression.js d78559079465de940204b607adbdd281487772cc
- pure-scoring-exhaustive-test.js f069c3551ecd5a29822cdbc7a5e2bf84f81df609
- score-minus-regression.js 8e6651e5fcdeba26a0fb483538858bf59564eaad

All four exported run/test calls returned passed:true and satisfied their gate coverage contracts. Opening stock: 38 assertions, deterministic search seed 15, first-round redeal, absent previous winner unresolved; previous winners 0/1/2 respectively pass, play 1-4, play 1-6. Block: 115 assertions, 41 checks, 3 and 5 players, stock-empty threshold and finish precedence; winner unassigned. Pure scoring: 30,132 assertions, 98 minus cases, 7,609 non-double cases, 11,211 floor cases. Score-minus: 18 assertions, 8 minus cases, 4 floor cases, 3 terminal cases, all four minus values. Total 30,303 assertions. No native gate or hidden-world gate run. Branch unlock, block allocation, loneZero remain provisional.

New gameplay deals 0; seed 15 is a fixture only; strategies none; hidden worlds/rollouts 0. No new win, remainder, length, block frequency, minus frequency, double value, branch effects or regret estimates. Prior partial cohorts 11,024 initial deals and 1,000 full rounds; historical 180,000 matched-seat rounds separate. Finding: coded opening stock handling and block threshold/scoring arithmetic pass these fixtures, not a strategy conclusion. Next: illegal-action, hand-order and terminal-minus integration suites, then native Node replay and full pinned checkout/gates. No live files or Actions modified.
