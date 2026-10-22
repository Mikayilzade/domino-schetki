# 2026-10-22 05:50 (+04) — single high-double holdout

Engine/rules: qosa-research-0.5.3 / qosa-1.0.0, 3×9; provisional branch rules.
Independent seeds 1311240..1311839: 600 deals × 3 focal seats × 2 bot profiles × 5 focal strategies = **18,000 full continuations**, zero unresolved. Strategies: a20-joint baseline, and four policies deferring only optional single 3-3, 4-4, 5-5, or 6-6 after an observed opponent no-stock pass. Multi-double sequences excluded from targeted deferral. Identical initial deals, seats and opponents; divergent policy trajectories.

Finish-first delta versus baseline (percentage points, min-hand-pips / closed-branch-control):
- 3-3: +0.17 / +0.22 (34 / 33 deferrals).
- 4-4: +0.61 / -0.06 (53 / 53 deferrals).
- 5-5: +0.11 / -0.11 (33 / 41 deferrals).
- 6-6: +0.39 / -0.28 (27 / 27 deferrals).

Exploratory seed-cluster 95% CI: min-pips 4-4 +0.14..+1.08 pp, 6-6 +0.10..+0.68 pp; branch-control all four intervals include zero. Unadjusted multiple comparisons (8), few activations. Earlier 3-3/5-5 paired selected-position gains against branch-control did NOT translate to independently verified full-deal benefit. No universal double ranking established.

V8 CommonJS replay regression passed (5 seeds, 150 continuations); Node CLI not run. Raw JSON includes win rate, pips mean/median, block rate, turns, minus -10/-20/-30/-40, deferrals and CIs. No scoreboard changes.

Cumulative: **389,700** full continuations (371,700 + 18,000); **54,084** separate counterfactual continuations; historical/quarantined excluded.
Reproduce: node qosha-research/simulator/single-high-double-holdout.js test; node qosha-research/simulator/single-high-double-holdout.js 1311240 600.
Limitations: provisional branches, deterministic bots, no block winner, opening 1-1 preprocessed, no opponent-action likelihood, low treatment exposure.

Next: independent seeds 1311840 onward; >=25 positions per high double per bot profile, 128 matched pass-constrained hidden worlds each, predeclare 3-3 and 5-5 contrasts and adjust for multiple testing.