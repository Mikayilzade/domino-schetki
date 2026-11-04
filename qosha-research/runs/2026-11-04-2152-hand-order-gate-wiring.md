# Validation-gate hand-order coverage — 2026-11-04 21:52 Asia/Baku

- Engine/rules: `qosha-research-0.5.3`; recovered `qosa-1.0.0`, 3 players × 9 tiles; branch unlocking remains provisional.
- Deals executed: **0**; new seed range: **none**; strategies: **none** (validation only). Existing conservation seed plan remains `21000000..21000999` for 1,000 deals, **not executed in this checkpoint**.
- Code: wired existing `simulator/hand-order-regression.js` into `simulator/validation-gate.js` and added a nonvacuous coverage requirement (at least three fixtures, positive comparison and transition counts). The hand-order test had previously been authored but was **absent from the aggregate validation gate**.
- Planned gate: opening stock, score/minus, illegal actions, hand order, terminal-minus integration, branch permutation, and round conservation (seven suites).
- Key metrics: **0 newly executed fixtures, 0 newly simulated deals, 0 new strategy outcomes**; planned 96 branch-label permutation comparisons and 1,000 conservation deals remain unverified. No win-rate, pip, block, minus-frequency or regret estimates produced.
- Finding: aggregate gate previously could pass without checking hand-order invariance; that omission is now closed **at source level**. This is a test-coverage correction, not an empirical strategy finding.
- Confidence/limitations: GitHub connector read and persisted source. Local Node is installed but GitHub checkout fails with `Could not resolve host: github.com`; connector cannot execute Node. Passing gate remains unverified. Historical 4,000 tie-replay outcomes and older strategy cohorts are kept separate.
- Exact next action: execute `node qosha-research/simulator/validation-gate.js` in a full checkout, save the actual JSON stdout, repair any failures; only then run fresh matched-seed strategy cohorts and update validated cumulative totals.
- Commit: https://github.com/Mikayilzade/domino-schetki/commit/fab1951474a8af82e2887fc178413a9f06c383bc
