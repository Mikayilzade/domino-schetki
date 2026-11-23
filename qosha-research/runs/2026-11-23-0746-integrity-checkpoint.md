# 2026-11-23 07:46 Asia/Baku — strict snapshot regression checkpoint

- Source of truth read: README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md, validation-checkout-preflight.js, validation-gate.js, strict-pinned-415-audit-20261122.js, strict-pinned-415-audit-regression-20261122.js.
- Rules: recovered `qosa-1.0.0`, primary 3 players × 9 tiles + 1 stock; reference engine `qosha-research-0.5.3`. Branch unlock, block allocation and `loneZero=10` remain provisional.
- Added tenth synthetic regression case: unexpected **directory symlink** in simulator snapshot must be rejected as `unexpected symlink` without traversing outside research tree. Source change commit `40a3bbf9188f401ae1ab41bb7a34c117c27062d6`.
- Executable shell check: `git ls-remote https://github.com/Mikayilzade/domino-schetki.git HEAD` failed `Could not resolve host: github.com`. Connector read/write succeeded. Updated regression **not executed**; static inspection is not test validation.
- Gameplay deals: **0**; seed range/set: none; strategies: none; hidden worlds: **0**; rollouts: **0**; full gameplay suites executed **0/17**, hidden-world suites **0/4**. Win/first-place, mean/median pips, length, blocks, minus frequencies, double effects, branch effects and regret: **not measured**. Historical **180,000** matched-seat rounds remain a separate legacy subtotal.
- New finding: additional snapshot-tampering coverage for directory symlinks; **no new reliable gameplay strategy finding**. Confidence: high for source-level test definition, none for execution or engine validity.
- Exact next action: recover a complete single-commit SHA-verified research-only checkout; execute 10 synthetic audit scenarios, strict pinned manifest audit, preflight, 17 gameplay and 4 hidden-world suites and fingerprint replays, archive raw outputs; only then resume matched-seed comparisons.
- No live PWA/scoreboard files or GitHub Actions changed.
