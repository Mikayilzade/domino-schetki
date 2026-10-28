# Qoşa research status

Updated: 2026-10-28 16:56 +04:00 (Asia/Baku)

## Verified cumulative
- **1,380,975** complete model-rounds across incompatible branch assumptions; historical 4,000 separate.
- **1,898,856** forced hidden-world continuations; **14,082** next-pass labels; **4,900** known-world diagnostics (unchanged).
- **490,000** deterministic opening deals (unchanged); **678,200** separate synthetic hidden-world allocations (**638,200** previous + **40,000** new).
- Earlier exact **1,820** focal hands × **924** hidden partitions = **1,681,680** conditional combinations, NOT added to sampled allocation totals.
- Engine `qosa-research-0.5.3 + midgame-two-opponent-return-1.0`; recovered `qosa-1.0.0` 3×9.
- Late-arrival branch legality, blocked winner/ties, loneZero/bust and 101 scoring remain **UNVALIDATED**.
- Fresh world seeds **2709200..2749199** (two disjoint 20,000-world cohorts); next unused **>=2749200**.

## Latest checkpoint — midgame two-opponent return
- Same legal 2-3 tile on two sides, same 5 discarded pips, identical focal hand and two hidden opponents. Both provisional branch models and highest/lowest-pip one-stone opponent policies.
- Collapse vs spread: opponent stones over next two turns **−0.44 to −0.57**, replicated in both independent seed cohorts.
- Own no-playable-hand probability on return **+1.48 to +22.42 percentage points** depending on branch model/policy; **no increase** in the own-3-connector stratum, much greater risk without a 3 connector.
- Immediate pass calibration against previous exact enumeration passed; Node 22 deterministic test and full 40,000-world run executed.
- **No demonstrated win-rate advantage.** This is a synthetic, rule-sensitive two-turn mobility comparison, not a match outcome.
- Code: `simulator/midgame-two-opponent-return.js`; linked checkpoint: `runs/2026-10-28-1656-midgame-two-opponent-return.md`.

## NEXT ACTION
- Examine own-3-connector counterexamples and opponent access under matched multi-double-aware continuations. Authenticate late-arrival branch unlocking and blocked ties before full-game scoring/regret claims.
