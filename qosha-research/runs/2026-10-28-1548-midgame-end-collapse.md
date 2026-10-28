# 2026-10-28 — exact midgame end-collapse paired audit

- Timestamp Asia/Baku: 2026-10-28 15:48:37 +04:00
- Engine/rules: qosa-research-0.5.3 + standalone midgame-end-collapse-1.0; recovered qosa-1.0.0 3×9, both branch models agree in this synthetic fixture.
- Complete new rounds/deals: **0**. Exact focal hands: **1,820**, exact hidden partitions **924 per hand** (1,681,680 conditional hand-world combinations). New deterministic sampled hidden allocations: **12,000**, seeds **2697200..2709199**; no forced full-game continuations.
- Same legal tile **2-3**, same pip discard, two different placements. Public trace: 1-1, 1-2, 2-2, 1-3, 1-4, 4-4, 3-4, 1-5, 5-5, 3-5, 3-3. Before: [2,3,3,3]; collapse: [3,3,3,3]; spread: [2,2,3,3]. Both models have all four branches unlocked at comparison.
- Exact next-opponent forced-pass rate averaged uniformly over possible focal hands: collapse **37.50%** vs spread **2.62%**, delta **+34.88 percentage points**. Improvement in **1819/1820** focal hands, one tie.
- Own immediately playable remaining stones: collapse **0.50** vs spread **1.50**; zero playable in **1001/1820** vs **210/1820**. With at least one own 3 connector (819 hands), pass rates **55.56%** vs **3.89%**.
- Seeded calibration: 4417/12000 vs 332/12000 passes; paired gain 34.04 pp, expected 34.61 pp, z=-1.41. Three independent exact 924-partition brute checks, 28-tile conservation and deterministic replay passed.
- **Finding:** consolidating branch ends can deny the next opponent moves, but also denies us future moves. This is an immediate-pass geometry effect, **not a demonstrated winning tactic**.
- Confidence: exact combinatorics for the stated synthetic, uniformly sampled hidden worlds. Limitations: no actual public-game verification, pass history, opponent policy or full-round winner, block ties and 101 scoring unresolved.
- Reproduce: `node qosha-research/simulator/midgame-end-collapse-exact.js 2697200 12000`. Raw: `runs/2026-10-28-1548-midgame-end-collapse-2697200-2709199.json`.
- **Next:** two-opponent matched continuations and focal return mobility on new midgame seeds; validate physical late-arrival unlocking and block ties before full-game rankings.
