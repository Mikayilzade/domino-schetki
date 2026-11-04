# Tie-trace execution gate — 2026-11-04 05:46 Asia/Baku

- Engine: `qosha-research-0.5.3`; recovered `qosa-1.0.0` 3×9; active PWA v16 tie overlay.
- New deals: **0**. Reuse only four previously persisted, separate accepted-deal cohorts starting at seeds `17000000`, `18000000`, `19000000`, `20000000`, 1,000 accepted deals each. Do not treat the 6 orders as independent deals.
- Strategies: seeded hash selection among legal moves (unchanged; not a strategy comparison). Score mapping: provisional terminal pip sums plus finisher minus; blocks unscored.
- Baseline reference expectations **not newly validated**: 4,000 accepted outcomes, 11 unique tie-containing match boundaries, 30 tie arms, 66 total order traces (including non-ties).
- Read and inspected current `README.md`, `RULES.md`, `EXPERIMENTS.md`, `RESULTS.md`, `simulator/pwa-v16-eleven-tie-traces.js`, its regression, `finish-score-match-integration-v16.js`, `match-scoring-v16.js`, and `pwa-v16-tie-audit.js`.
- Execution status: **blocked by local GitHub DNS** (`Could not resolve host: github.com`). GitHub connector reads work, but Node cannot obtain a complete repository checkout. **No test passed is claimed** for this checkpoint.
- Code audit: the trace runner checks exact applied event sequence, skipped zeros, pending nonzero events, places, and per-arm state against the v16 adapter; the full regression also requires 6 unique orders for each tie boundary. However the runner's reference census replays the same cohorts again; agreement is not an independent oracle for physical table scoring.
- New methodological finding: even a successful 66-trace replay would validate **internal consistency of a PWA-score adapter**, not legal move / four-branch / block / mixed-finish rules or a practical winning tactic. Do not promote tie-boundary artifacts to strategy advice.
- Confidence: high in the audit scope and the validation distinction; **none** in any new tactical inference.
- Exact next action when Node checkout is available:
  1. `node qosha-research/simulator/pwa-v16-eleven-tie-traces-regression.js`
  2. `node qosha-research/simulator/pwa-v16-eleven-tie-traces-regression.js --full`
  3. `node qosha-research/simulator/pwa-v16-eleven-tie-traces.js > qosha-research/runs/pwa-v16-eleven-tie-traces-verified.json`
  4. Independently verify 11 distinct boundaries, 30 draw arms, 66 order traces, and per-event score arithmetic; persist actual command output and hashes.
  5. Return priority to engine legal-move/branch/block/finish-minus invariants and matched-seed strategy comparisons. Do not start new large cohorts before those checks pass.

No live scoreboard/PWA files were modified.
