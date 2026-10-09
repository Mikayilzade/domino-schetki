# Side-label equivariance audit — 2026-10-09 07:47:14 +04:00

Engine/rules: qosa-research-0.5.3 / qosa-1.0.0, 3×9. **0 new complete rounds**. Discovery seeds 158000..165999 and 166000..173999, selected 40 reachable positions (10 per discovery-policy × opponent-hand-size group), 25 fixed-visible worlds each; world seed `8500000+1000*dealSeed+worldIndex`.

**Verified**: 1000 hidden worlds, 3000 policy/world evaluations and 6000 candidate continuations. All 3000 pairs had **exactly identical canonical states at every turn and identical outcomes**, using side-neutral closed-branch-control, min-hand-pips, random-legal. V8 CommonJS test 4 positions × 2 worlds also passed. No unresolved rounds; no source-state mutations.

**Finding**: In this engine, two different sides with the same starting end X are indistinguishable except for labels. Placing the same X–Y tile on either side produces isomorphic states. The previous side-sensitive random-legal result (+2.1 percentage points on 40 positions) is therefore a **policy tie-breaking artifact**, not a human-usable side preference. This conclusion is structural within the current geometry-free simulator, not an empirical claim about physical domino placement.

Cumulative persisted validated full rounds: **180,000** (historical 4,000 separate). Fixed-visible hidden worlds: **65810** (previous 64,810 + 1000). Minus and block counts per policy are in the linked JSON.

**Limitations**: branch locking/opening assumptions, no side history/geometry, selection bias, no assigned block winner. Exact next hypothesis/action: compare genuinely different branch-end values and branch-lock status; do not claim physical side advantage unless the real rules distinguish directions.

Reproduce: `node qosha-research/simulator/side-equivariance-audit.js 10 25`. Data: `runs/2026-10-09-0747-side-equivariance-audit.json`.
