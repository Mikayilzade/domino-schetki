# Qoşa research — 2026-10-21 14:57 Asia/Baku
Engine qosa-research-0.5.3; rules qosa-1.0.0; 3x9.
Replayed 120 deals, seeds 1303100..1303219 (6480 continuations), plus 200 new deals 1303220..1303419 (10800 continuations). Matched alpha12/20/28 plain/one/joint versus min-hand-pips and closed-branch-control. Zero unresolved; V8 regression passed.
Cumulative 282180 unique complete continuations (prior 264900 + 17280); historical and quarantined excluded.
New 200 deals: alpha28-plain versus alpha20-plain finish-first +2.17 pp against min-pips and +1.67 pp against branch-control, exploratory. Joint-vs-one at alpha28: +0.33 pp and -1.67 pp respectively.
Pass-history Brier plain/one/joint: min-pips 0.07533/0.06045/0.05027 (n=862); branch-control 0.09510/0.07167/0.05132 (n=1275). Better calibration does not consistently improve finish-first.
Fixed source calibration indexing: alpha grid previously read a12-plain instead of a20-plain; added matching-grid regression.
Assumptions: provisional branch rules, fixed bots, uniform conditional hidden worlds, no block winner, unadjusted comparisons. No general gameplay claim.
Reproduce: node qosha-research/simulator/joint-pass-memory-runner.js 1303220 200 12,20,28
Next: fixed-visible paired regret for joint-vs-one changed moves, stratify by pass history.
