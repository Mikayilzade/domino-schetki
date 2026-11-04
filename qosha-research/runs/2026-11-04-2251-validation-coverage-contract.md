# Validation gate coverage contract — 2026-11-04 22:51 Asia/Baku

- Engine: `qosha-research-0.5.3`; recovered `qosa-1.0.0` 3×9; branch interpretation provisional.
- New deals executed: **0**. Historical 4,000-deal baseline remains separate; no new strategy cohort or seed set.
- Test seed set configured (not executed): `21000000..21000999` for 1,000 full-round conservation deals. Opening-stock regression selects a deterministic seed by search.
- Strategies: deterministic seeded legal-action selection for invariant smoke only; no strategic policy comparison.
- Change: `simulator/validation-gate.js` now rejects vacuous success payloads for **all seven** suites, including 96 branch-label permutations, all four minus values, 8 illegal actions, 5 terminal fixtures, three opening-stock winner seats, and exactly 1,000 conservation rounds.
- Key metrics: 7 suites wired; 7 suite-specific coverage predicates added; **0 tests executed in this run**; pass/fail unknown.
- Finding: previous gate enforced non-vacuity only for hand-order; a suite could otherwise report `passed:true` with zero cases. This is a validation-harness defect, not a demonstrated gameplay defect.
- Confidence: high from static inspection of current GitHub source and suite report shapes; **unverified at runtime**.
- Limitation: local runtime cannot resolve github.com for clone, so the repository's JS dependency graph could not be executed here. Connector writes work, but do not constitute test execution.
- Next action: run `node qosha-research/simulator/validation-gate.js` in a checkout, record JSON and fix any failures. Then compare strategies on matched new seeds only after gate passes.
- Scope: only `qosha-research/` modified; live PWA files untouched.
