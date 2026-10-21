# Pass-choice fourth independent holdout — 2026-10-21 19:53 Asia/Baku

Engine qosa-research-0.5.3 / qosa-1.0.0, 3x9. V8 CommonJS execution, Node CLI not run. Fresh seeds 1304990..1305439: 36 selected changed-choice positions (18 per opponent bot), 256 matched conditional hidden-world samples per position, 18,432 forced-choice continuations, zero unresolved. Policies: alpha20-joint versus alpha20-one, continuation min-hand-pips or closed-branch-control.

Joint-minus-one finish-first: min-hand-pips +0.760 percentage points, exploratory 95% position CI [-13.475,+14.994], better/worse/tied positions 6/9/3; closed-branch-control +6.033 pp, CI [-2.931,+14.997], 6/4/8. Branch-control sign reverses the previous three disjoint cohorts (-14.583,-13.064,-13.585 pp). No robust general strategy benefit/harm established.

Exact prior outlier seed 1304562, seat 2, turn 22: focal hand 2-3 and 0-2, ends up=0 left=2 right=5 down=0; unknown 0-5,1-2,1-4,3-4. Pass constraints admit exactly one of six nominal 2+2 allocations: opponent 0 holds 0-5,1-2 and opponent 1 holds 1-4,3-4. The earlier 128 Monte Carlo draws repeated the same hidden allocation. Playing 0-2 on left blocks the game, focal 5 pips; playing 2-3 lets opponent 1 play 3-4 after opponent 0 plays 0-5, then focal finishes on 0-2. Exact simulator-specific counterexample, not a general human rule.

Hidden allocation support in prior 36-position cohort: min-pips min/median/max 1/210/11440 (3 singleton, 8 of 18 <=128); branch-control 2/210/11440 (0 singleton, 9 of 18 <=128). Small-support positions should be enumerated rather than treated as 128 distinct worlds.

Accounting: prior verified 290,100 full continuations unchanged. Separate pass-choice counterfactual continuations 23,040 prior +18,432 fresh =41,472. Historical and quarantined runs excluded. Limitations: selected positions, small per-profile n, exploratory CIs, fixed bots, provisional branch semantics, no block winner, hidden posterior ignores likelihood of past opponent moves.

Reproduce: node qosha-research/simulator/pass-choice-regret-runner.js test; node qosha-research/simulator/pass-choice-regret-runner.js 1304990 450 18 256. Next: exact enumeration for low-support positions, support-stratified regret, and full-deal matched-seed policy comparison.
