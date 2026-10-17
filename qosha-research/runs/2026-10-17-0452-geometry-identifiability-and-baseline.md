# Geometry identifiability and fresh matched-seat baseline — 2026-10-17 04:52 Asia/Baku

Engine: `qosa-research-0.5.3`; recovered rules: `qosa-1.0.0`; mode: 3 players × 9 stones. No gameplay changes.

## Fresh full-round comparison
- Deterministic seed range: **810000..814999**, 5,000 distinct deals × 3 seat rotations = **15,000 full strategy rounds**.
- Strategies: closed-branch-control / min-hand-pips / fast-doubles. Identical seeds and rotating seats.
- Finish-first: **46.4667% / 29.1600% / 20.4333%**.
- Mean remainder: **2.8197 / 5.1896 / 6.0809** pips; median **1 / 3 / 5**.
- Finishes: **14,409**; blocks: **591** (3.94%); unresolved: **0**; mean round length: **25.2401 turns**.
- Closed-branch-control minus finishes: −10 = 1,905, −20 = 91, −30 = 4, −40 = 0.
- Min-hand-pips minus finishes: −10 = 607, −20 = 10, −30 = 0, −40 = 0.
- Fast-doubles minus finishes: −10 = 82, −20 = 1, −30 = 0, −40 = 0.
- Run executed using GitHub-sourced modules in an isolated JavaScript V8 CommonJS loader; not Node CLI.
- Previously verified full-round count: **186,000**; new distinct rounds **15,000**; cumulative **201,000** (historical 4,000 separate). Hidden-world enumerations are not counted as full rounds.

## Exhaustive accessible-number identity test
Tested actual `engine.js` + `turn-dispatcher.js` ordinary non-double legal actions for **6,272** synthetic two-active-side boards (all 7×7 ordered end values × all 128 opened-number sets). The other two sides are unchanged by either compared move, so their accessible-number multisets cancel.
- **37,632** legal actions; **7,360** equal-pip action pairs.
- **2,688** equal-pip pairs with exactly the same post-move accessible-number multiset: all **2,688** were the **same tile played on a different side**.
- **0** equal-pip pairs with **different tiles** and the same accessible-number multiset.
- **3,008** equal-pip pairs preserved accessible-end count but changed accessible numbers.

**Finding:** Under the current single-placement kernel, the requested equal-pip *different-tile* same-accessible-number-multiset control is structurally unavailable. The earlier attempt to find it by scanning more deals is not a useful next step. This is a kernel-level identifiability result, not a human strategy rule.

## Confidence, limitations, exact next action
High confidence in the exhaustive two-active-side invariant under the current model; not a proof for double sequences, mixed finish, or alternative branch semantics. Fresh full-round ranking agrees with prior bot results, but opponent strategies and starter policy remain deterministic, block winner is unassigned, and −40 rarity is not evidence of impossibility.

Next: persist and execute the standalone invariant regression under `simulator/`; study **same-tile/different-side** choices as a branch-orientation control, and separately compare **same accessible-end count but different end-number identity** on independent hidden worlds. Do not attribute any effect to connector retention without a valid control.
