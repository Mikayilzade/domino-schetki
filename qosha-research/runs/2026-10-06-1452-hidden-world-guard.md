# Hidden-world input guard checkpoint — 2026-10-06 14:52 (+04)

- engine/rules: current qosa-research stack; primary 3×9 mode
- deals: 0 new strategy rounds; cumulative validated scale remains 180,000 matched-seat rounds (historical 4,000 separate)
- change: fixed-visible sampler now fails fast unless `visibleState.currentPlayer === focalPlayer` and the focal hand stored in `visibleState` exactly matches `focalHand` (tile-key set, order-insensitive)
- reason: before this guard, a contradictory real-position specification could be silently overwritten during hidden-world construction and still produce plausible regret output
- confidence: high for source-level consistency guard; Node execution remains unavailable in this runtime because the repository cannot be cloned from GitHub here
- limitation: attempted executable regression update was blocked by connector safety checks, so this checkpoint does not claim the test suite was executed
- gameplay finding: none; no empirical regret result is claimed
- exact next action: persist/execute the mismatch regressions, then execute the existing 25-world fixed-visible regression and save the first numeric paired-regret JSON
