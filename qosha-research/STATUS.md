# Latest checkpoint — seed preflight for locked 10% prior holdout (2026-11-01 18:57:59 +04)

- Seeds 3413170–3413569: 400 deal allocations, **400 unique / 0 duplicates**; 400 deterministic replay checks and 400 full 28-tile conservation checks passed.
- Deal sanity: 1,200 hands, mean doubles 2.2542 vs 2.25 expectation; mean pips 54.0367 vs 54. `1-1` in stock 13/400 vs 14.29 expected. No game rounds or strategy outcomes were simulated.
- The fixed 10% pass-choice holdout remains locked and **not yet executed**. No Brier/regret data, no prior reselection, no tactic promoted.
- Cumulative: separate validation/opening/tie-break allocations **7,150**; property-audit positions **39,262**; strategy holdout **1,500 deals / 18,000 arm-rounds** (+120 pilot / 1,440). This 400-deal sampler preflight is tracked separately.
- Execution limitation: container could not resolve github.com for a clean repository checkout. Node v22.16.0 ran a standalone deal-level harness; the committed runner is intended for the full repository checkout.
- Exact next: run the fixed 10% prior on seeds **3413170–3413569** with no reselection and report state-clustered Brier plus hidden-world uniqueness/ESS. If uncertainty persists, close choice-history weighting as unsupported and prioritize physical branch/block authentication.
