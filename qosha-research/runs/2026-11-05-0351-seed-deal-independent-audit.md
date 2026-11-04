# 2026-11-05 03:51 Asia/Baku — seeded-deal audit (independent execution)

- Engine: `qosha-research-0.5.3` RNG/deal logic as fetched from `simulator/engine.js`; rules: double-six, 3 players × 9 + one stock, branch-independent.
- New strategy rounds: **0**. Deterministic deal-generation checks: **1,024**.
- Seeds: integers **22000000..22001023** inclusive.
- Strategies: none (validation only).
- Method: execute an independent JavaScript transcription of the fetched `mixSeed32`, `xorshift32`, double-six deck and Fisher–Yates shuffle; verify unique full-deck permutations, no duplicated tiles, and stock coverage. This is a narrow RNG/deal audit, **not** execution of the repository's Node test runner or end-to-end simulator.
- Results: **1,024/1,024 distinct permutations**; **0** duplicate/missing-tile failures; **28/28** tile types observed in stock; `1-1` in stock **40/1,024 (3.90625%)**; per-tile stock frequency min **26**, max **50**.
- New finding: the exact next 1,024-seed range selected by `seed-deal-regression.js` passes these independent permutation and stock-coverage checks. This strengthens the deterministic deal gate but does not validate opening, legal moves, block scoring or strategy performance.
- Confidence: high for these directly executed narrow checks, limited because the independent transcription is not the repository test executable and full regression suite remains unexecuted here.
- Cumulative: existing historical and matched-strategy cohorts remain unchanged and separate; **0** new strategic rounds this checkpoint. Do not add the 1,024 deal checks to strategy sample totals.
- Next exact action: execute `node qosha-research/simulator/seed-deal-regression.js` and the repository's aggregate validation runner in a Node environment, record outputs, then address failures before any new strategy cohort.
- Live scoreboard/PWA files: untouched.
