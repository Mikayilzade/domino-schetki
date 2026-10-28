# Qoşa research status

Updated: 2026-10-28 20:48 +04:00 (Asia/Baku)

## Verified cumulative (do not pool incompatible models)
- **1,380,975** complete model-rounds across incompatible branch assumptions; historical 4,000 separate (unchanged).
- **1,898,856** forced hidden-world continuations; **14,082** next-pass labels; **4,900** known-world diagnostics (unchanged).
- **490,000** deterministic opening deals (unchanged).
- **734,200** separate synthetic hidden-world allocations (726,200 previous + 8,000 new). Exact 924-partition enumerations are not extra random samples.
- Engine `qosa-research-0.5.3 + midgame-double-continuation-robust-1.0`, recovered `qosa-1.0.0` 3×9. Both branch models **PROVISIONAL**.
- New seeds **2797200..2805199**; next unused >= **2805200**.

## Latest checkpoint — double action must be paired with continuation policy
- Script: [`simulator/midgame-double-continuation-robust.js`](simulator/midgame-double-continuation-robust.js); [detailed checkpoint](runs/2026-10-28-2048-double-continuation-robust.md).
- Exact 924 allocations plus two fresh 4,000-world cohorts. Six plans (3 initial double actions × 2 focal return policies), evaluated under 2 provisional branch models × 3 opponent policies.
- Exact all-scenario second-return safety: `single0/low` **924/924**, `single6/high` **924/924**, `chain06/high` **500/924**. Chain with focal-low is not robust. This is a fixed synthetic state, **not** a verified real-game winning rule.
- 0 new complete game rounds; no scores/win rates inferred. V8 CommonJS test and run executed; Node CLI not executed.

## NEXT ACTION
Authenticate real late-arrival branch unlocking and optional double-chain timing, then test across diverse chronological states with posterior conditioned on passes; confirm block ties before full-game scoring. No scoreboard/PWA or GitHub Actions touched.
