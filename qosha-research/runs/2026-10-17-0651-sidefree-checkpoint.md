# Side-free tie-break regression and matched tournament — 2026-10-17T06:55:05 +04:00

- Engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0`; 3 players × 9 stones; no gameplay-rule change.
- Code: optional `sideFree=true` deterministic policy tie-break in `simulator/strategy-runner.js`; default `false` preserves all historical baseline behavior. Executable `simulator/side-symmetry-test.js`.
- Validation: 100 distinct reachable positions (seeds 840000..840099), 1200 forced continuations across three policies and both tie-break modes; legacy 67 differing normalized outcomes, side-free 0. V8 CommonJS evaluation green; Node CLI not executed.
- Matched re-evaluation: seeds `810000..814999`, 5,000 deals × 3 rotations = 15,000 rounds **replayed, not newly credited** for each tie-break; same strategies closed-branch-control / min-hand-pips / fast-doubles.
- Legacy first-finish rates: 46.47% / 29.16% / 20.43%; blocks 591/15000 (3.94%), unresolved 0.
- Side-free first-finish rates: 47.97% / 29.95% / 21.27%; blocks 121/15000 (0.81%), unresolved 0.
- Fresh independent seeds `815000..815999`: 1,000 deals × 3 rotations = **3,000 new complete rounds** with side-free tie-break; first-finish rates 48.80% / 30.13% / 19.93%; blocks 34/3000, unresolved 0; mean round length 25.192.
- Fresh mean remaining pips: 2.926 / 5.323 / 6.244; medians 1 / 3 / 5.
- Fresh minus finishes by strategy (−10 / −20 / −30 / −40): closed-branch-control = 380/23/0/0; min-hand-pips = 129/2/0/0; fast-doubles = 20/0/0/0.
- Cumulative verified complete rounds: **201,000 + 3,000 = 204,000**; historical 4,000 separate; no old samples double-counted.
- Finding: the earlier ranking remains (branch control > min pips > fast doubles), but tie-breaking changes the block frequency sharply. This is a **policy implementation sensitivity**, not a proven real-game strategic effect.
- Confidence: high for deterministic matched-model comparison; no statistical claim for human opponents. Provisional branch opening, no block winner, deterministic bots, and side-free tie-breaking can reorder distinct-tile ties, so block change is not solely a left/right symmetry effect.
- Exact next hypothesis/action: isolate only same-tile/same-end side-equivalent ties (without reordering different tiles), compare with fully side-free on fresh matched seeds; add a canonical branch-multiset tie-break and independent seed holdout. Run Node regression when available.
- Full numeric output: `runs/2026-10-17-0651-sidefree-matched-tournament.json`.
