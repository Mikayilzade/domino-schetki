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
4. exact historical RNG compatibility is absent: numeric seeds from `qosa-1.0.0` do not recreate the same deals in the new engine;
5. integrate a validated initializer with the round driver;
6. only then start matched-seed strategy batches.

## NEXT ACTION
Build a deterministic round initializer from the documented 3-player opening rule without guessing unresolved behavior. Use the preserved `fixtures/seed-1898414179.json` as a historical compatibility fixture, but do not assume the new RNG reproduces old numeric seeds. If initialization semantics remain ambiguous, add an explicit unresolved gate and quantify it rather than inventing a rule.
