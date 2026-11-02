# Exact pass-history joint-support moderate-double-hold audit — 2026-11-02 06:47:09 +04 (Asia/Baku)

## Reproducible cohort

- **Engine/rules:** `qosha-research-0.5.3`; recovered `qosa-1.0.0`, 3 players × 9 stones. Global-ever-open and current-only branch models remain provisional.
- **Seeds:** reserved `3457601–3464100`; scanned through `3462717`. Generated 5,117 unique deal allocations, 0 duplicates.
- **Discovery:** 700 selected late positions; 111 had non-empty joint pass-conditioned support and at least two common legal root actions. Current-only counterfactual outcomes: 161 finishes, 4,956 blocks, 0 unresolved; 24,206 no-stock pass observations. The high block count is model-specific, not a real-game estimate.
- **Exact support:** 610 joint state-world assignments across 111 states; 1,592 labeled allocations checked; 0 within-state duplicates. Counts are state-world assignments, not globally unique worlds.

## Matched continuation profiles

The same hidden allocations, common root actions, and continuation seeds were reused across all four profiles. Branch-orbit/member tie-break remains seeded and label-symmetric.

| Profile | Global first-finish | Current-only first-finish | Global − current-only (95% state-cluster CI) | Global mean remainder | Current-only mean remainder | Remainder delta (95% CI) |
|---|---:|---:|---:|---:|---:|---:|
| closed-branch-control | 31.34% | 3.72% | 26.40 ± 6.32 pp | 4.023 | 10.764 | −6.419 ± 0.788 |
| min-hand-pips | 31.21% | 3.72% | 26.17 ± 6.34 pp | 4.036 | 10.764 | −6.397 ± 0.790 |
| fast-doubles | 31.27% | 3.72% | 25.81 ± 6.33 pp | 3.995 | 10.764 | −6.407 ± 0.797 |
| moderate-double-hold | 31.21% | 3.72% | 26.17 ± 6.34 pp | 4.036 | 10.764 | −6.397 ± 0.790 |

- **Rollouts:** 1,586 candidate × hidden-world pairs per profile; 3,172 model rollouts per profile; 6,344 pairs / 12,688 rollouts total.
- **Decision regret:** global-model first-finish regret was 10.16 ± 3.07 pp (closed), 9.93 ± 3.06 pp (min-pips/moderate), and 9.57 ± 2.98 pp (fast-doubles). Current-only regret was 1.33 ± 1.49 pp for all profiles. These are selected-state descriptive intervals.

## Most useful finding and limitations

The new moderate-double-hold profile matched min-hand-pips in aggregate on this selected cohort. Versus closed-branch-control, its global/current-only model-gap shift was **−0.23 ± 0.44 pp** (95% descriptive state-cluster CI), so there is no detectable profile effect here. No tactic is promoted.

Definition: finish if possible; otherwise maximize pips shed; among equal-pip actions, minimize doubles spent; resolve remaining ties with seeded symmetric action-orbit/member selection. A fixed-cohort regression includes a synthetic tie fixture where this profile retains a single double while fast-doubles chooses a two-double sequence.

Exact calculations apply only to selected synthetic states. Pass consistency is used without opponent-choice likelihood; current-only is a counterfactual; physical branch-opening and block scoring remain unauthenticated. Base regression and 36 fixed-cohort profile assertions passed in the V8 harness; a clean local Node checkout remains unavailable because GitHub DNS fails in the container.

## Cumulative scale and next action

- Pass-history discovery cohorts: **8,233 unique allocations** across the prior 810 + 2,306 and this run's 5,117 allocations. The separate strategy tournament remains unchanged.
- Next: independent fresh seeds targeting at least 150 joint-support multi-action states; compare moderate-double-hold candidate regret/model gap against the same profiles and continue seeking authentic branch/block evidence.

Raw data: [JSON](2026-11-02-0647-pass-history-moderate-double-hold-audit.json). Runner/test: [profile-aware audit](../simulator/pass-history-joint-support-choice-audit.js), [profile regression](../simulator/pass-history-joint-support-profile-audit-test.js).
