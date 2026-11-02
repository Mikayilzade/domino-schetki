# Qoşa açdı research — current status

Last checkpoint: 2026-11-03T00:54:58+04:00 Asia/Baku.

- Integrated the 3×9 initializer with round-driver using two deterministic, complete tile-partition fixtures: mandatory 1-1 follow-up and forced opening pass.
- The opening-cycle test passed 69 assertions. It checks legal actions, return to starter after two opponents, pass increment/reset, 28-tile identity conservation, and finish/block gates.
- Full-round smoke: seeds 7,100,000–7,100,499; 500 seed draws, 500 unique full allocations, 0 duplicate allocation pairs. Node v22.16.0.
- The full smoke passed 95,619 assertions over 500 rounds. Outcomes under the deterministic random-legal smoke policy: 475 finish, 25 block, 0 unresolved; mean 23.758 turns, median 24, max 31. These are provisional model/policy descriptives, not strategy findings.
- Opening outcomes in this cohort: 472 mandatory follow-ups, 28 opening passes, 12 deals with 1-1 in stock. Finish-minus counts: 0=459, −10=16, −20/−30/−40=0.
- Existing isolated regressions passed: initializer, turn, dispatcher, round-driver, finish-minus, four-branch lock kernel, and block-remainder fixtures (22 assertions).
- Exact GitHub blob hashes were verified for engine.js 82e5bd544a57683d5b4f7812b2d4abf80da894, initializer.js 2fad29e516454580ec9a06115354e9866f3096e6, turn-kernel.js 94657896e1f8e471ceb2e9a65d1842b6102dff18, turn-dispatcher.js 55b0bcf3f1653c64b4e06bc95d7e917a480562a0, and round-driver.js fbaad78865adbddde1ea6651e6a501dc0bde3203.
- No reliable tactical finding; no strategy promoted. The smoke policy is not a benchmark.
- Prior separate game cohorts remain unchanged: 88,886 deal allocations, 1,074 selected multi-action positions, 5,863 state-world assignments; no global dedup. New cohort: 500 full-round invariant-smoke deals plus 2 constructed fixtures.
- Physical branch lock/open, block winner/tie, and loneZero=10 remain unresolved. A clean git clone was not used; the isolated Node harness executed exact fetched engine-module blobs.
- Exact next action: add a reachable-state 24-branch-label permutation check for legal-action sets and mapped successor states, then expand the invariant smoke to a separately reported 5,000-seed cohort before strategy comparisons.

Report: qosha-research/runs/2026-11-03-0054-opening-round-driver-cycle-audit.md
Data: qosha-research/runs/2026-11-03-0054-opening-round-driver-cycle-audit.json
Tests: qosha-research/simulator/opening-round-cycle-test.js and qosha-research/simulator/full-round-invariant-smoke.js
