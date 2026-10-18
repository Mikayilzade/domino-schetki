# Qoşa açdı — independent late open-number holdout (2026-10-18 19:51 Asia/Baku)

- Engine `qosa-research-0.5.3`; recovered rules `qosa-1.0.0`; primary 3×9, later-round.
- Discovery: deterministic deal seeds 1200000..1232341 (32,342 scanned), 24 first-eligible late positions (focal 4–5 stones, next player ≤3). Uniform hidden-world seeds: `(Math.imul(dealSeed,1009)+Math.imul(seat+1,1000003)+worldIndex+21000000)>>>0`.
- 40 hidden worlds/position = 960 hidden allocations, 3,840 paired forced continuations, 0 new complete strategy rounds. Previously reported full-round cumulative: 215,520 (unchanged; historical separate).
- Compared connector X-Y preserving X-X and second connector vs unrelated same-pip single also preserving X-X. Both leave equal count of accessible ends; exact end numbers differ.
- Continuation bots: `closed-branch-control`, `moderate-double-hold`.
- V8 CommonJS execution passed deterministic fixture (seed 1099589); exact hypergeometric regression `P(can play)=1-C(U-L,k)/C(U,k)` passed (U unknown tiles, L immediately playable unknown tiles, k next-player hand size).
- **All 24:** connector-minus-control finish-first −1.35 / −0.31 percentage points by policy; no reliable universal advantage.
- **8 positions where connector lowers next opponent's exact immediate playable chance by >5 pp:** average mobility delta −37.78 pp; finish-first delta +20.94 / +22.19 pp; mean remaining pips delta −2.83 / −2.82.
- **6 positions where connector increases next opponent's playable chance by >5 pp:** average mobility delta +30.36 pp; finish-first delta −9.17 / +2.92 pp.
- **10 equal-mobility positions:** finish-first delta −14.50 / −20.25 pp.
- Across positions, correlation (mobility delta vs finish-first delta) −0.534 / −0.421. Exact-vs-40-world empirical mobility delta mean absolute difference 2.70 pp.
- Important: subgroup analysis is exploratory; 8/6/10 positions are too few for a universal tactical rule. Number-specific strata are even smaller. Fixed bots, branch-opening assumptions provisional, block winner unassigned, uniform hidden worlds ignore opponent action history. Exact next-player play probability is exact only under this sampling model, not an exact human-game posterior.
- Source for reproduction: existing `simulator/late-equal-accessible-reply.js` run with `1200000 65000 24 40`; derive unknown pool from known/played tiles, count single-tile legal unknowns after each forced action, and apply hypergeometric formula. Runner additions were tested in V8 but GitHub batch write was blocked; this note preserves the verified summary without claiming runner source is committed.
- **Next hypothesis:** preregister the immediate next-player mobility sign as predictor; test on independent seeds and compare against hand-connectivity predictors, holding pips and accessible-end count constant.
