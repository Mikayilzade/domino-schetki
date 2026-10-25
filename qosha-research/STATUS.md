# Qoşa research status

Updated: 2026-10-26 03:51:08 +04 (Asia/Baku)

## Verified cumulative scale
- **1035135** complete full-round discovery/tournament/policy-swap continuations.
- **1314736** forced matched hidden-world continuations; historical 4,000 separate.
- Engine `qosa-research-0.5.3` / recovered `qosa-1.0.0`, primary 3×9; four-branch number-lock **PROVISIONAL**.
- Latest fresh seeds **1559140..1559739**, 600 deals; next fresh seed **>=1559740**.

## Latest checkpoint
- Added `simulator/six-gate-relaxation-audit.js` and `runs/2026-10-26-0348-six-gate-relaxation-1559140.json`.
- **27000** matched complete rounds, 26081 finishes, 919 blocks, 0 unresolved; 5 focal policies × 3 seat rotations × 3 opponent mixes, 300/300 discovery/holdout split.
- Decision audit on control trajectories: ready 1378, with non-6 alternative 1095; feasible strict/zero/mobility−1/both 39/92/44/108. These are decision points, not independent deals.
- Gate change counts by opponent mix and effect estimates, with deal-cluster 95% exploratory intervals, are in linked run JSON.
- Strict arm is cross-checked against prior persisted gate logic; V8 CommonJS deterministic replay and invariants passed; Node CLI not executed.
- No real-game tactic established; pass predictions ignore prior hidden-world choice likelihood, and branch opening rules remain provisional.

## NEXT ACTION
- Independently replicate any positive candidate if effect survives the holdout; otherwise deprioritize 6-6 gate tuning and seek authentic four-branch lock/open and block-winner fixtures. Use disjoint seeds **>=1559740**.
