# Qoşa research: independent pass-vs-win holdout — 2026-10-13T13:51:21 +04:00 (Asia/Baku)

Engine `qosa-research-0.5.3`, rules `qosa-1.0.0`, mode 3×9. Reproduce exactly:
`node qosha-research/simulator/pass-vs-win-split-runner.js 2700000 2950000 80`.

Scanned 19,725 deal seeds from 2700000 upward, selected 80 positions, evaluated 786 exact hidden allocations and 9,555 paired candidate continuations. 57 informative positions; 23 excluded due to fewer than 4 worlds or equal pass forecasts. Same worlds/seed/policies for paired choices, deterministic disjoint train/test split. Continuation policies: closed-branch-control, min-hand-pips, fast-doubles. No unresolved candidate continuations.

**Winner-trained minus higher-next-pass choice, held-out first-place probability (equal position weights):**
- closed-branch-control: +3.409 percentage points (exploratory 95% CI -0.099..+6.917 pp); 9 decisions changed.
- min-hand-pips: +3.409 pp (CI -0.099..+6.917 pp); 8 decisions changed.
- fast-doubles: 0.000 pp; 1 decision changed.
Mean remainder difference: -0.260 pips (closed-branch, CI -0.617..+0.097), -0.336 (min-pips, CI -0.655..-0.017), +0.075 (fast-doubles, CI -0.072..+0.221).
Minus-finish frequency difference: +2.707 pp for closed-branch/min-pips (CI -0.560..+5.974 pp), 0 fast-doubles.

**New finding:** winner-trained decisions diverged from pass heuristic more often than in the prior 80-position holdout, but the overall first-place 95% exploratory interval **includes zero**. No statistically reliable general gameplay advantage claimed. Changed-only advantages are selected-subgroup diagnostics, not deployable expected gains.

Changed seeds (any policy; closed-branch held-out win delta where changed): 2702078 (+0.600), 2702755 (+0.400), 2706354 (0), 2708593 (0), 2712734 (-0.182), 2713945 (only fast-doubles, 0), 2714208 (+0.600), 2715495 (+0.125), 2717342 (0), 2718246 (+0.400). Seed 2708593 changed only under closed-branch.

Validation: existing V8 CommonJS runner self-test passed (2080132, 2080432, 2080458; 35 exact worlds); first two new rows reproduced identically. Node CLI not executed. No gameplay rules changed. Confidence provisional: exact *uniform* hidden allocations do not condition on earlier observed opponent actions; deterministic bots, first-eligible-position selection, assumed branch-opening rules, block winner unassigned, exploratory uncorrected position-normal CIs.

Cumulative validated full strategy rounds **180,000 unchanged**; historical 4,000 separate. This checkpoint adds 80 choice positions, 786 exact hidden allocations, 9,555 continuations separately, not complete strategy rounds.

**Exact next action:** implement fail-closed observed-pass-conditioned hidden-world posterior requiring pass-time branch/open snapshot and verified unchanged opponent hand, then evaluate independent >=8-world genuine decision disagreements. Scope: only `qosha-research/`; live scoreboard/PWA untouched.
