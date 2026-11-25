# Core runtime smoke — 2026-11-25 06:55 Asia/Baku

Rules: recovered qosa-1.0.0; current research core (strategy runner identifies qosa-research-0.5.3). Source fetched from main, simulator tree observed 3969f6deefabe350ac4a00a0e42119f7d1824238. Related journal: [RESULTS](../RESULTS.md).

Executed fetched CommonJS core modules in an isolated JavaScript runtime with a small require/module loader and assertion shim (JSON structural equality, truthiness, throws); not native Node assert or a complete checkout. Existing full-round-invariant-smoke.test(82511000,1000) actually executed. No strategy promotion or full gate claim.

- 1000 continuation deals, seeds 82511000..82511999 inclusive, 1000 unique full allocations, zero duplicates. Previous winner seed % 3; random legal actions, existing smoke policy.
- 191507 smoke assertions passed: exact 28-tile conservation, unique identities, legal selection, pass counter, clockwise advance, termination.
- 939 finishes, 61 blocks (6.1%), zero unresolved; opening followup 940, opening pass 60, stock 1-1 33.
- Finish minus counts: 0:905, -10:34, -20:0, -30:0, -40:0.
- Mean post-opening steps 23.789, median 24, max 32; total 23789.
- Additional shim checks passed: round-test, test, turn-test, dispatcher-test, finish-minus-test, four-branch-lock-kernel-test, score-floor-contract-test, mixed-finish-exhaustive-contract-test. initializer-test failed with TypeError reading length of undefined; investigate loader/test contract before interpreting as engine failure. Total shim checks including smoke 191602.
- Win/first-place by strategy, mean/median pips, specific double effects, branch effects and regret not measured. Block winner allocation and branch opening remain provisional; loneZero unresolved. No hidden-world samples. Full official gates not run.

New finding: core round conservation and termination survived 1000 full random-legal rounds in this runtime; not evidence of physical rule correctness. Historical 180000 matched-seat rounds remain separate, as do prior 10000 opening-only deals.

Next: inspect initializer-test failure, use native Node-compatible assertions or explicitly audited shim, execute remaining core suites and hidden-world modules with same loader, then run matched-seat strategy comparisons only after validation. Preserve official checkout gate distinction. No live scoreboard changes.
