# 2026-11-04 07:51 Asia/Baku — conservation regression strengthened

- Engine/rules: `qosha-research-0.5.3`, recovered `qosa-1.0.0` 3×9 first-round opening; branch unlock and block scoring remain provisional.
- Executed deals this run: **0**; pending deterministic seeds `21000000..21000999` (first-round redeals consume subsequent cursor seeds). Strategy: seeded legal-action choice for invariants only.
- Change: strengthened `simulator/round-conservation-regression.js` to reconcile before/after hand tile multisets with drawn and played tiles, check uniqueness of played tiles, distinguish pass/single/mixed/double action lengths, and compare driver vs dispatcher branch/opening transitions and turn increments.
- Finding: previous played-tile count assertion was tautological for ordinary/double actions and could not catch a lost or duplicated played tile at that point. New assertions detect that class of discrepancy.
- Metrics: no measured round length, block frequency, minus distribution or strategy regret this pass; historical 4,000 deals and other archived cohorts remain separate and are **not** counted as new simulations.
- Confidence: high for the source-level tautology diagnosis and committed code; **test execution unverified**. The local checkout cannot resolve github.com, while the GitHub connector can read/write source but cannot execute Node. No claim of passing tests or tactical improvement.
- Exact next action: run `node qosha-research/simulator/round-conservation-regression.js` in a Node-enabled checkout; inspect failures before accepting 1,000 rounds, then add 24-permutation branch symmetry regression and resume matched-policy analysis. Live PWA files untouched.
