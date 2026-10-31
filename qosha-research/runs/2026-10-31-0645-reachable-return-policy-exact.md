# 2026-10-31 06:45 +04 (Asia/Baku) — reachable third-turn return mobility, seat2 response policies

- **Engine/rules:** independent `reachable-return-policy-exact/v1` combinatorial kernel, recovered `qosa-1.0.0` 3×9; global-ever-open branch behavior remains **PROVISIONAL**. No scoreboard/PWA changes.
- **Workload:** six chronological starter hands from the preceding sensitivity audit; exhaustive `C(17,8)=24,310` hidden allocations each = **145,860 overlapping exact conditional assignments** (not independent random worlds). **0 new seeded deals, 0 new random hidden allocations, 0 full model rounds, 0 forced full-game continuations.** Seeds: none (exhaustive enumeration). Candidate A=`1-3 left`, B=`1-4 left`, same world for each. Known seat1 `3-3`.
- **Chronology:** seat0 originally has `1-1` plus eight focal stones, draws sole stock `1-2`, plays it `up`; both opponents must pass; seat0 chooses A/B. Seat1 opens `3-3` after A; after B it opens `4-4` if owned, otherwise passes and seat2 necessarily owns/opens `4-4`. Seat2 then plays at most one ordinary tile (or forced double), or passes. Seat0's *next* legal distinct-stone count is measured, including eligible double openings, not a completed-round outcome.
- **Seat2 response policies:** `high` = maximum pip-sum ordinary response, `low` = minimum pip-sum ordinary response (tie by canonical tile key); `worst`/`best` = minimize/maximize focal return legal distinct-stone count across all seat2 replies. In this particular construction `high=worst` and `low=best` for all six hands; this is an observed fixture property, **not a universal game rule**.

| Focal hand variant | Mean legal stones A (high) | B (high) | B−A (high) | B−A (low) |
|---|---:|---:|---:|---:|
| baseline | 5.0294 | 5.0000 | −0.0294 | −0.0294 |
| zero-and-bridge | 5.0824 | 5.0068 | −0.0756 | −0.2941 |
| three-four-bridge | 5.1647 | 5.5385 | +0.3738 | +0.3738 |
| four-rich | 5.0000 | 6.1176 | **+1.1176** | **+1.1176** |
| three-rich | 5.1647 | 5.0000 | −0.1647 | −0.1647 |
| zero-pair | 5.0204 | 5.0068 | −0.0136 | −0.2647 |

- **Paired exact counts (high policy):** `four-rich`: B better in **13,585/24,310** worlds, worse in **0**, tied in **10,725**; `three-rich`: B better in **0**, worse in **2,002**, tied in **22,308**. Baseline: B worse in 715, tied in 23,595. The first opponent's pass after B remains 12,870/24,310 in all six cohorts. This demonstrates that our own 3-X versus 4-X ownership can reverse **return mobility**, even when the immediate first-opponent block probability is fixed.
- **Validation:** standalone JS exact enumerator executed locally on **Node 22.16.0** across all 145,860 assignments and four seat2 policies, with 28-tile fixture check, hand capacities, exact combinatorial cardinality, paired-category conservation and fixed seat1 pass count. An **independent Python combinations oracle** reproduced exact high-policy stone sums and paired sign counts for baseline (`122265/121550`, `0/715/23595`), four-rich (`121550/148720`, `13585/0/10725`) and zero-and-bridge (`123552/121715`, `156/1993/22161`). This is an independent minimal rules model, **not** a clean-checkout execution of the GitHub dispatcher.
- **Limitations/confidence:** high for exact conditional finite counts under the explicitly modeled reachable-opening geometry. Six deliberately chosen hands, uniform hidden assignments conditional on known `3-3`, no human response likelihood, no physical late-arrival branch authentication, no blocked-tie/101 validation. No new winning strategy, full-game win rate, remainder distribution, minus frequencies or full-game decision regret can be claimed. Cohorts overlap; do not add 145,860 to seeded-world cumulative.
- **Cumulative unchanged, separate populations:** 1,380,975 incompatible-model complete rounds; 1,898,856 forced continuations; 630,000 opening deals; 1,183,120 seeded hidden allocations; historical 4,000 rounds separate. Next unused seed >=3392072.
- **Reproduce:** `node qosha-research/simulator/reachable-return-policy-exact.js`.
- **Exact next action:** cross-check all six return-mobility rows against the actual committed `engine.js`/`turn-dispatcher.js` in a clean Node checkout, especially `0-0` double-opening after a `3-0`/`4-0` reply; then compare same-world first-place/remainder/minus under explicitly labeled continuation policies only after physical branch/tie rule validation.
