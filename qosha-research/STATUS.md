# Qoşa research status

Updated: 2026-10-09 08:55 (+04)

## Current engine state
- version target: `qosa-research-0.6.1`
- primary mode: 3 players × 9 stones + 1 stock
- new strategy rounds: 180,000 matched-seat rounds persisted across validated baselines/stress/instrumentation runs (historical 4,000 kept separate)
- historical baseline: kept separate in `RESULTS.md`
- fixed-visible hidden worlds: **68,210** across research checkpoints (latest +2,400 on 2026-10-09)

## Newly confirmed by user
- every 3-player round starts from `1-1`;
- owner of `1-1` plays it, draws the single stock tile, then plays again on 1;
- play then continues clockwise;
- first-round stock `1-1` causes redeal;
- later-round stock `1-1` is taken/played by the previous-round winner, who then plays again on 1;
- if the starter cannot make that second move on 1 after the draw/opening, the starter passes and play continues clockwise; future turns use the normal pass rule until a legal move appears;
- non-finishing multi-double play is voluntary: any legal prefix may be chosen;
- if the remaining hand can finish with multiple doubles, all finishing doubles are played in that turn;
- mixed finish is valid: ordinary tile + all remaining playable doubles in one turn, with minus determined by the number of finishing doubles.

## Green validation layers
- sequential-seed deal generation now pre-mixes seed values before xorshift; 10,000-seed stock-distribution regression added;
- deterministic deck/deal invariants;
- four-branch geometry and ordinary placements;
- voluntary multi-double prefixes;
- forced all-doubles finish when the playable doubles are the entire remaining hand;
- draw-one-then-play-or-pass;
- block detection;
- mixed finish, including user example yielding −20;
- historical opening fixture: starter 2, draw `1-5`, follow-up `1-5`, then clockwise to player 0;
- first-round stock `1-1` => redeal; later-round stock `1-1` => previous winner starts.

## Remaining safety gates
1. The 10,000-seed complete-round smoke baseline is clean in both later-round and first-round modes (0 unresolved / 0 turn-limit).
2. Formal locked/open branch semantics are regression-tested and survived the 1,000-seed smoke run, but should be stressed over a larger seed range.
3. Historical RNG remains intentionally incompatible with new numeric seeds; preserved historical fixtures are the compatibility path.
4. 5-player bazaar/pass semantics and `loneZero=10` remain secondary.

## Recovered after write outage
- actual-starter correction and stock-`1-1` executable regressions are persisted;
- paired single-world decision-regret evaluator + mutation/aggregation regression are persisted;
- old `runs/2026-10-03-specific-double-controlled-30000-39999.json` is quarantined because it predates the actual-starter correction; its 30,000 rounds are not counted;
- fixed-visible hidden-world Monte Carlo protocol is documented in `runs/2026-10-06-recovery-checkpoint.md`.

## Fixed-visible Monte Carlo / regret status
- `hidden-world.js` is persisted with focal-player/hand fail-fast guards, exact hidden-pool accounting and sequential-seed pre-mix;
- `hidden-world-test.js` now requires **25/25 distinct actual hidden allocations** for seeds `700..724`, deterministic replay, 28-tile integrity, immutable visible state and identical focal candidate keys;
- paired decision-regret is persisted and keeps finish-first, remainder and minus-finish metrics separate;
- minus finish is a beneficial outcome: `minusFinishRegret` is measured against the **maximum** minus-finish rate;
- fixed-visible hidden-world and regret regressions passed in the V8 CommonJS harness on 2026-10-08; independent Node CLI execution remains pending;
- verified cumulative strategy scale remains **180,000**; quarantined pre-fix `30000..39999` remains excluded.

## LATEST PATTERN FINDING (provisional)
- On 96 same-state different-end positions, exposing the number with more remaining own connectors improved finish-first by 6.25–9.50 pp under three side-neutral policies (unadjusted position-level CIs); linked `runs/2026-10-09-0855-different-end-choice.md`.
- This is discovery-only, not a human-ready universal rule; first-eligible selection, assumed branch locking and simple bots limit generalization.

## NEXT ACTION
Replicate the different-end choice on disjoint seeds 178000..181999 and 186000..189999 (same 8-per-cell quota and 25 hidden worlds), record counterexamples by opponent urgency. Execute Node CLI regressions when an executable checkout is available. Keep quarantined old specific-double data excluded.
