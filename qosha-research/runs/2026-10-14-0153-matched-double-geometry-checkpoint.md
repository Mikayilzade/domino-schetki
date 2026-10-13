# Geometry and immediate-pass audit — 2026-10-14 01:53 Asia/Baku

Engine `qosa-research-0.5.3`; rules `qosa-1.0.0`; primary 3×9. Executed deterministic CommonJS V8 self-test: PASS; Node CLI not executed.

Reproduce:
`node qosha-research/simulator/matched-double-geometry-audit.js test`
`node qosha-research/simulator/matched-double-geometry-audit.js 3145000 3215000 20 100`

Previous selected cohorts: 30+30 positions from prior matched-double experiment; independent fresh cohort: 20 positions, scanned 31264 deals in seed range 3145000..3214999. **80 positions, 8000 sampled hidden allocations**, 0 new full strategy rounds. Every comparison holds discarded pip sum, number of newly playable unseen tiles K, and remaining hand size equal. Same hidden worlds used for both actions. World seeds: `(970000000+Math.imul(dealSeed,997)+worldIndex)>>>0`.

**Important identification finding:** post-action opened-number state differs in 80/80 pairs and branch ends differ in 80/80. Equal K does NOT mean same playable unseen tiles: average set overlap 19.17% (fresh 15%). Only 0/80 pairs have identical playable-tile sets.

Mathematically, given unknown pool N, K playable tiles and next opponent hand size h, the marginal probability of immediate pass is `C(N-K,h)/C(N,h)` for **both** actions. Yet for identical sampled hidden worlds the pass/no-pass event flips in 2120/8000 (26.5%) worlds (fresh 26.8%). Direction balances in expectation under the uniform hidden prior; sample difference -0.4 pp.

**Interpretation:** the earlier +28–34 pp finish-first advantage in selected two-pass positions cannot be attributed causally to holding doubles. Playing an ordinary connector instead of opening a double also changes which tiles and numbers become playable, despite equal K and equal *marginal* pass chance. This audit does not rerun first-place outcomes, so there is no new win-rate claim.

Confidence: exact combinatorial equality of pass probabilities under stated prior; high for geometry and deterministic invariants; exploratory for sampled flip rates. Limitations: 3×9 only, first-eligible two-pass selection, uniform hidden allocations, assumed opening semantics, fixed prior min-pips discovery, 100 worlds/position, no continuation rollouts, no block-winner inference.

Verified cumulative complete strategy rounds: **180,000** (historical 4,000 separate); this run adds 8000 immediate-response hidden-world samples, **not** full rounds. Next: paired continuation stratified by immediate reply identity and branch geometry; earlier-game controls on fresh seeds.