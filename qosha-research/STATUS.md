# Qoşa açdı research — current status

Last checkpoint: 2026-11-02 07:54:13+04 Asia/Baku.

- Recomputed a cross-cohort replication audit from the two latest committed pass-history JSON cohorts; no fresh deal simulation was run this checkpoint.
- Cohort A: reserved seeds 3455101–3457600, scanned through 3457406; 2,306 unique allocations, 50 joint-support multi-action states, 249 exact joint state-world assignments.
- Cohort B: reserved seeds 3457601–3464100, scanned through 3462717; 5,117 unique allocations, 111 joint-support multi-action states, 610 exact joint state-world assignments. Seed windows are disjoint.
- For closed-branch-control, min-hand-pips, and fast-doubles, the state-cluster global-ever-open minus current-only first-finish gap was positive in both cohorts; each descriptive interval stayed above zero. Cross-cohort shifts were +6.31 ± 11.51, +6.09 ± 11.52, and +6.33 ± 11.48 pp respectively, all including zero.
- Profile sensitivity was small in both cohorts (0.60 pp range in A; 0.586 pp across four profiles in B). Moderate-double-hold matched min-hand-pips on aggregate in cohort B.
- Cumulative separate pass-history cohorts: 8,233 unique allocations, 178 joint-support multi-action states, 911 state-world assignments (not globally unique worlds).
- This remains selected synthetic model-sensitivity evidence, not physical-rule authentication or a tactic. No strategy promoted. Fresh local checkout/runner execution was blocked by github.com DNS failure.
- Exact next: run fresh disjoint seeds starting 3464101; target ≥150 joint-support multi-action states, compare moderate-double-hold regret/model gap on common exact worlds, and seek authentic branch/block evidence.

Report: runs/2026-11-02-0754-pass-history-replication-audit.md
Data: runs/2026-11-02-0754-pass-history-replication-audit.json
Reproducer: simulator/pass-history-replication-audit.js
