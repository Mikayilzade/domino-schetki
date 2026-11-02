# Opening-to-round-driver integration and full-round invariant smoke — 2026-11-03T00:54:58+04:00 (Asia/Baku)

## Scope

- Engine/rules: qosha-research-0.5.3; recovered qosa-1.0.0; primary 3 players × 9 stones plus one stock tile.
- This is transition validation, not strategy evaluation or physical-rule authentication.
- Exact GitHub source blob hashes for engine.js, initializer.js, turn-kernel.js, turn-dispatcher.js, and round-driver.js were verified in the isolated Node v22.16.0 harness before execution.

## Opening-to-round-driver cycle fixtures

A new integration test exercises two constructed, tile-identity-complete 3×9 deals:

1. Mandatory follow-up: the 1-1 owner draws the sole stock tile, follows with 1-2, then the next two seats both play. The queue returns to the starter after exactly two turns; pass count remains 0.
2. Forced opening pass: the starter cannot follow on 1, so the initializer records pass count 1. The next seat plays 0-1; that resets the count to 0. The following seat has no legal move and passes; the queue returns to the starter with pass count 1 and no premature block.

The test checks legal action selection, clockwise advancement, turn/pass counters, the finish/block gate, and exact conservation of all 28 unique tile identities. **69 assertions passed.**

## Full-round deterministic invariant smoke

- Seed draws: 500, range 7,100,000–7,100,499.
- Unique full allocations: 500; duplicate allocation pairs: 0.
- All rounds use continuation initialization; if 1-1 is in stock, previous winner is set to seed modulo 3. Opening follow-up uses the initializer's canonical-up convention.
- Continuation policy: deterministic random-legal selection, uniform over the dispatcher action array, using local xorshift32 seeded by seed XOR 0x5a17c3e1. This is a smoke policy, not a benchmark strategy.
- **95,619 assertions passed** across every transition: legal-action existence, 28-tile count and identity conservation, turn increment, pass increment/reset, clockwise advance, and resolution before a 250-turn cap.

Observed under this coded model and smoke policy only:
- Finish: 475/500 (95.0%); block: 25/500 (5.0%); unresolved: 0.
- Round length: mean 23.758 turns, median 24, maximum 31.
- Opening follow-up played: 472; opening pass: 28; 1-1 in stock: 12.
- Finish-minus counts: 0 = 459; −10 = 16; −20/−30/−40 = 0.

These outcome frequencies are descriptive for this synthetic policy and provisional branch/block model; they are not tactical evidence and should not be compared to the historical baseline.

## Regression checks

The following isolated Node regressions also passed: initializer-test.js, turn-test.js, dispatcher-test.js, round-test.js, finish-minus-test.js, four-branch-lock-kernel-test.js, and block-score-fixtures.js (22 assertions).

## Finding and limitations

The initializer and round-driver connect consistently for the tested paths. The full smoke found no tile-conservation, pass-counter, queue-advance, or turn-limit failures. **No reliable strategic finding; no strategy was promoted.**

Physical branch lock/open semantics, blocked-round winner/tie allocation, and loneZero=10 remain unresolved. The local test harness used exact fetched engine-module blobs, but it was not a clean git clone; the runtime's repository checkout remains constrained by GitHub DNS.

## Separate cohort scale

Prior game cohorts remain separate and unchanged: 88,886 deal allocations, 1,074 selected multi-action positions, and 5,863 state-world assignments; no global deduplication across cohorts. This run adds a distinct 500-round invariant-smoke cohort and two non-random fixture scenarios.

## Exact next action

Add a reachable-state 24-branch-label permutation check for legal-action sets and mapped successor states (not same-seed action identity in automorphic states). Then expand the invariant smoke to a separately reported 5,000-seed cohort. Keep strategy comparisons gated on explicit branch/block assumptions or authenticated table rules.
