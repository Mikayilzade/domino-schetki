# 1-1 opening initializer invariant audit — 2026-11-02T23:47:54+04:00 (Asia/Baku)

- **Engine/rules:** qosha-research-0.5.3; recovered qosa-1.0.0; primary 3 players × 9 stones + one stock tile.
- **Scope:** initializer and opening-state contract only. No full rounds, strategy comparison, or match scoring.
- **Seed set:** 7,000,000–7,019,999; 20,000 deterministic deal draws. Full seat-labelled allocations were canonicalized within this cohort: 20,000 unique, 0 duplicate pairs.
- **Source execution:** Node v22.16.0. The test ran against the exact GitHub engine.js blob SHA `82e5bd544a57683d5b4f7812b2d4abf80da894` and initializer.js blob SHA `2fad29e516454580ec9a06115354e9866f3096e6`. A clean git checkout remains unavailable because this runtime cannot resolve github.com; the modules were verified and run in an isolated local harness.

## Checks and metrics

- **1,105,683 assertions passed** over the deterministic seed cohort.
- 1-1 location: seats 0/1/2 = **6,421 / 6,265 / 6,634**; stock = **680**.
- On a first-round initialization, all **680** stock-1-1 deals returned the explicit redeal result. The other deals initialized; 1-1-in-stock on a later round required a previous-winner index and returned an explicit unresolved result when it was missing.
- Continuation initialization: **20,000/20,000 ready**; mandatory follow-up played **18,704**, opening pass **1,296**.
- For the first 2,000 seeds, the test exercised all four side labels for every available follow-up: **7,404 side-variant initializations**. The tile, hand index, destination pip, hand remainder, draw, starter, and opened-number state stayed fixed; only the selected branch changed.
- Every initialized state conserved all 28 unique tiles, kept the stock empty, advanced the turn clockwise, and left the opening number set at `{1}`. A follow-up changed only its chosen branch end; a forced opening pass left all four ends at 1.
- Under a uniform deal and previous-winner independent of the deal, the exact no-follow-up probability is `C(21,9)/C(27,9) = 6.2714%`: after fixing 1-1, the relevant 9-tile set must contain none of the six other tiles with pip 1. Observed **6.48%** (1,296/20,000), inside the deliberately broad 7-sigma smoke guard.

## Finding and limitations

The recovered initializer's hand-owned 1-1 draw, stock-owned 1-1 previous-winner opening, first-round redeal, follow-up/pass, branch transition, and tile-conservation paths are internally consistent over this finite deterministic cohort. The pass-rate comparison is a distribution smoke check, not a PRNG-uniformity proof. This is implementation validation only; it does **not** authenticate the physical rules, establish a tactical advantage, or validate the full round driver.

Known gameplay cohorts remain separately reported at 88,886 deal allocations, 1,074 selected multi-action positions, and 5,863 state-world assignments; no global deduplication. This 20,000-deal initializer cohort is separate and is not merged into those strategy cohorts.

## Exact next action

Connect initialized states to the round driver and validate the first return cycle for (a) a played mandatory follow-up and (b) a forced opening pass, checking pass reset/count, legal actions, 28-tile conservation, and finish/block gates. Keep strategy batches paused until branch/block semantics are authenticated.

- Reproducer: [opening-initializer-invariant-test.js](../simulator/opening-initializer-invariant-test.js)
- Machine record: [JSON](./2026-11-02-2347-opening-initializer-invariant-audit.json)
