# 2026-11-19 12:49 Asia/Baku — 409-file SHA drift diagnostics

- Engine/rules: `qosha-research-0.5.3` / recovered `qosa-1.0.0`; 3 players × 9 tiles primary. Branch unlock, block allocation, and loneZero remain provisional.
- Source of truth: GitHub README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md, validation-checkout-preflight.js, validation-gate.js and hidden-world-validation-gate.js inspected before editing.
- Change: `simulator/validation-checkout-preflight.js` now computes Git blob SHA-1 and byte-length drift for every existing file in the newest 409-path single-commit manifest, with `latestManifestDriftCount` and `latestManifestDrift` report fields. The older 406-path manifest already had this audit; the newest 409-path manifest lacked it. Legitimate post-snapshot edits remain diagnostic/nonblocking, while missing or unsafe paths still fail closed.
- Verification: static connector source inspection and successful GitHub write only. Not executed against a complete checkout; **not** a green gate. Local `git ls-remote` still failed with `Could not resolve host: github.com`.
- Deals: **0**; seed range: none; strategies: none; sampled hidden worlds: **0**. Gameplay suites executed: **0/17**; hidden-world suites: **0/4**. Win rate, pips, round length, blocks, minus frequencies, double ownership, branch effect and regret not measured.
- New finding: the newest pinned inventory had a diagnostics gap; now corrected in source. This is infrastructure progress, **not** a strategic finding. Confidence high for code diff, none for runtime validation.
- Cumulative scale: historical 180,000 matched-seat rounds remain a separate legacy subtotal; no new validated rounds.
- Exact next action: restore executable research-only checkout or reconstruct all 409+ files via connector, run preflight and both validation gates, archive actual JSON and wall-clock time, fix failures, then resume matched-seed strategies under explicit rule assumptions.
- Scope: only `qosha-research/`; no live scoreboard/PWA files or GitHub Actions changed.
