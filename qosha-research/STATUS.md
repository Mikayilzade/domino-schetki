# Qoşa research status

Updated: 2026-10-28T14:48:34+04:00 (Asia/Baku)

## Verified cumulative
- **1,380,975** complete model-rounds across incompatible branch assumptions; historical 4,000 separate.
- **1,898,856** forced hidden-world continuations; **14,082** next-pass labels; **4,900** known-world diagnostics (unchanged).
- **490000** deterministic opening deals (430,000 previous + 60000 new), separate from model rounds.
- **626200** synthetic hidden-world allocations (607,000 previous + 19200 new), separate from rounds.
- Engine `qosa-research-0.5.3 + opening-both-doubles-owned-1.0`; recovered `qosa-1.0.0`.
- Late-arrival branch legality, blocked winner/ties, loneZero/bust and 101 scoring remain **UNVALIDATED**.
- New deal seeds **2618000..2677999**; world seeds **2678000..2697199**; next unused **>=2697200**.

## Latest checkpoint — both doubles owned
- 60000 deterministic deals, 5661 eligible, 600 paired positions × 32 matched hidden allocations.
- Both candidate connectors are legal and both doubles are owned. Exact first-pass probability ties: 3 independent 48,620-partition checks.
- High-chain lower-minus-higher opponent moves: **0.00000**, exploratory cluster CI **[0.00000, 0.00000]**; low-chain **0.00000**.
- First-pass difference is exactly zero. Lower/higher choices differ in pip value and geometry, so **not proof of a universal winning tactic**.
- Source: `simulator/opening-both-doubles-owned.js`; data `runs/2026-10-28-1448-both-doubles-owned-2618000-2697199.json`; summary `runs/2026-10-28-1448-both-doubles-owned.md`.

## NEXT ACTION
- Compare pip/geometry-matched legal choices in a rule-invariant window; authenticate late-arrival branch and block ties before full-game win-rate claims.
