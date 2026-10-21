# Independent pass-choice holdout — 2026-10-21 17:51 Asia/Baku

Engine `qosa-research-0.5.3`, rules `qosa-1.0.0`, primary 3×9. Executed existing `simulator/pass-choice-regret-runner.js` in V8 CommonJS; sampler regression passed, Node CLI not run.

Reproduce: `node qosha-research/simulator/pass-choice-regret-runner.js test`; `node qosha-research/simulator/pass-choice-regret-runner.js 1304090 450 18 128`.

Independent discovery seeds 1304090–1304539; 36 changed-choice positions (18 per bot), 128 matched hidden worlds each, 9,216 forced-choice continuations, 0 unresolved. Scanned 87 min-hand-pips deals and 50 closed-branch-control deals. Joint-minus-one alpha20 finish-first: −2.908 percentage points (min-hand-pips; 5 better / 8 worse / 5 tied) and −13.064 pp (closed-branch-control; 3 / 14 / 1). Mean remainder differences: +0.672 / −0.174 pips; minus-finish differences: −6.597 / −3.255 pp; block differences: −1.432 / +0.434 pp.

Observed no-stock pass exclusions for one/both opponents: min-hand-pips one n=15, −4.479 pp; both n=3, +4.948 pp. Closed-branch-control one n=14, −10.603 pp; both n=4, −21.680 pp. Subgroups too small for general rules.

The earlier negative changed-choice result replicates on independent seeds, particularly versus branch-control bots. This does NOT imply pass memory is generally harmful: positions were selected where two heuristics disagree. Assumptions: uniform allocations subject to known stones and pass exclusions, fixed bots, provisional branch rules, no block winner, no action-history posterior. The 290,100 previously verified full continuations remain unchanged; 9,216 new counterfactual continuations are tracked separately from 4,608 prior, total 13,824 in this subseries. Historical and quarantined samples excluded.

Next: validate pass-history strata with regression, expand independent both-opponent-pass cases, compare action-level regret under full-history posterior.