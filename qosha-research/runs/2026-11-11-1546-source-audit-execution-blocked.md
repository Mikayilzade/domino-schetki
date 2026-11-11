# 2026-11-11 15:46 Asia/Baku — executable validation recovery audit

- Source of truth: GitHub default branch; read README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, and current simulator validation/dispatcher/engine files.
- Engine: qosha-research-0.5.3; rule contract: recovered qosa-1.0.0 (3 players × 9), provisional global-ever-open branch semantics.
- Deals this pass: **0**; seeds: **none**; strategies: **none**; validated suites executed: **0/17**; Monte Carlo tests executed: **0/4**. Historical 180,000 matched-seat rounds are separate; this is not a new cohort.
- Reproduced blocker: `git ls-remote https://github.com/Mikayilzade/domino-schetki.git HEAD` failed with `Could not resolve host: github.com` in the executable shell. GitHub connector successfully read source, but does not expose a runnable checkout.
- Concrete source audit: `turn-dispatcher.js` checks ordinary plays against `openingState.openedNumbers`, and `engine.js` represents double opening as a global number unlock without changing branch geometry. `roundOutcome` assigns no winner on block. Thus branch-local vs global unlocking and blocked-round winner are **model assumptions**, not physically verified rules. This is a source observation, not a new strategic result.
- Evidence limitation: existing validation-gate and fingerprint replay scripts are authored, not executed here. Source inspection cannot establish that the 17 suites pass, nor that Monte Carlo tests pass. No strategy effect is promoted.
- Exact next action: obtain an executable GitHub checkout; run `node qosha-research/simulator/validation-checkout-preflight.js`, `node qosha-research/simulator/validation-gate.js`, and `node qosha-research/simulator/validation-fingerprint-replay-test.js`; archive actual stdout JSON with source SHA and failures; then run Monte Carlo gate and only after green evidence launch matched-seed branch-opening comparisons.
- No live scoreboard/PWA file modified. No GitHub Actions created.
