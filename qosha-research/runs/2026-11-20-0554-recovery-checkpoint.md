# Qoşa research checkpoint — 2026-11-20 05:54 Asia/Baku

- Source of truth: GitHub README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md; simulator validation-checkout-preflight.js, validation-gate.js, hidden-world-validation-gate.js; simulator-tree-manifest-20261120-current.json.
- Engine: reference qosha-research-0.5.3; rules: recovered qosa-1.0.0, primary 3 players × 9 stones + one stock. Branch unlocking, block winner allocation, loneZero=10 remain provisional.
- Verified source checkpoint: 413-entry manifest pinned to commit d90774a829ca387f6b68fd8a56f3ff397164f140; all six audited critical files appear in its exact path list (validation-checkout-preflight.js, validation-gate.js, hidden-world-validation-gate.js, round-driver.js, initializer.js, forced-pass-support-oracle.js). This is manifest metadata verification only, NOT verification of a complete executable checkout or test pass.
- Executable runtime: Node v22.16.0 available; fresh git ls-remote to github.com failed DNS: Could not resolve host: github.com. No full checkout was obtained.
- Deals: 0 new gameplay rounds. Seeds: none. Strategies: none. Hidden-world samples: 0. Rollouts: 0. Gameplay validation: 0/17 suites executed. Hidden-world validation: 0/4 suites executed.
- Key metrics: win/first-place, mean/median remainder, round length, block rate, −10/−20/−30/−40, starting/ending doubles, specific-double value, branch effects and decision regret NOT measured in this run. Historical persisted 180,000 matched-seat rounds remain a separate legacy subtotal and are not merged.
- New finding: no reliable new strategic result. Confidence high for pinned-manifest membership and observed DNS failure; no runtime validation claim.
- Exact next action: restore access to all 413 manifest-listed files and research contracts in a runnable checkout; execute preflight, 17+4 suites and fingerprint replays, archive raw JSON and timings; fix failures before paired-seed strategy experiments.
- Scope: no live scoreboard/PWA files or GitHub Actions modified.
