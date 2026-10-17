# Equal-pass legal-reply overlap holdout — 2026-10-18 00:50 Asia/Baku

Engine `qosa-research-0.5.3`, recovered `qosa-1.0.0`, 3×9. Reproducible code: `simulator/equal-pass-reply-overlap.js`; nondegenerate fixture `simulator/equal-pass-reply-overlap-test.js`. Both ran in a deterministic V8 CommonJS harness; Node CLI was **not** executed. Fixture seed 961282: 3 legal unknown tiles after each candidate, 2 shared, 4 in union, Jaccard 0.5; two-world paired replay passed.

## Reproduction
- `node qosha-research/simulator/equal-pass-reply-overlap-test.js`
- `node qosha-research/simulator/equal-pass-reply-overlap.js 960000 980000 48 24`
- `node qosha-research/simulator/equal-pass-reply-overlap.js 980000 1020000 48 24`
- Discovery: `min-hand-pips`; continuation policies: `closed-branch-control`, `min-hand-pips`, `fast-doubles`. Equal-pip connector single vs unrelated single, same visible state and hidden worlds, **exactly equal marginal probability** that next clockwise opponent passes. Only nondegenerate equal-pass ties with different post-action four-end geometry included.
- World seeds: `(1900000000 + Math.imul(dealSeed,109) + worldIndex) >>> 0`. Uniform unconditioned hidden allocations.

## Two disjoint cohorts
| Metric | 960000..979999 | 980000..1019999 |
| --- | ---: | ---: |
| Deals scanned | 9,780 | 10,627 |
| Eligible positions | 48 | 48 |
| Compared exact-pass ties | 13 | 18 |
| Hidden worlds | 312 | 432 |
| Paired candidate continuations | 1,872 | 2,592 |
| Same legal unknown tile set | 6 | 2 |
| Different legal unknown tile set | 7 | 16 |
| Pass flip rate if legal sets identical | 0% | 0% |
| Pass flip rate if legal sets differ | 34.52% | 28.65% |
| Connector − unrelated final pips, **different sets**, closed-branch | +0.99 | +2.32 |
| Connector − unrelated finish-first, **different sets**, closed-branch | +3.57 pp | −10.42 pp |
| Connector − unrelated final pips, **different sets**, min-pips | +0.74 | +2.39 |

**Combined descriptive count:** 20,407 deals scanned; 96 eligible; **31 compared positions, 744 hidden allocations, 4,464 candidate continuations**, zero unresolved reported; 8/31 had identical immediate legal tile sets, 23/31 different. Among different-set positions the mean sampled pass-flip rate is approximately **30.4%** (position-weighted across both cohorts). Same-set positions cannot flip the immediate pass under a fixed opponent hand.

**Finding (limited):** Equal *marginal* next-pass probability can conceal a different set of stones that the opponent is able to play, causing different pass outcomes on the *same* hidden allocation. It does not make the two actions strategically equivalent. In both cohorts connector plays left more remainder pips when legal sets differed, but finish-first differences reversed sign, so **no general win heuristic is promoted**. Even identical immediate legal sets need not imply identical later continuation.

**Confidence and limits:** High for the exact legal-set overlap calculation under the current engine, deterministic replay and the same-set pass identity; exploratory for policy outcome gaps. Only 31 selected positions, first-eligible sampling, 24 sampled hidden allocations/position, fixed bots, provisional locked/open branch semantics, no block winner, uniform hidden allocation ignores opponent action history, and action tile identities / branch geometry / future replies remain confounded. No independent causal effect of geometry inferred. Historical 4,000 separate; **186,000 prior verified complete strategy rounds unchanged, 0 new full rounds**.

**Exact next hypothesis/action:** Implement a combinatorial *joint* next-pass disagreement probability using legal-tile set intersection and hypergeometric counts (rather than 24-world sampling); compare predicted disagreement to paired hidden worlds on fresh disjoint seeds 1020000..1060000. Then evaluate an explicit reply-set-aware strategy on matched full rounds, and run Node CLI regressions in a checkout.
