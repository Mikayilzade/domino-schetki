# Qoşa research status

Updated: 2026-10-09 15:47 (+04)

## Current engine state
- version target: `qosa-research-0.6.1`
- primary mode: 3 players × 9 stones + 1 stock
- new strategy rounds: 180,000 matched-seat rounds persisted across validated baselines/stress/instrumentation runs (historical 4,000 kept separate)
- historical baseline: kept separate in `RESULTS.md`
- fixed-visible hidden worlds: **79,410** across research checkpoints (latest +2,400 on 2026-10-09 09:45)

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

## LATEST PATTERN FINDING (independent replication, still provisional)
- Fresh 96-position holdout: +6.31/+6.75/+8.13 pp mobility-aligned finish-first under three side-neutral policies; exploratory unadjusted position-level CIs exclude zero.
- Counterexample seed 179656 (opponents 3/1 stones) reverses advantage by 80 pp under two policies; not a universal rule.
- Data: `runs/2026-10-09-0945-different-end-choice-replication.json`; runner: `simulator/different-end-choice-replication.js`.

## NEXT ACTION
Preregister independent opponent-one-stone hand-size/branch-end-matched experiment to isolate immediate opponent finish risk; execute Node CLI regression when available. Quarantined specific-double data remain excluded.

## 2026-10-09 15:47 (+04) block remainder checkpoint
- 32 new positions, 1,600 fixed-visible hidden worlds, 4,800 paired candidate continuations; 0 new full strategy rounds.
- Focal strictly-lowest pips at block tracked as a descriptive proxy only, NOT an official win. No reliable finish-first improvement.
- Cumulative: 180,000 full strategy rounds, 79,410 hidden worlds; 400 pilot worlds excluded.
- Reproducible data and exact seed set: `runs/2026-10-09-1547-block-remainder-holdout.json`; notes and limitations in matching `.md`.
- Next: official block outcome rule, independent replication and Node CLI regression.

## 2026-10-09 17:00:33 +04:00 independent block-remainder replication
- 32 positions, 1600 fixed-visible worlds, 4800 continuations; 0 new full rounds.
- Cumulative: 180,000 full rounds; 81010 reproducible hidden worlds (400 pilot separate).
- Finding: next-opponent immediate finish risk change -11.13pp [-17.67pp, -4.58pp]; block strictly-lowest proxy is NOT an official win.
- Runner `simulator/block-remainder-replication.js`; data `runs/2026-10-09-1654-block-remainder-replication.json`; notes matching `.md`.
- Next: independent block proxy replication; clarify block winner rule before official win-rate claims.
