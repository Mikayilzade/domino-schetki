# 2026-11-11 01:49 Asia/Baku — Monte Carlo source-manifest checkpoint

- Source of truth inspected: `README.md`, `RULES.md`, `EXPERIMENTS.md`, `RESULTS.md`, gameplay validation gate, fingerprint replay test, hidden-world tests and hidden-world validation gate.
- Engine reference: `qosha-research-0.5.3`; recovered `qosa-1.0.0`, primary 3 players × 9 stones + 1 stock. Branch/block/loneZero physical assumptions remain provisional.
- Change: `simulator/hidden-world-validation-gate.js` now records a recursive SHA-256 manifest of all simulator JS/JSON files and a separate SHA-256 manifest of README/RULES/EXPERIMENTS. Rejects simulator symlinks and absence of required Monte Carlo code. Previously only the four suite entrypoints were hashed, so an allocator change could leave their reported hashes unchanged.
- Runtime attempt: `git ls-remote https://github.com/Mikayilzade/domino-schetki.git HEAD` failed with `Could not resolve host: github.com`; GitHub connector reads and writes succeeded. **New source change is NOT execution-validated.**
- New strategy deals: **0**; executed seed set: **none**; strategies: **none**. Gameplay gate **0/17 executed** here; hidden-world gate **0/4 executed** here. First-place rate, mean/median pips, round length, blocks, minus counts, doubles, branch effects and regret **not measured**.
- Cumulative context: historical **180,000 matched-seat rounds** are a separate legacy subtotal; do not merge with new cohorts or claim all-time total.
- Finding: Monte Carlo validation reports previously lacked a full-code identity binding; now the authored report includes source and rules fingerprints. Confidence high for static code comparison, **none for a new strategic claim**.
- Limitation: hashes attest input identity, not correctness; the source manifests and suites still need real runtime execution and independent replay verification.
- Exact next action: obtain executable checkout; run `node qosha-research/simulator/hidden-world-validation-gate.js`, `node qosha-research/simulator/validation-gate.js`, and `node qosha-research/simulator/validation-fingerprint-replay-test.js`; archive raw JSON, fix any failures, then compare matched K>=2/B=1 backed vs unbacked openings.
- Scope: research-only files; no live PWA or GitHub Actions changes.
