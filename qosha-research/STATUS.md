# Qoşa research status

Updated: 2026-10-01 20:00 (+04)

## Current engine state
- version target: `qosa-research-0.5.0`
- primary mode: 3 players × 9 stones + 1 stock
- new strategy deals: 0
- historical baseline: kept separate in `RESULTS.md`

## Newly confirmed by user
- every 3-player round starts from `1-1`;
- owner of `1-1` plays it, draws the single stock tile, then plays again on 1;
- play then continues clockwise;
- first-round stock `1-1` causes redeal;
- later-round stock `1-1` is taken/played by the previous-round winner, who then plays again on 1;
- non-finishing multi-double play is voluntary: any legal prefix may be chosen;
- if the remaining hand can finish with multiple doubles, all finishing doubles are played in that turn;
- mixed finish is valid: ordinary tile + all remaining playable doubles in one turn, with minus determined by the number of finishing doubles.

## Green validation layers
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
1. What happens if the starter has no second tile containing 1 after the opening draw / after taking stock `1-1`? The initializer returns `unresolved/no-followup-on-1`.
2. Formal locked/open branch semantics still need stronger real-position fixtures.
3. Historical RNG remains incompatible with new numeric seeds.
4. 5-player bazaar/pass semantics and `loneZero=10` remain secondary.

## NEXT ACTION
Quantify the `no-followup-on-1` rate, resolve that edge rule, then run complete initialized-round smoke batches and measure unresolved-rate before strategy comparisons.
