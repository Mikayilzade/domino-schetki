# Independent pass-choice holdout — 2026-10-16 02:58:06 Asia/Baku

- **Engine / rules:** `qosa-research-0.5.3` / recovered `qosa-1.0.0`, primary 3 players × 9 stones; branch opening provisional. No gameplay changes.
- **Reproduce:** `node qosha-research/simulator/pass-choice-regret-runner.js test` then `node qosha-research/simulator/pass-choice-regret-runner.js 810000 860000 150`.
- **Execution:** V8 CommonJS harness, not Node CLI. Regression `test()` passed: fixture seed 773582, 21 hidden allocations, 6 posterior allocations. 50,000 fresh scanned deterministic deals, seed range **810000..859999**, 121 selected reachable positions (first eligible with pass and equal-pip choice), 1,023 exhaustive hidden allocations, 13,350 candidate continuations, 18 positions with posterior reduction. No unresolved continuations reported.
- **Policies:** `closed-branch-control`, `min-hand-pips`, `fast-doubles`; identical candidate moves/hidden worlds and deterministic continuation seeds `61000000+1000*dealSeed+lexicographicAllocationIndex`. Rank finish-first descending, remainder ascending, minus finish descending, action-key tie-break.
- **Cumulative validated complete strategy rounds:** **180,000** (unchanged; zero new complete strategy rounds this run). Historical 4,000 rounds remain separate. Hidden allocations and scanned deals are **not** counted as complete strategy rounds.

## Matched recommendation changes (old-pass filter versus full-pass history)

| Continuation policy | Changed / 121 | Strict reversals | Actual-world pips saved on changed positions (positive = better) | Actual-world first-place changes | Seeds |
| --- | ---: | ---: | ---: | ---: | --- |
| closed-branch-control | 2 | 2 | +11 net | 0 | 823384, 840196 |
| min-hand-pips | 2 | 2 | +11 net | 0 | 823384, 840196 |
| fast-doubles | 6 | 4 | +12 net | **−1** | 810397, 810609, 825345, 826880, 831256, 840196 |

**Strict-reversal examples, actual-world pips saved:**
- 823384 (turn 20; old/posterior worlds 21/6): closed-branch and min-pips **−2** each (worse).
- 840196 (turn 23; 4/1): all three policies **+13** each (better); this one position drives most net pip gains.
- 810609 (turn 23; 15/10): fast-doubles **−5** pips and **lost first place** after incorporating old passes.
- 825345 (turn 26; 10/3): fast-doubles **−2** pips.
- 831256 (turn 25; 4/1): fast-doubles **+6** pips.
- 810397 (turn 22; 6/1) and 826880 (turn 25; 3/1): fast-doubles recommendation changes were not strict reversals, actual-world outcome unchanged.
- Minus-finish change was zero for all policies.

**Finding:** older pass information occasionally changes a preferred move, but the independent holdout contains **both beneficial and harmful actual-world changes**. In particular, fast-doubles lost first place in one changed position. The positive aggregate pip sum is dominated by seed 840196; **no reliable general winning rule or demonstrated first-place gain**. Do not extrapolate to human play.

**Confidence / limitations:** exact uniform enumeration of unknown allocations for selected positions, but *not* the real posterior over opponent behavior; first-eligible/equal-pip selection bias, only 18 posterior reductions and 2–6 recommendation changes, deterministic continuation bots, provisional branch rules, no block-winner assignment, no independent Node CLI execution. Reported pips are retrospective outcomes in the actual simulated hidden world, not causal expected gains; policies overlap on the same positions and must not be pooled as independent evidence.

**Exact next hypothesis/action:** On independent seeds `860000..909999`, stratify changes by posterior support size (1 vs >=2 allocations) and by strict reversal vs tie break; test whether the apparent +13 outlier disappears with non-degenerate posterior support. Compare **first-place regret** before pip remainder, and extend position discovery beyond equal-pip alternatives while holding known hand/table fixed.
