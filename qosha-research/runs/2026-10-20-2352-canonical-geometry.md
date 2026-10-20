# Canonical four-branch symmetry holdout

Timestamp: **2026-10-20 23:52 Asia/Baku (+04)**. Engine `qosa-research-0.5.3`; rules `qosa-1.0.0`; 3 players x 9 stones.

## Reproducible experiment
Code: `runs/2026-10-20-2352-canonical-geometry.js`; run `test`, then `1307840 240` and `1308080 240`. Deterministic V8 CommonJS execution performed; Node CLI not run. Seed sets: discovery 1307840..1308079, holdout 1308080..1308319. 480 independent deals/first eligible positions, 3840 complete forced-action continuations, 0 unresolved.

At each selected position, force the same ordinary stone on two different branches whose **post-action canonical state is identical** (sorted focal hand, sorted multiset of active branch ends, sorted opened numbers). Compare two deterministic continuation strategies: `min-hand-pips` and `closed-branch-control`. Legacy continuation breaks ties by branch label; canonical continuation breaks ties by canonical successor signature, leaving primary strategy scoring unchanged. Both actions use the same actual deal, not sampled hidden worlds.

| Metric | Discovery (240) | Holdout (240) |
|---|---:|---:|
| Raw actions / unique canonical successors | 1744 / 618 | 1632 / 603 |
| Duplicate action fraction | 64.56% | 63.05% |
| Legacy min-pips outcome mismatches | 44 | 52 |
| Canonical min-pips outcome mismatches | 0 | 0 |
| Legacy branch-control outcome mismatches | 24 | 14 |
| Canonical branch-control outcome mismatches | 0 | 0 |
| Legacy min-pips finish-first mismatches | 11 | 15 |
| Legacy branch-control finish-first mismatches | 11 | 9 |
| Canonical finish-first mismatches (both policies) | 0 | 0 |
| Legacy min-pips remainder mismatches | 30 | 36 |
| Legacy branch-control remainder mismatches | 19 | 14 |
| Canonical remainder mismatches (both policies) | 0 | 0 |

**Finding:** Branch-label tie-breaking introduces artificial outcome differences between side-permutation-equivalent moves in this model. Canonical successor-state tie-breaking eliminated all mismatches across the two independent cohorts. This is a correctness finding, not proof of improved human win chance.

**Confidence/limits:** High for tested deterministic model symmetry, conditional on provisional four-branch rules. First eligible position per deal, two fixed bots, no hidden-world posterior, no block winner, no physical-direction validation. The 3840 new continuations are diagnostic, not new independent full-deal tournament rounds. Previously reported complete-round total remains 264900; historical 4000 separate.

**Exact next hypothesis/action:** Use canonical continuation in matched hidden-world alpha20/28/36 pass-history evaluations on identical position/world seeds; determine whether the earlier pass-related win/regret differences survive removal of side-label artifacts. Keep legacy and canonical cohorts separate.
