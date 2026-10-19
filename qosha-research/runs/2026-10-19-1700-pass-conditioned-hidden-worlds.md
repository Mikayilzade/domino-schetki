# Pass-conditioned hidden-world checkpoint — 2026-10-19 17:00 Asia/Baku

Engine `qosa-research-0.5.3`, rules `qosa-1.0.0`, 3×9 later-round. Deterministic discovery seeds 2027350..2027393: 44 scanned deals, 24 first changed-action positions. Each position sampled 20 hidden allocations satisfying all publicly observed pass exclusions, with focal hand and publicly played stones fixed. 480 sampled worlds (365 distinct allocations within positions), 5,200 candidate continuations, 0 unresolved. No new complete strategy tournament rounds.

Compared the history-selected move against the uniform-pass-selected move in the same hidden worlds, with fixed `closed-branch-control` and `min-hand-pips` continuations. Position-clustered exploratory normal 95% intervals:

| Continuation | First-finish delta (history - uniform) | Remainder delta | Minus-finish delta |
| --- | ---: | ---: | ---: |
| Closed-branch | -3.96 pp [-9.58,+1.67] | -0.14 [-1.45,+1.17] pips | ~0.00 pp [-1.67,+1.67] |
| Min-hand-pips | +3.13 pp [-3.83,+10.08] | -0.16 [-1.10,+0.78] pips | +1.04 pp [-0.62,+2.71] |

Only 4 of 24 positions had the next opponent at 1–2 stones, so no endgame claim. No statistically reliable advantage. **New finding:** the direction of the finish-first effect changes with the continuation policy, even after conditioning hidden allocations on passes. Earlier apparent benefits should not be promoted to human rules.

Limits: 20 random worlds per selected position with duplicates, pass-only posterior ignores likelihood of voluntary moves, first-disagreement selection, assumed branch opening semantics, deterministic bots, block winner unassigned, no 101 score, no multiplicity correction. Historical baseline kept separate. Previously claimed 273,600 tournament rounds are not independently audited here.

Reproduce by scanning 2027350..2027393, selecting the first focal seat (0..2) whose public-history-pass action differs from public-next-pass, then sampling the unknown pool uniformly subject to forbidden tiles derived from `recordPass` (shuffle seed `(dealSeed*4099+worldIndex+0x63a5)>>>0`), and evaluating all legal candidates with `evaluateDecisionInWorld` for each policy. The original 2026-10-19 15:49 changed-action oracle checkpoint was local only, not committed.

**Next:** persist the runnable conditioned sampler and repeat on disjoint seeds with at least 100 positions/50 worlds, stratifying by evidence strength and late-game hand counts. Do not merge old oracle continuations into full-round totals.
