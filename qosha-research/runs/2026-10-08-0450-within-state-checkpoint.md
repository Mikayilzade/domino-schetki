# Qoşa within-state paired control — 2026-10-08 04:50 (+04)

Engine `qosa-research-0.5.3`; recovered rules `qosa-1.0.0`; 3×9. New complete strategy rounds: 0; verified cumulative complete-round baseline: **180,000** (historical 4,000 separate).

Added reproducible `simulator/pattern-within-state-runner.js` and executable `pattern-within-state-test.js`; regression passed in V8 CommonJS harness (Node CLI not executed). 20 reachable positions, seeds 1000..1599 (selected: 1010, 1018, 1026, 1028, 1037, 1038, 1040, 1042, 1053, 1055, 1059, 1065, 1088, 1089, 1094, 1103, 1106, 1110, 1113, 1121), 40 fixed-visible hidden worlds per position, 800 distinct position-world allocations, 2400 policy-world evaluations, 15840 candidate continuations. Hidden seeds: `1300000 + 1000*dealSeed + worldIndex`.

**Matched design:** both target doubles (3+ X pattern vs exactly 2 Y control) occur in the **same** pre-move state, hence identical hand size, opponent counts, branch ends, passes and sampled hidden world; each double has the same number of active branch ends. Compare preserving X-X+connector versus spending X-X within each target, then difference of differences. Three continuation policies: closed-branch-control, min-hand-pips, fast-doubles.

- **closed-branch-control**: preserve-minus-spend finish-first pattern 28.63 pp, control 20.56 pp, extra pattern **8.06 pp** (position-level approximate 95% CI [-0.82, 16.94] pp); remainder extra -1.02 pips; minus-finish extra -0.83 pp.
- **min-hand-pips**: preserve-minus-spend finish-first pattern 31.05 pp, control 30.30 pp, extra pattern **0.75 pp** (position-level approximate 95% CI [-11.27, 12.77] pp); remainder extra -0.17 pips; minus-finish extra -1.62 pp.
- **fast-doubles**: preserve-minus-spend finish-first pattern 46.94 pp, control 50.34 pp, extra pattern **-3.40 pp** (position-level approximate 95% CI [-7.97, 1.17] pp); remainder extra 0.17 pips; minus-finish extra -0.38 pp.

**Finding/limits:** same-state matching removes the largest cross-position confounds, but the two target doubles have different pip values/connector structure, so this is still not a causal estimate of the third X tile. Discovery first-eligible selection, small position-level sample, branch-rule assumptions, equal-weight legal action-class averaging. No universal 3+ X rule unless effect survives fresh disjoint seeds, pip-value strata and more policies. Full per-position records, policy results and seed metadata in `2026-10-08-pattern-within-state-1000-1600.json`.

**Next exact action:** run disjoint seeds 1600..2500, >=30 positions × 40 worlds, replicate within-state difference-of-differences, then stratify by target pip ordering and connector count. Revisit strategy-specific reversal and publish a human-usable rule only if sign and uncertainty support it.
