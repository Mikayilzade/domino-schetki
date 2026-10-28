# Qoşa research status

Updated: 2026-10-28 21:53 +04:00 (Asia/Baku)

## Verified cumulative (do not pool incompatible models)
- **1,380,975** complete model-rounds across incompatible branch assumptions; historical 4,000 separate (unchanged).
- **1,898,856** forced hidden-world continuations; **14,082** next-pass labels; **4,900** known-world diagnostics (unchanged).
- **490,000** deterministic opening deals (unchanged).
- **736400** separate synthetic hidden-world allocations (734,200 previous + 2200 new). Exact 924 partitions per focal hand are not new random samples.
- Engine `qosa-research-0.5.3 + double-hand-perturbation-1.0`; recovered `qosa-1.0.0` 3×9. Both branch models **PROVISIONAL**.
- New seeds **2805200..2807399**; next unused >= **2807400**.

## Latest checkpoint — connector sensitivity across hands
- [Script](simulator/double-hand-perturbation.js), [checkpoint](runs/2026-10-28-2153-double-hand-perturbation.md), [raw](runs/2026-10-28-2153-double-hand-perturbation.json).
- 11 focal-hand variants (baseline + 10 one-tile substitutions), each exactly 924 opponent partitions, six action+continuation plans × six provisional branch/opponent scenarios.
- Previously universally safe single0/low remains 924/924 in **9/11** variants; single6/high in **9/11** variants. Fixed-hand safety must not be generalized to arbitrary hands.
- 0 new full rounds, no win-rate or scoring claim. Pure V8 JS test and run executed; Node CLI not executed.

## NEXT ACTION
Authenticate physical late-arrival branch unlocking and optional double-chain timing, then repeat on real chronological states with pass-conditioned posterior. No scoreboard/PWA or GitHub Actions touched.
