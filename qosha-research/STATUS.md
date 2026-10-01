# Qoşa research status

Updated: 2026-10-01 16:57 (+04)

## Current engine state
- version target: `qosa-research-0.4.0`
- primary mode: 3 players × 9 stones + 1 stock
- new strategy deals: 0
- historical baseline: kept separate in `RESULTS.md`

## Green validation layers
- deterministic double-six deck/deal invariants;
- pip counting, minus classification, score floor;
- basic four-branch geometry and ordinary placements;
- assumption-labelled global double opening and multi-double sequences;
- draw-one-then-play-or-pass kernel;
- full-pass block detection with empty stock;
- unified turn dispatcher separating ordinary non-doubles from double sequences;
- round driver from an already initialized board: ordinary finish, double finish/minus, block.

## Safety gate
Mass strategy simulations are still blocked. Potential mixed-finish positions are now detected and returned as `unresolved/mixed-finish` instead of being silently simulated under an invented rule.

## Remaining rule/engine gaps
1. exact mixed-finish transition;
2. exact round initialization/starter/opening-draw semantics;
3. re-check whether all legal multi-double sequences must be maximal or whether shorter voluntary prefixes are legal;
4. integrate a validated initializer with the round driver;
5. only then start matched-seed strategy batches.

## NEXT ACTION
Build a deterministic round initializer from the documented 3-player opening rule without guessing unresolved behavior. Add fixtures for known historical seed/position where possible. If initialization semantics remain ambiguous, add an explicit unresolved gate and quantify it rather than inventing a rule.
