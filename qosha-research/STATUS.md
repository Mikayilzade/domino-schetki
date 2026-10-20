# Qoşa research status

## Latest research checkpoint — 2026-10-20 04:49 Asia/Baku
- Source branch: qosha-research-20261020-0255; last verified cumulative matched-strategy rounds: **266,700**, historical 4,000 separate.
- New exploratory paired-regret experiment: 43 fresh deal seeds, 258 discovery trajectories, 80 selected decision states (40 per comparison), 20 conditional hidden allocations each and two continuation policies; **6,400 forced continuations**, all resolved. These are NOT added to the 266,700 matched-strategy total.
- Reproducibility: simulator/pass-conditioned-world.js, pass-conditioned-world-test.js, pass-disagreement-regret-runner.js; run-data summary: runs/2026-10-20-0449-paired-regret-summary.txt.
- Finding (provisional, selection-biased): at disagreement states alpha28-one beats alpha20-one by +12.1 to +13.1 pp first-finish across two continuations; joint-history posterior shows no reliable advantage.
- Next: independent holdout on new seeds with pre-registered state sampling, evaluate all legal actions, and improve opponent-choice likelihood modelling. Branch opening semantics remain assumption-labelled.
- The following status is the historical 2026-10-07 snapshot, not the current cumulative count.

Updated: 2026-10-07 10:56 (+04)

## Current engine state
- version target: `qosa-research-0.6.1`
- primary mode: 3 players × 9 stones + 1 stock
- new strategy rounds: 180,000 matched-seat rounds persisted across validated baselines/stress/instrumentation runs (historical 4,000 kept separate)
- historical baseline: kept separate in `RESULTS.md`

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
- source/tests are persisted, but the latest hidden-world/regret regressions have not been runtime-executed in this connector environment, so they are not yet labelled green;
- verified cumulative strategy scale remains **180,000**; quarantined pre-fix `30000..39999` remains excluded.

## NEXT ACTION
Execute `decision-regret-test.js` and `hidden-world-test.js`. If both are green, persist the first numerical 25-world paired-regret JSON; then reproduce corrected controlled specific-double seeds `30000..39999`.
