# Same-side mobility ablation — 2026-10-22T18:00:37.932+04:00

Engine qosa-research-0.5.3 / recovered qosa-1.0.0; primary 3×9. Independent seeds **1357140..1358139**, 1000 deals, **24000 complete continuations**, zero unresolved. Four policies on identical deals and three seats versus two opponent profiles: baseline min-pips; same-side retained-pair mobility; unrestricted retained-pair mobility; generic same-side mobility with no retained-pair requirement.

| Contrast (finish-first pp) | Min-pips opponents | Branch-control opponents |
|---|---:|---:|
| Same-side pair vs baseline | +2.20 | +1.50 |
| Unrestricted pair vs baseline | +2.90 | +1.97 |
| Unrestricted vs same-side | +0.70 | +0.47 |
| Generic same-side vs baseline | +2.57 | +2.27 |
| Same-side pair vs generic mobility | -0.37 | -0.77 |

**Finding:** same-side mobility still improves finish-first in this model; **retaining a double+connector has no established incremental benefit over generic mobility**. Cross-side addition is small and its exploratory seed-cluster 3SE spans zero. Different override rates confound policy ablations; same side does not fix endpoint number. Next-own-turn legal moves, playable tiles and pass rate are now measured, including censoring if a round ends before return; post-override subgroup is selected, not causal. Exact 3SE, remainder, medians, round length, block, minus and starting/ending-double metrics are in JSON (starting doubles are unchanged across matched policies by construction).

Validation: V8 deterministic replay, same-side restriction and compatibility with prior broad runner green. Node CLI not run. Limits: exploratory 3SE without multiplicity correction, fixed bots, provisional branch semantics, no block winner; no human-play causal claim. Historical/quarantined samples excluded. Cumulative **447300 full** plus **440060 separate counterfactual continuations**.

Reproduce: `node qosha-research/simulator/mobility-side-ablation.js test`; `node qosha-research/simulator/mobility-side-ablation.js 1357140 1000`.

**Exact next:** independent seeds >=1358140; compare same-side/same-endpoint alternatives at matched decision points with equal override budgets and matched pip gaps; execute Node CLI regressions.
