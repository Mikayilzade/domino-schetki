# Qoşa research status

Updated: 2026-10-28 15:48:37 +04:00 (Asia/Baku)

## Verified cumulative
- **1,380,975** complete model-rounds across incompatible branch assumptions; historical 4,000 separate.
- **1,898,856** forced hidden-world continuations; **14,082** next-pass labels; **4,900** known-world diagnostics (unchanged).
- **490,000** deterministic opening deals (unchanged); **638,200** separate synthetic hidden-world allocations (626,200 previous + 12,000 new).
- New exact enumeration: **1,820** possible focal hands × **924** hidden opponent partitions each = **1,681,680** conditional hand-world combinations, NOT added to sampled allocation totals.
- Engine `qosa-research-0.5.3 + standalone midgame-end-collapse-1.0`; recovered `qosa-1.0.0` 3×9.
- Late-arrival branch legality, blocked winner/ties, loneZero/bust and 101 scoring remain **UNVALIDATED**.
- Fresh world seeds **2697200..2709199**; next unused **>=2709200**.

## Latest checkpoint — midgame branch-end collapse
- Same 2-3 tile, same pip cost, legal on either of two fully open branches under both provisional models.
- Exact immediate next-opponent pass **37.50%** collapsing ends versus **2.62%** preserving 2 and 3; this is NOT a game win-rate effect.
- Own no-playable-hand frequency **1001/1820** vs **210/1820**: large tactical downside to collapsing.
- 12,000 seeded worlds calibration z=-1.41; 3 exact brute checks and conservation passed.
- Code: `simulator/midgame-end-collapse-exact.js`; data: `runs/2026-10-28-1548-midgame-end-collapse-2697200-2709199.json`; report: `runs/2026-10-28-1548-midgame-end-collapse.md`.

## NEXT ACTION
- Compare two-opponent continuation and focal-return mobility on matched midgame hidden worlds; authenticate late-arrival branch unlocking and block ties before win-rate claims.
