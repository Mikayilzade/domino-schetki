# Opening follow-up symmetric-side selector audit

- Timestamp: 2026-11-01 06:45 (+04, Asia/Baku)
- Engine: qosa-research-0.5.3; rules: recovered qosa-1.0.0, 3 players × 9 stones + 1 stock tile.
- Seeds: 3408220–3408719; 500 seed draws, 500 unique full allocations, 0 duplicates.
- Arms: canonical-up default versus seeded symmetric side selector. Same canonical follow-up tile/hand remainder; only side changes. Previous winner = seed mod 3. Continuation mix: min-hand-pips, fast-doubles, moderate-double-hold; 3 seat rotations.
- Matched sample: 1500 paired rounds / 3000 total rounds. Follow-up available 474; forced opening pass 26. Side counts: {"up":118,"left":118,"right":120,"down":118}.
- Outcome kind changed 40/1500 (2.67%): finish→block 16; block→finish 24. Minus changed 75/1500 (5.00%). Both-finish pairs 1411; first finisher changed 158/1411 (11.20%).
- Canonical: 1427 finishes / 73 blocks, mean turn counter 24.168, minus {"0":1218,"-10":205,"-20":4}. Symmetric: 1435 finishes / 65 blocks, mean 24.143, minus {"0":1233,"-10":199,"-20":3}.
- Integrity: follow-up tile mismatches 0; hand-state mismatches 0; 1000 conservation checks, 0 failures. Exact 24-permutation audit: 0 action-set/transition-distribution/seed-residue-mass mismatches; 96 mapped successor outcomes.
- Test: {"passed":true,"replaySeeds":12,"uniqueDeals":12,"matchedRoundPairs":36,"permutations":24,"mappedSuccessorOutcomes":96}. GitHub-fetched modules ran in a V8 CommonJS-compatible harness; clean Node checkout remains DNS-blocked.
- Finding: opening-side representation alone can change outcomes under side-label-sensitive continuation tie-breaks. Tie-break sensitivity only, not strategy superiority. Physical branch symmetry, late reopening, and block/tie scoring remain unauthenticated.
- Strategy-strength comparisons: 0; hidden worlds: 0. This cohort is separate from holdouts and legacy populations.
- Next: hold the symmetric opener fixed; compare side-order continuation tie-breaks with action-orbit/branch-label-symmetric policies on matched seeds, then seek an authenticated physical trace for late reopening and block scoring.
