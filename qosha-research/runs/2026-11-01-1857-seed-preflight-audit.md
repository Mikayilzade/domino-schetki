# Seed preflight — locked 10% prior holdout

- Timestamp: 2026-11-01 18:57:59 +04 (Asia/Baku)
- Engine/rules: `qosha-research-0.5.3`; recovered `qosa-1.0.0`, 3×9 + 1 stock.
- Cohort: seeds `3413170–3413569`, 400 deals; deal-level preflight only.
- **400/400 unique complete allocations; 0 duplicate deals.** All 400 deals passed 28-tile conservation and deterministic replay checks.
- Across 1,200 dealt hands, mean doubles/hand was 2.2542 (hypergeometric expectation 2.25); mean pips/hand 54.0367 (expectation 54). The `1-1` was in a player hand in 387 deals and in stock in 13; expected stock count is 14.29.
- Per-double ownership counts (`0-0` through `6-6`): 380, 387, 382, 388, 390, 390, 388; expectation per double is 385.71.

## Finding and limitation

This is a clean seed/deal sampler preflight, not a strategy result. It did not simulate any game rounds, extract pass labels, compute Brier/regret, or change the preregistered prior. **No reliable new tactical finding.**

The full pass-choice holdout was not executed because a clean repository checkout could not be launched: container GitHub access failed at DNS resolution. Node v22.16.0 ran a standalone deal-level harness matching the `engine.js` seed/deal functions; the committed runner imports the repository engine and is reproducible in a full checkout.

## Cumulative scale

- Separate validation/opening/tie-break cohorts: 7,150 (unchanged).
- Reachable-position property audit: 39,262 (unchanged).
- Strategy-strength holdout: 1,500 deals / 18,000 arm-rounds (unchanged; +120-deal / 1,440-arm pilot remains separate).
- New deal-level preflight: 400 unique allocations, recorded separately and not added to strategy samples.

## Exact next action

Run the locked 10% closed-control prior pass-choice holdout on seeds `3413170–3413569`, without reselection; report state-clustered Brier plus unique hidden-world and ESS accounting. If the interval again includes zero, close choice-history weighting as unsupported and prioritize authenticated physical branch-opening/block-scoring traces.
