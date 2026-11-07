# Research checkpoint — 2026-11-07 22:53 Asia/Baku

- Engine: `qosha-research-0.5.3`; rules: recovered `qosa-1.0.0`, 3×9, branch semantics provisional.
- New deals: **0**. Seed range: none. Strategies: none. No new win-rate, pip, round-length, block, minus, double-value, or regret estimates.
- Runtime validation: **0/17 executed in this checkpoint**; no green evidence. No executable checkout obtained. Historical 180,000 matched-seat rounds are a distinct old subtotal; do not add them to a new cohort.
- Static finding: `recursive-input-inventory.js` was still treating nested JS/JSON files as an error (legacy top-level-only assumption), although `validation-gate.js` now hashes the entire recursive JS/JSON tree. Fixed the misleading nonzero diagnostic exit and renamed the metric to `additionalBeyondLegacy`. GitHub commit: `14e43df581b4accb7a9090a7d42aa25620a2eb48`.
- Confidence: high for static source mismatch; **not runtime-tested**. The inventory is not itself proof of full checkout integrity, correct test outcomes, or authenticated physical game rules.
- Next exact action: obtain executable checkout, run `node qosha-research/simulator/recursive-input-inventory.js`, `node qosha-research/simulator/validation-checkout-preflight.js`, `node qosha-research/simulator/validation-fingerprint-replay-test.js`, and `node qosha-research/simulator/validation-gate.js`; archive their actual JSON reports, fix failures, then restart matched-seed strategy experiments.
- Live scoreboard/PWA files unchanged.
