# Qoşa research status

Updated: 2026-10-26 12:15:22 +04 (Asia/Baku)

## Verified cumulative scale
- **1075815** complete full rounds; historical 4,000 separate.
- **1408408** forced matched hidden-world continuations.
- **4,900** separate full-known-world diagnostics.
- Engine `qosa-research-0.5.3` / recovered `qosa-1.0.0`, 3×9; four-side number-lock **PROVISIONAL**.
- Fresh seeds **1561320..1561479**; next unused seed **>=1561480**.

## Latest checkpoint
- `simulator/pass-conditioned-mobility.js` v2, `runs/2026-10-26-1215-pass-history-strata-1561320.json`.
- 960 complete baseline rounds; 643 post-pass changed-choice positions; 10288 pass-conditioned and 10288 uniform hidden worlds; 41152 forced continuations.
- Mobility hybrid vs closed control conditional first-place -2.45 ±2.83 pp; tempo -2.62 ±3.05 pp. Both exploratory intervals include zero; no verified winning hybrid.
- Next-only / other-only / both active constraints: mobility 177/147/4; tempo 168/145/2. Both-history active exclusions are rare.
- Uniform worlds violate passes in 71.13–71.31% of worlds. Two-opponent forced-allocation and exhaustive strata regressions passed in V8 CommonJS; Node CLI not run.
- Real four-branch opening and blocked-round winner remain unresolved. Live scoreboard/PWA untouched.

## NEXT ACTION
- Enrich both-opponent active pass constraints; next-only vs other-only vs both within-position ablation on disjoint seeds >=1561480; authenticate branch and block fixtures.
