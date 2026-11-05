# 2026-11-05 12:46 Asia/Baku — validation evidence accounting fix

- Engine/rules: `qosha-research-0.5.3` / recovered `qosa-1.0.0`, primary 3×9; physical branch/block/loneZero rules still provisional.
- Read GitHub source of truth: `README.md`, `RULES.md`, `EXPERIMENTS.md`, `RESULTS.md`, plus `simulator/validation-gate.js`, `simulator/seed-deal-regression.js`, `simulator/block-boundary-regression.js` and latest run report.
- New executed deals: **0**. Seeds: none. Strategies: none. New strategy findings: none. Historical 180,000 matched-seat rounds remain separate from newer validation fixtures.
- Concrete defect: aggregate gate previously copied `summary.deals` from the conservation suite even if that suite exited unsuccessfully or failed its coverage contract. This could falsely report 1,000 executed/validated conservation deals on a red gate.
- Fix: `dealsExecuted` now credits the conservation suite only when its exit and coverage contract pass. Added `verifiedSuites` and `failedSuites` diagnostic fields for actionable gate triage. This does not assert that a failing suite executed zero iterations; it deliberately reports only **verified** coverage.
- Confidence: high for source-level accounting correction; **not runtime-tested**. The container still cannot resolve github.com (`git ls-remote` DNS failure), and the GitHub connector cannot execute Node. Full 12-suite test status remains unknown.
- Exact next action: run `node qosha-research/simulator/validation-gate.js` in an executable complete checkout, inspect `failedSuites`, save actual gate JSON and fix any failure. Only then resume matched-seed policy comparisons.
- Live scoreboard/PWA untouched.
