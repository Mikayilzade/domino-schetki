# 2026-11-05 02:46 Asia/Baku — seeded-deal reproducibility gate

- Engine/rules: qosha-research-0.5.3 / recovered qosa-1.0.0; 3 players × 9 tiles, one stock; branch/block semantics remain provisional.
- Executed deals: **0**; authored deterministic seed set **22000000..22001023** (1,024 fixtures pending execution). Strategies: none; invariant test only.
- Change: `simulator/seed-deal-regression.js` checks repeated seed equality, 28 unique double-six tiles, 9/9/9/1 allocation, shuffle order, and unexpectedly duplicated deals. `simulator/validation-gate.js` now requires its structured coverage; nine suites planned.
- Key metrics: 1,024 fixture seeds specified; **0 runtime-verified**, no new win/remaining-pips/block/minus/regret measurements. Historical 4,000 PWA tie-replay outcomes remain separate; last documented persisted strategy scale 180,000 matched-seat rounds, **not increased**.
- Finding: seed/deal reproducibility is now an explicit precondition for any matched-world policy comparisons, rather than an implicit assumption. **No new strategic finding.**
- Confidence/limitations: GitHub source persisted; this connector runtime cannot execute Node modules from the repository. The >1,000 unique-deal guard is a coarse RNG smoke threshold, not a statistical randomness certification. Tests do not authenticate physical rules.
- Exact next action: execute `node qosha-research/simulator/validation-gate.js` in a repository checkout, capture the JSON and fix failures; only then run fresh matched-seed strategy experiments. Do not modify scoreboard/PWA files.
