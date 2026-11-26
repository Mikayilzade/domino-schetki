# 2026-11-26 17:52 Asia/Baku — partial validation recheck

Engine qosha-research-0.5.3 / recovered qosa-1.0.0, primary 3×9+1. Read current README, RULES, EXPERIMENTS, STATUS and both validation gates. RESULTS.md (1,048,869 bytes, blob 8f7c3b421aca1f35284d8c8ee8ed7c54d6bdd633) could not be fetched due to connector size limit; prior linked run report 20261125-1250-permutation-conservation-partial.md was read instead. Current main source fetched via connector, executed exported tests in V8 CommonJS adapter with strict equality and recursive object/array equality; not native Node, not a pinned or independently byte-verified checkout.

Actual results:

- initializer-redeal-conservation-audit: passed; seeds 12000000..12000023, 24 unique allocations, 72 previous-winner initializations, 1 first-round redeal, 2433 internal assertions.
- redeal-full-round-audit: passed; 12 accepted first rounds starting seed 15001000, 12 continuation seeds starting 16001000; 24 rounds, 566 transitions, 590 inventory snapshots, 5907 internal assertions; deterministic replay. Same fixture seeds as previous tests, not additional unique strategy deals.
- branch-permutation-regression: passed; 4 constructed fixtures, 96 permutations, 480 action transitions, 3326 adapter assertions. Coverage per fixture (single,double sequence,multi-double,mixed): (4,0,0,0), (1,4,2,0), (0,4,2,2), (1,4,2,0). Prior linked report's fixture failure did not reproduce on current source; do not infer physical branch semantics.

Total reported assertions 11666 (mixed internal and adapter counters, not independent statistical samples). Strategies: deterministic invariant-test legal action selection only. New unique strategy deals 0; hidden worlds 0; win/first place, mean/median remainder, round length, block/minus rates, double value, branch strategy effects and regret not measured. Historical 180000 matched-seat rounds separate. No new reliable strategy finding. Formal native gate remains unverified; branch unlock, block allocation and loneZero remain provisional.

Next: execute hidden-world exported suites in partial adapter if native checkout remains unavailable; prioritize complete pinned research-only source snapshot and both native gates/fingerprint replays. Keep run reports separate rather than expanding oversized RESULTS.md. No live PWA or Actions changes.
