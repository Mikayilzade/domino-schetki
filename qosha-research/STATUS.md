# Qoşa açdı research — current status

Last checkpoint: 2026-11-02 08:54:04+04 Asia/Baku.

- Fresh disjoint pass-history Cohort C; engine/rules: qosha-research-0.5.3 / recovered qosa-1.0.0 / 3×9; branch models remain provisional.
- Reserved seeds 3464101–3473600; stopped at 3472080 after 7,980 unique allocations, 0 duplicates. Selected 1,000 late states; 172 had joint pass-consistent support and ≥2 common legal actions.
- Exact support: 2,315 allocations checked; 831 joint state-world assignments; 0 within-state duplicates. Four continuation profiles: 2,245 candidate-world pairs / 4,490 rollouts each; 8,980 pairs / 17,960 rollouts total; 0 unresolved.
- State-cluster global-ever-open minus current-only first-finish gap: +24.96±4.97 pp (closed/min/moderate) and +25.30±5.02 pp (fast-doubles). Mean remainder gap about −6.05 to −6.07 pips. Profile gap range 0.334 pp.
- Compared with prior disjoint Cohorts A/B, cross-cohort shifts include zero. The model gap direction replicated, but remains selected synthetic model sensitivity—not physical-rule evidence or a tactic. No strategy promoted.
- Regression: 36 profile-audit assertions and 10 current-only support assertions passed in V8. Live scoreboard/PWA untouched.
- Cumulative four separate cohorts: 16,213 unique allocations, 350 joint-support multi-action states, 1,742 state-world assignments. Strategy tournament unchanged.
- Exact next: fresh seeds from 3473601; target ≥250 joint-support multi-action states; stratify by opponent hand size/action count/pass evidence; test explicit opponent-choice likelihood; seek authentic branch/block ruling.

Report: runs/2026-11-02-0854-pass-history-joint-support-cohort-C.md
Data: runs/2026-11-02-0854-pass-history-joint-support-cohort-C.json
Reproducer: simulator/pass-history-joint-support-choice-audit.js
