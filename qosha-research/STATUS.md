# Qoşa research status

Updated: 2026-10-28 19:50 +04:00 (Asia/Baku)

## Verified cumulative (do not pool incompatible models)
- **1,380,975** complete model-rounds across incompatible branch assumptions; historical 4,000 separate (unchanged).
- **1,898,856** forced hidden-world continuations; **14,082** next-pass labels; **4,900** known-world diagnostics (unchanged).
- **490,000** deterministic opening deals (unchanged).
- **726,200** separate synthetic hidden-world allocations (714,200 previous + 12,000 new). The 924 exact partitions in this checkpoint are not extra samples; earlier exhaustive 1,820 × 924 partitions are separate.
- Engine `qosa-research-0.5.3 + midgame-double-two-cycle-1.0`, recovered `qosa-1.0.0` 3×9. Both branch models **PROVISIONAL**.
- New seeds **2785200..2797199**; next unused >= **2797200**.

## Latest checkpoint — double-chain future self-pass risk
- Reproducible script: [`simulator/midgame-double-two-cycle.js`](simulator/midgame-double-two-cycle.js). Detailed exact/seeded results: [`runs/2026-10-28-1950-midgame-double-two-cycle.md`](runs/2026-10-28-1950-midgame-double-two-cycle.md).
- Two opponent cycles after optional 0-0 / 6-6 double choices; exact 924 hidden partitions and two fresh 6,000-world cohorts. Both branch models × 3 opponent policies × 2 focal continuation policies.
- Under **provisional all-current-only**, opponent high/focal low: immediate 0-0→6-6 chain yields **892/924 = 96.54%** focal forced no-play on second return versus **0%** if holding 6-6 by playing 0-0 alone, despite better short-horizon stone tempo. Under global-ever-open, both return-pass rates are 0% in this policy configuration. This is NOT a proven real-game tactic.
- Seed 2785200 explicitly reproduces a second-return lockout; optional double stop retains a playable 6-6. Node 22 test and full run executed. No full-game scoring or winner inference.

## NEXT ACTION
Authenticate physical late-arrival branch unlocking and optional double-chain trace; confirm block tie rules before scoring full games. No scoreboard/PWA or GitHub Actions touched.
