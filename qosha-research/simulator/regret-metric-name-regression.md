# Regret metric naming regression

Timestamp: 2026-10-06 20:45 (+04)

`decision-regret.js` now exposes `minusFinishRegret`, because a −10/−20/−30/−40 finish is beneficial and the rate is maximized.

The persisted `decision-regret-test.js` is stale: it still asserts `minusRiskRegret`. Therefore the executable suite is expected to fail until those assertions are renamed to `minusFinishRegret`.

This is a test/API mismatch only; no gameplay statistics are credited from this checkpoint.

Next action: update the three stale test assertions, execute the decision-regret and hidden-world regressions, then persist the first 25-world paired-regret output.
