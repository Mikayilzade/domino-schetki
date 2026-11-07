# Qoşa açdı research — current status

Last checkpoint: 2026-11-07 15:53 Asia/Baku.

## Validation gate (authoritative current state)

- Engine: `qosha-research-0.5.3`; rules: recovered `qosa-1.0.0`, 3 players × 9 stones; branch semantics remain provisional.
- **17/17 validation suite entrypoint files are present in the GitHub `main` simulator directory** (348 directory entries, inspected through GitHub contents API on 2026-11-07). This is a *static presence check*, not execution.
- **0/17 suites executed in this checkpoint**; no green validation evidence. Executable shell still cannot resolve `github.com` (`git ls-remote` DNS failure). Connector access to GitHub source does not supply a local executable checkout.
- Validation commands once checkout is available: `node qosha-research/simulator/validation-fingerprint-replay-test.js` (two complete gate executions), then `node qosha-research/simulator/validation-gate.js`. Archive the actual JSON outputs and inspect failures before any new strategy claims.
- New strategy deals this checkpoint: **0**. Seed set: none. Strategies: none. Win rate, remaining pips, blocks, minuses and regret: not measured this checkpoint. Historical 180,000 matched-seat rounds are a separate legacy subtotal, **not** an all-time cumulative count.
- New finding: all 17 gate suite paths are present, narrowing the immediate blocker to *executable source retrieval / runtime validation*, rather than absent suite entrypoints. Confidence: high for repository listing; none for runtime correctness.
- Exact next action: obtain executable checkout from GitHub, run both validation commands, save their reports in `qosha-research/runs/`, repair any failures, then resume matched-seed comparisons. Do not change PWA files or create GitHub Actions.

## Historical status (not a current validation claim)

2026-11-03 event-level six-order replay of an existing 20M cohort: 1,000 accepted outcomes, 1,035 attempts, 35 redeals, 942 finishes and 58 unscored blocks; 76 completed matches across six orders. The earlier 26 dependent rank changes at gap 11–20 came from only three unique boundaries (560, 801, 856). This was a replay, not new independent deals. Provisional terminal-pip scoring and unresolved physical branch/block rules still limit interpretation.
