# Exact first-opponent response — 2026-10-12 05:48–06:xx +04 (Asia/Baku)

- Engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0`, 3 players × 9; no gameplay-rule changes.
- Independent deal seeds: `1050000..1099999`; first eligible position under min-hand-pips; selected 30 positions from 6,273 scanned deals.
- Hidden worlds: **290 distinct exhaustive opponent allocations** (3–15 per position), **3,258 candidate continuations** under closed-branch-control, min-hand-pips and fast-doubles; 0 unresolved; 0 new full strategy rounds.
- Comparison: equal-pip connector X-Y vs unrelated single, both retaining X-X and another X connector. Same visible position and exhaustive opponent allocations, equal weight per position. Continuation seed `48000000 + 1000*dealSeed + lexicographicAllocationIndex`.
- Finish-first difference (connector minus unrelated): **−22.94 / −22.61 / +1.89 percentage points** (policies in order above). Exploratory position-level 95% intervals: [−37.31, −8.57], [−36.66, −8.56], [−0.45, +4.23] pp.
- First actual clockwise opponent reply differs in **62.22%** of exact hidden worlds, equal-weighted per position, under each of the three policies. The opponent's immediate finish difference is +1.67 pp, supported by only one position, and is not a robust explanation for the overall finish gap.
- Focal player's immediately playable distinct-tile count is equal after both actions in 12/30 positions. In this descriptive subgroup, closed-branch-control finish-first delta remains −25.42 pp. This is NOT a causal control: post-action geometry differs on two sides.
- Validation: deterministic V8 CommonJS replay self-test passed for seeds 1050119 and 1050284 (6+6 exact allocations); 28-tile integrity and no mutation of visible state checked. Node CLI not executed.
- New methodological finding: late-game hidden-allocation support can be only 3–15 distinct worlds, so repeated 20-seed Monte Carlo samples can contain duplicates. Exact enumeration avoids treating repeated allocations as independent evidence.
- Limitations: uniform hidden allocation is not a posterior conditioned on earlier opponent decisions; deterministic bot policies, first-eligible selection, assumption-labelled branch rules, block winner unassigned, exploratory confidence intervals. No geometry-independent human-play rule claimed.
- Verified cumulative full strategy rounds remain **180,000**; historical 4,000 separate. Do not add hidden-world continuations to round count.
- **Next:** persist an executable `simulator/exact-first-response-runner.js` (GitHub write was blocked this run), repeat on disjoint seeds, stratify actual reply side/number and forced passes; compare full four-end geometry without treating post-action mediators as causal controls.
