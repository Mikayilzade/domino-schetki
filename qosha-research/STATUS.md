# Qoşa research status

Updated: 2026-10-28T13:47:15+04:00 (Asia/Baku)

## Verified cumulative
- **1,380,975** complete model-rounds across incompatible branch assumptions; historical 4,000 separate.
- **1,898,856** forced hidden-world continuations; **14,082** next-pass labels; **4,900** known-world diagnostics (unchanged).
- **430,000** deterministic opening deals (330,000 previous + 100,000 new), separate from model rounds.
- **607,000** synthetic hidden-world allocations (587,000 previous + 20,000 new), separate from rounds.
- Engine `qosa-research-0.5.3 + opening-first-pass-exact-regret-1.0`; recovered `qosa-1.0.0`.
- Late-arrival branch legality, blocked winner/ties, loneZero/bust and 101 scoring remain **UNVALIDATED**.
- New deal seeds **2498000..2597999**; world seeds **2598000..2617999**; next unused **>=2618000**.

## Latest checkpoint — exact first-opponent pass regret
- **100,000** new deterministic first-round deals; 96332 valid; 90285 starters have a 1-X follow-up; 65123 have multiple legal connectors.
- 19901 playable starters would increase first-opponent forced-pass chance by choosing a connector with their own X-X rather than the lowest-pip connector.
- Exact mean pass probability across playable starters: min-pip **3.8224%**, max-pass **5.1753%**, gain **1.3530 percentage points**. This is a **first-pass-only objective**, not win rate.
- **Exact structural identity:** given c connectors, opponent has 6-c unknown 1-X tiles; choosing X with X-X owned leaves no additional X-X in the unknown pool. If X-X is unowned, it adds one legal opponent double. All owned-double choices tie on first-pass chance for fixed c; all unowned choices tie separately.
- Independent exact 48,620-way partition checks: 3 positions. Monte Carlo: 500 strict-regret positions × 40 matched hidden worlds = 20,000 allocations, nested pass advantage and z=0.651 versus exact expectation.
- **Limitations:** selection for first-pass probability can pay more connector pips, and does not establish better game outcomes. No authenticated late-arrival rule or blocked winner/tie.
- Code: `simulator/opening-first-pass-exact-regret.js`; raw: `runs/2026-10-28-1347-first-pass-regret-2498000-2617999.json`.

## NEXT ACTION
- Compare legal 1-X vs 1-Y where **both X-X and Y-Y are owned**, so first-pass chance is exactly equal; measure subsequent two-turn tempo/mobility on matched worlds. Authenticate late-arrival branch and block ties before full-game strategy claims.
