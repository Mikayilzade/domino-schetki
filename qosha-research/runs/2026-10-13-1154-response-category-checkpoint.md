# Independent exact response-category holdout — 2026-10-13 11:54 Asia/Baku

Recovered rules `qosa-1.0.0`, engine `qosa-research-0.5.3`, 3×9. **5,664 scanned deals** from `2400000..2499999`; 30 first-eligible positions, 265 exhaustive hidden allocations, 3,291 candidate continuations, 0 unresolved, 0 new full strategy rounds. Full seed list and machine-readable metrics in the linked JSON.

Matched equal-pip connector X-Y vs unrelated legal single, both retaining X-X. Uniform exhaustive unseen allocations within each fixed visible position, equal weight per position; continuation seed `57000000+1000*dealSeed+lexicographicAllocationIndex`.

Connector minus unrelated finish-first: **−18.78 pp** closed-branch-control (exploratory CI −30.88..−6.68), **−17.71 pp** min-hand-pips (−29.93..−5.50), **+4.61 pp** fast-doubles (+0.57..+8.65). Mean remaining pips: +0.865 / +0.774 / −0.734.

Next opponent's reply (closed-branch; 265 exact allocations): connector forces pass 67, unrelated forces pass 37, both pass 40, same action 71, different tile 40, same tile different side 10. **All 30 compared pairs change two branch ends.** Categories are post-action mediators, **not causal controls**; cannot claim a geometry-independent connector effect.

V8 CommonJS self-test, deterministic complete replay and category coverage passed; Node CLI not executed. Model-specific, exploratory uncorrected intervals, first-eligible selection, assumed branch semantics, bot-only continuation, uniform hidden worlds ignoring observed opponent history, unassigned block winner.

Verified cumulative **180,000 complete strategy rounds** unchanged (historical 4,000 separate); these 265 exact allocations tracked separately.

**Finding:** connector retention is not universally beneficial; bot policy matters. **Next:** independent pre-action pass-probability ranking vs direct win forecast, matched worlds and four-end geometry audit.

Reproduce: `node qosha-research/simulator/response-category-holdout.js 2400000 2500000 30`.
