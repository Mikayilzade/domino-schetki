# Score-floor and round-kernel regression checkpoint — 2026-11-02T19:08:35+04:00 (Asia/Baku)

## Scope

This is a deterministic implementation-contract audit, not a gameplay cohort. No deals were simulated and no strategy was compared. The primary context remains recovered `qosa-1.0.0`, 3 players × 9 stones; four-branch opening and block/scoring interpretations remain provisional where noted in `RULES.md`.

## Tests run

Node v22.16.0. Repository source files were fetched from GitHub and their Git blob hashes were verified before running the copied modules in an isolated temporary directory; a full git clone was unavailable because the container could not resolve GitHub DNS.

- New `score-floor-contract-test.js`: **41,237 assertions passed**. Exhaustive integer score states 0–101 × deltas −40…+40 (8,262 pairs), floor/nonnegative/idempotence/exact-delta checks, monotonicity across 8,181 adjacent-score pairs, valid −10/−20/−30/−40 finish values, and invalid finish-minus inputs.
- Existing `turn-test.js`: passed (draw one then play-or-pass, stock exhaustion, pass counting, block gate).
- Existing `four-branch-lock-kernel-test.js`: passed; 24 orders for a four-double sequence, locked/unlocked number behavior and a synthetic −40 finish.
- Existing `block-score-fixtures.js`: passed, 22 assertions; per-seat pip remainders, unique/tied minimum, zero-pip hand, stock/pass threshold. The model intentionally does not infer a block winner.
- Existing `finish-minus-test.js`: passed for 1–4 ending doubles.

Verified source blob hashes: `engine.js` 82e5bd544a57683d5b4f7812beb2d4abf80da894; `turn-kernel.js` 94657896e1f8e471ceb2e9a65d1842b6102dff18; `turn-dispatcher.js` 55b0bcf3f1653c64b4e06bc95d7e917a480562a0; `block-score-fixtures.js` 539a65046f6d8dfb7ee98afad8e17463de06f2a9; `finish-minus-test.js` 4903f9ba2789773bed6f81e96d83589cfcf72bff; `turn-test.js` 598d08fa4e593bf7d3eee376108d7d574f1ec820; `four-branch-lock-kernel-test.js` c06fc39a13babd0dc70baa6ed217d92a094bac64.

## Finding

The implemented score floor and finish-minus mapping satisfy the tested finite contracts. The draw/pass, four-branch lock/open, block-remainder and −10…−40 checks are internally consistent in the research kernel. This is not confirmation of physical table rules and yields **no new tactical finding**.

The current research kernel resolves round outcomes and a score-delta floor, but does not yet implement a complete match-level scorer for the `loneZero=10` setting or 101-point bust. Those semantics must not be inferred from the parameter names. Block winner/tie allocation also remains unauthenticated.

## Scale and limitations

- New deals: 0; seed set: none; strategies: none.
- Separate historical/new game cohorts unchanged: 88,886 deal allocations, 1,074 selected multi-action positions, 5,863 state-world assignments; additive cohort summaries, no global deduplication.
- Confidence: exact finite test coverage of the coded contracts only. No physical-rule authentication, match-level scoring inference, or strategy promotion.

## Exact next action

Clarify the intended meaning and timing of `loneZero=10` and the 101-point bust rule before adding match scoring. Then add a match-score integration fixture that keeps score floor separate from block-winner assumptions; continue branch/block rule validation. Do not start large strategy batches until the scoring and branch semantics are sufficiently authenticated.

- Test: [score-floor-contract-test.js](../simulator/score-floor-contract-test.js)
- Data: [JSON run record](./2026-11-02-1908-score-floor-round-invariants.json)
