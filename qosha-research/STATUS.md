# Qoşa research status

Updated: 2026-10-25 09:50:50 +04

## Verified cumulative scale
- **718,014** full-round discovery/tournament continuations (**716,626** prior + **1,388** new).
- **1,045,056** forced hidden-world counterfactual continuations (**1,035,840** prior + **9,216** new). Historical 4,000 baseline remains separate.
- Engine `qosa-research-0.5.3` / recovered `qosa-1.0.0`; primary 3×9; authentic four-branch number-lock semantics **PROVISIONAL**.
- This checkpoint scanned **488 distinct deal seeds** (min-pips `1483740..1483944`; branch-control `1484540..1484822`) from two disjoint reserved windows `1483740..1484539` and `1484540..1485339`. Next fresh seed **>=1485340**.

## Latest checkpoint
- New `simulator/branch-late-hand-strata.js` with deterministic selector/replay test. **72 late positions**, deliberately balanced at **12 positions each** for next opponent hand sizes 1, 2, and 3–4, per profile. **4,608** matched pass-conditioned hidden-world allocations, **9,216** forced continuations; **1,388** full discovery trajectories.
- When the next opponent has **one tile**, artificially opening a number for their next turn raises their **immediate finish chance by +26.17 ±11.82 pp** (min-pips) or **+44.79 ±25.45 pp** (branch-control), exploratory 95% position-cluster intervals, n=12 positions per profile. This is a within-model mechanism, **NOT** a legal action comparison.
- With **two tiles**, corresponding effect is **+1.43 ±2.81 / +3.78 ±7.40 pp**; with 3–4 tiles, zero immediate finishes in these selected states. The one-tile stratum is enriched by design and must NOT be pooled naively.
- No statistically reliable effect on focal finish-first probability. Provisional number locking, synthetic previous winner, simplified bots, unvalidated 101-point match scoring and block-winner logic. No human-play recommendation from the artificial delayed arm.
- Exact reproducible data: `runs/2026-10-25-0948-branch-late-hand-strata-1483740.json`. V8 deterministic replay passed; Node CLI not run. No scoreboard/PWA changes.

## NEXT ACTION
- On disjoint seeds **>=1485340**, repeat the **one-stone** finish-threat contrast and compare *actually legal* candidate moves (not artificial delay), holding removed pips and opponent hidden worlds fixed where possible. Independently obtain a real-play fixture validating branch lock/open geometry.
