# Block diagnostic seat-permutation audit — 2026-11-02T21:47:47+04:00 (Asia/Baku)

- **Engine/rules:** qosha-research-0.5.3; recovered qosa-1.0.0. This is a coded-model property audit, not physical-rule authentication.
- **Deals/seeds/strategies:** 0 deals; no seed set; no strategy comparison. The finite audit enumerated all seat permutations for four fixed, tile-identity-unique block fixtures.
- **Validation:** standalone JavaScript property harness passed **1,524 assertions** across **252 seat permutations** (two 3-player fixtures × 6 permutations and two 5-player fixtures × 120 permutations). It checked seat-order equivariance of minimum-pip and fewest-tile candidate sets, per-seat remainder ordering, no inferred block winner/minus, and 3-/5-player empty-stock pass thresholds.
- **Important execution limitation:** GitHub DNS was unavailable for a clean repository checkout, so this harness did not execute the repository's Node modules. The committed Node regression is ready for a clean checkout but remains unrun here.
- **Finding:** block diagnostic candidate sets are permutation-invariant in the independent property harness; this is a structural consistency result, not a ruling about who wins a blocked round. No tactical finding; no strategy promoted.
- **Cumulative separate cohorts:** 88,886 deal allocations, 1,074 selected multi-action positions, 5,863 state-world assignments; unchanged and not globally deduplicated.
- **Limitations:** block winner/allocation and tie-break, physical branch lock/open, and `loneZero=10` remain unresolved. The fixed fixtures test identity transformations, not reachable-game frequency.
- **Exact next action:** run `node qosha-research/simulator/block-seat-permutation-test.js` plus existing block/branch regressions in a clean checkout; then keep block scoring as alternative labelled hypotheses until table evidence resolves it.
- **Report/data/reproducer:** [report](runs/2026-11-02-2147-block-seat-permutation-audit.md), [JSON](runs/2026-11-02-2147-block-seat-permutation-audit.json), [test](simulator/block-seat-permutation-test.js).
