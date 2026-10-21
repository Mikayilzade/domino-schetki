# Pass-choice third independent holdout — 2026-10-21 18:46 Asia/Baku

- Engine: `qosa-research-0.5.3`; recovered rules: `qosa-1.0.0`; primary 3 players × 9 stones; no rule changes.
- Executed `simulator/pass-choice-regret-runner.js` in a V8 CommonJS harness. `test()` passed (deterministic constrained hidden-world sampler). Node CLI was **not** executed.
- Reproduce with Node: `node qosha-research/simulator/pass-choice-regret-runner.js test` then `node qosha-research/simulator/pass-choice-regret-runner.js 1304540 450 18 128`.
- Independent discovery seeds **1304540..1304989**, disjoint from previous 1303640..1304539. Scanned 64 min-hand-pips deals and 56 closed-branch-control deals. Found **36 changed-choice positions**, 18 per opponent policy; **128 matched hidden worlds per position = 4,608 hidden allocations**, **9,216 forced-choice continuations** (4,608 per profile); no unresolved continuations.
- Forced actions: `a20-joint` vs `a20-one`, with identical sampled hidden hands and identical deterministic continuation bots. Targeted changed-choice states only, not random all-game decisions.

| Opponent continuation | Joint − one finish-first | Mean remainder (pips) | Minus-finish rate | Block rate | Positions joint better / one better / tied |
| --- | ---: | ---: | ---: | ---: | --- |
| min-hand-pips | **+1.866 pp** | −0.320 | +2.517 pp | −8.898 pp | 6 / 9 / 3 |
| closed-branch-control | **−13.585 pp** | +1.141 | −7.378 pp | +2.387 pp | 5 / 10 / 3 |

**Crucial sensitivity:** the min-hand-pips +1.866 pp aggregate is driven by **seed 1304562, seat 2, turn 22**, with +100 pp joint-minus-one. Excluding just that one position gives **−3.906 pp** across the remaining 17 positions. Therefore do **not** report a robust benefit for joint conditioning.

Pass-history strata (joint−one finish-first):
- min-hand-pips: exactly one opponent history n=16, **−4.150 pp** (5/9/2); both histories n=2, **+50.000 pp** (1/0/1), wholly driven by seed 1304562.
- closed-branch-control: one history n=14, **−11.886 pp** (4/9/1); both histories n=4, **−19.531 pp** (1/1/2).
- No zero-history cases, as expected for this targeted disagreement experiment.

**Finding:** the negative result against branch-control bots replicated in a third disjoint seed set (previous −14.583 and −13.064 pp; now −13.585 pp). Against min-pips bots, results remain heterogeneous; the apparent reversal disappears on single-position leave-one-out. These are selected-position counterfactuals, **not** general strategy win-rate effects.

**Confidence / limitations:** moderate for a model-specific, repeatedly observed branch-control direction; low for both-history strata (n=2/4) and any real-game recommendation. Uniform hidden allocations conditional on observed no-stock passes, not on opponents' prior move likelihood; provisional branch-opening semantics; fixed bots; no block winner; finish-first differs from match victory. Positions and worlds are not independent full-game baseline rounds.

**Cumulative accounting:** previous verified **290,100 full continuations unchanged**; prior pass-choice counterfactuals 4,608 + 9,216; this pass +9,216 = **23,040 separate counterfactual continuations** across three seed sets. Historical 4,000 and quarantined runs excluded.

**Exact next hypothesis/action:** investigate seed 1304562 to identify why joint inference changes the forced move so strongly; add deterministic position-level replay/regression. Then evaluate a fresh 1304990..1305439 seed set with 256 worlds per position and position-cluster uncertainty intervals; expand both-opponent-pass cases without selecting only disagreement states.
