# Qoşa checkpoint — 2026-11-21 23:53 Asia/Baku

- Source of truth: GitHub README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md, reconstruction and strict verifier/test sources inspected before modification.
- Engine/rules: research qosha-research-0.5.3, recovered qosa-1.0.0; 3 players × 9 tiles + 1 stock. Branch unlock, block allocation, loneZero=10 remain provisional.
- Change: expanded existing strict Git blob/path verifier regression file from 8 to 11 deterministic tests: path traversal, unpinned source commit, and truncated manifest metadata now have explicit negative fixtures. Commit 827758c2762d104b78212e07ccd16e3fb6fdd9fb.
- Execution: local Node v22.16.0 available; git ls-remote fails with "Could not resolve host: github.com". The connector supports individual file reads/writes but not a full executable checkout. New tests **added, not executed**. Full gameplay suites executed 0/17, hidden-world suites 0/4. No claim of passing verification.
- New strategy deals: 0. Hidden-world samples: 0. Decision rollouts: 0. Seed set/range: none. Strategies: none. New win/first-place, mean/median pips, round length, block, minus, double, branch and regret metrics: not measured.
- Cumulative: 180,000 historical persisted matched-seat strategy rounds remain separate from this new-validation cohort (0). No reliable new strategy finding.
- Confidence: high for new static negative test coverage, no runtime validation. Exact next action: recover clean HEAD-pinned research-only checkout, execute strict verifier and 11 regression tests, preflight, 17 gameplay + 4 hidden-world suites and fingerprint replays; archive raw outputs/timings before new matched-seed comparisons. Do not touch live scoreboard/PWA or GitHub Actions.
