# Qoşa research status

Updated: 2026-10-26 18:26:27 +04 (Asia/Baku)

## Verified cumulative scale
- **1104375** complete full rounds; historical 4,000 separate.
- **1512216** forced matched hidden-world continuations.
- **4,900** separate full-known-world diagnostics.
- Engine qosa-research-0.5.3 / recovered qosa-1.0.0, 3×9; four-side number-lock **PROVISIONAL**.
- Fresh seeds **1566040..1566239**; next unused seed **>=1566240**.

## Latest checkpoint
- New simulator/pass-aware-altbots.js, alternative opponent continuation policies and up to 8 legal candidate actions; V8 deterministic replay/9 checks passed; Node CLI not run. Scoreboard/PWA untouched.
- 1200 new baseline rounds, 66 both-pass selected positions across 38 deal clusters, 17688 forced matched hidden-world continuations.
- Conditional−uniform-trained finish-first: **2.74 ± 3.47 pp**, discovery **4.17 ± 6.17 pp**, holdout **0.98 ± 1.49 pp**.
- Simulation-only, exploratory: provisional number-lock, candidate cap, selected states, simple bots, unvalidated match scoring.

## NEXT ACTION
- Seeds >=1566240; replicate against alternative bots and compare 4 vs 8 candidates on matched worlds. Validate real four-branch locking and blocked-round winner before human tactical recommendations.
