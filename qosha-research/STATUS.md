# Qoşa açdı research — current status

Last checkpoint: 2026-11-02 06:47:09+04 Asia/Baku.

- Added `moderate-double-hold`: finish first, maximize pips shed, then conserve doubles on equal-pip choices; seeded symmetric action-orbit/member tie-break.
- Fresh reserved seeds 3457601–3464100; scanned through 3462717. 5,117 unique allocations, 0 duplicates; 700 selected late positions.
- Joint support: 111 multi-action states; 610 state-world assignments; 1,592 allocations checked; 0 within-state duplicates.
- Four matched profiles: 1,586 candidate-world pairs / 3,172 model rollouts each; 6,344 pairs / 12,688 rollouts total.
- Moderate-vs-closed model-gap shift: −0.23 ± 0.44 pp (descriptive 95% state-cluster CI); no detectable profile effect. This is not a physical-rule result or tactic.
- Base regression and fixed-cohort profile regression (36 assertions) passed in V8. Live scoreboard/PWA files untouched; no strategy promoted.
- Exact next: independent seed window, target 150 joint-support multi-action states, compare moderate-profile regret/model gap, seek authentic branch-opening/block evidence.

Report: runs/2026-11-02-0647-pass-history-moderate-double-hold-audit.md
Data: runs/2026-11-02-0647-pass-history-moderate-double-hold-audit.json
Runner/test: simulator/pass-history-joint-support-choice-audit.js and simulator/pass-history-joint-support-profile-audit-test.js
