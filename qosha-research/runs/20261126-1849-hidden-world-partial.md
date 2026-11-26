# 2026-11-26 18:49 Asia/Baku — hidden-world partial execution

Engine qosha-research-0.5.3; recovered qosa-1.0.0; primary 3×9+1. Read README, RULES, EXPERIMENTS, STATUS, hidden-world contract and gate; RESULTS raw fetch rejected as oversized (1,048,869 bytes). Existing results untouched.

Executed repository CommonJS sources fetched from main in a V8 adapter with custom assertion shim (strict primitive equality, normalized JSON deep equality including Sets, regex throws). Not native Node, not a pinned byte-verified checkout or full gate. Dependencies: engine, hidden-world, round-driver, turn-kernel, turn-dispatcher, decision-regret, strategy-runner, initializer.

| Suite | Assertions | Result |
|---|---:|---|
| hidden-world-seat-stock-regression-test | 3303 | passed; 300 allocations, seeds 25000000..25000099 across three focal seats |
| hidden-world-empirical-oracle-test | 84008 | passed; 12000 worlds, seeds 24000000..24011999 |
| hidden-world-test | 66 | passed; 25 worlds, seeds 700..724, eight candidates |

Total 87377 assertions; 12325 primary sampled worlds (excluding replay calls), 200 candidate continuations in synthetic fixture, default closed-branch-control. Empirical next-seat counts for zero/one/two specified doubles: 2891/6325/2784, expected probabilities 4/17,9/17,4/17; max absolute deviation 0.005622549 (0.5623 percentage points). Opposite counts 2784/6325/2891. Fixed visible input, conservation and matched candidate sets passed. No new strategy deals; no new win, remainder, length, block, minus or regret estimates reported. Historical 180000 matched-seat rounds separate; do not add repeated validation samples to historical strategy totals.

Finding: narrow allocation and paired rollout regressions pass under adapter; not proof of uniform RNG or physical rules. Branch unlock, block allocation, loneZero remain provisional. Native gate not run; enumeration suite requires crypto. Next: execute enumeration with native SHA-256, reconstruct pinned checkout and run preflight and both native gates; then disjoint matched strategy holdout. No live files or Actions changed.
