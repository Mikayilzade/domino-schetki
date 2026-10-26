# Qoşa research status

Updated: 2026-10-26 07:55:34 +04 (Asia/Baku)

## Verified cumulative scale
- **1073295** complete full-round discovery/tournament/baseline continuations.
- **1314736** forced matched hidden-world continuations; historical 4,000 separate.
- **4900** new forced full-known-world diagnostic continuations (separate from hidden-world count).
- Engine `qosa-research-0.5.3` / recovered `qosa-1.0.0`, primary 3×9; four-branch number-lock **PROVISIONAL**.
- Fresh seeds **1560820..1561059**, 240 deals; next fresh seed **>=1561060**.

## Latest checkpoint
- New `simulator/first-divergence-diagnostic.js` and `runs/2026-10-26-0752-first-divergence-1560820.json`.
- 1440 complete baseline rounds, 2450 first-disagreement positions, 4900 forced known-world continuations.
- Hybrid immediate playable-identity proxy increases but much of it disappears by the next focal turn after opponents act. Selected first-disagreement finish-first deltas remain exploratory and model-specific; see `RESULTS.md` and linked JSON.
- Deterministic replay, synthetic four-branch and scoring contract tests passed in V8; Node CLI not executed. No scoreboard/PWA edits.
- Full-known-world diagnostic is NOT a hidden-world Monte Carlo or authenticated game rule.

## NEXT ACTION
- Fresh seeds >=1561060: fixed-visible hidden-world paired regret for first-divergence states, stratify double opening and mobility erosion; authenticate branch lock/open and block winner.
