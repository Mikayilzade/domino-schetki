# Qoşa research status

Updated: 2026-10-28 22:54 +04:00 (Asia/Baku)

## Verified cumulative (keep incompatible models separate)
- **1,380,975** complete model-rounds across incompatible branch assumptions; historical 4,000 separate.
- **1,898,856** forced hidden-world continuations; **14,082** next-pass labels; **4,900** known-world diagnostics (unchanged).
- **490,000** deterministic opening deals (unchanged).
- **738,448** separate synthetic hidden-world allocations (736,400 previous + 2,048 new). Exact C(12,6) partitions per focal hand are not independent new random worlds.
- Engine `qosa-research-0.5.3 + double-connectivity-strata-1.0`, recovered `qosa-1.0.0` 3×9. Both branch models **PROVISIONAL**.
- New seeds **2807400..2809447**; next unused >= **2809448**.

## Latest checkpoint — exact connector-stratified double retention
- [Script](simulator/double-connectivity-strata.js), [checkpoint](runs/2026-10-28-2254-double-connectivity-strata.md), [raw](runs/2026-10-28-2254-double-connectivity-strata.json).
- 32 hash-selected focal hands (8 each of 4 connector strata), each exactly 924 opponent allocations; **29,568** exact hand-world partitions evaluated under 6 provisional scenarios and 4 plans.
- Single 0-0 + low continuation was universally safe in **8/8** selected hands with a 0-connector and no 6-connector, but not universally safe in other strata. Keeping one double often improves two-cycle mobility; **no confirmed win-rate rule**.
- 0 new full rounds. Pure V8 JS executed; Node CLI not run.

## NEXT ACTION
Authenticate physical late-arrival branch unlocking and optional double-chain timing; then run matched, pass-conditioned chronological-state comparisons. No scoreboard/PWA or GitHub Actions touched.
