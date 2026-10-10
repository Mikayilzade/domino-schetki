# Qoşa research status

Updated: 2026-10-09 23:48:43 +04:00

## Current engine state
- version target: `qosa-research-0.6.1`
- primary mode: 3 players × 9 stones + 1 stock
- new strategy rounds: 180,000 matched-seat rounds persisted across validated baselines/stress/instrumentation runs (historical 4,000 kept separate)
- historical baseline: kept separate in `RESULTS.md`
- fixed-visible hidden worlds: **92,906** across research checkpoints (latest +2,400 on 2026-10-09 09:45)

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

## 2026-10-09 17:56:46 +04:00 third block-conditional audit
- 32 positions; 1600 hidden worlds; 4800 continuations; 9 overrides; 0 full rounds.
- Cumulative **180000** full strategy rounds + **82610** hidden worlds (400 pilot separate).
- Added `simulator/block-conditional-holdout.js` and `runs/2026-10-09-1754-block-conditional-holdout.json`.
- Conditioned-on-block strictly-lowest remainder is a descriptive ratio, NOT official win and NOT matched causal effect.
- Next: paired both-block-only analysis, official block rule, Node CLI regression.

## 2026-10-09 19:48 (+04) — block-pip-choice holdout
- 24 selected independent positions; 1536 credited hidden worlds; 8640 continuations; 0 new full strategy rounds. Verified cumulative 180000 full rounds + 86546 selected hidden worlds (400 pilot separate). 1908 screening worlds excluded.
- Replayed in V8 from `simulator/block-pip-choice-replay.js` with JSON `runs/2026-10-09-1948-block-pip-choice-replay.json`; independent Node CLI pending.
- Both-block matched worlds across independent positions: 177/22 closed-control, 184/22 min-pips, 33/14 random-legal. Higher-pip move may improve conditional remainder but reduces unconditional finish-first. Not a universal rule.
- Official block winner unknown; strictly lowest remaining pips is a descriptive proxy only.
- Next: disjoint-seed replication with opponent-size and connector strata; clarify official block rule.


## 2026-10-09 21:48 (+04) — new hidden-world holdout
- Frozen 30 positions, 3000 new worlds, 18000 continuations; cumulative 180000 complete rounds + 91466 selected hidden worlds (400 pilot separate).
- Conditional urgent/highMore BOTH-block high-pip disadvantage +3.13 pips, 171/193 worse under closed-control; SAME six positions as prior, position-level CI crosses zero.
- Code: simulator/block-pip-mobility-world-holdout.js; data/notes: runs/2026-10-09-2148-block-pip-mobility-world-holdout.{json,md}.
- Next: disjoint-position same-side holdout, no official block winner claim.

## 2026-10-09 23:48:43 +04:00 — independent same-side connector replication
- 24 fresh reachable positions; 720 fixed-visible hidden worlds; 8820 continuations; 0 new full strategy rounds.
- Cumulative 180,000 full rounds + 92,906 hidden worlds; prior bothOpen high-connector advantage NOT replicated (all three new point estimates negative with CIs crossing zero).
- Data `runs/2026-10-09-2348-sameside-connector-replication.json`; notes matching `.md`; Node CLI pending.
- Next: seed-spaced/opponent-vector-matched replication with opponent <=2, side-neutral policies.


## 2026-10-10 01:55:03 +04:00 — disjoint double+connector replication
- Reconciled 2026-10-10 01:00 checkpoint: +843 previously persisted hidden worlds (prior cumulative 93,749).
- New: 72 positions, 1674 distinct worlds, 10044 forced continuations; 0 full strategy rounds; cumulative **180,000 full rounds + 95423 hidden worlds**.
- Deterministic full replay and existing runner self-test passed in V8 CommonJS; Node CLI still pending.
- Paired double-minus-connector finish-first differences negative under all 3 continuation policies in both urgency groups; exception urgent/focal-hand=5 under fast-doubles (+2.25 pp). Model-specific, not universal.
- Reproduce: `simulator/double-connector-urgency-holdout.js 466000 606000 12 40`, full data `runs/2026-10-10-0154-double-connector-disjoint-holdout.json`.
- Next: pre-stratified focal hand/opponent-vector fresh-seed study, urgent hand=5 counterexamples, immediate threat and minus risk.


## 2026-10-10 02:48:31 +04:00 — hand-size pre-stratified connector holdout
- 108 positions, 1968 new distinct hidden worlds, 11808 continuations; 0 new full rounds. Cumulative **180,000 full rounds + 97391 hidden worlds**.
- Engine unchanged `qosa-research-0.5.3`; exact replay and base self-test green in V8. Node CLI pending.
- Urgent hand=5 fast-doubles double-minus-connector: -3.12 pp [-5.61 pp, -0.63 pp] across 18 independent positions. Exploratory; vector-level matching not established.
- Runner `simulator/double-connector-hand-strata.js`; data `runs/2026-10-10-0246-double-connector-hand-strata.json`.
- Next: vector-matched urgent 5-tile counterexamples and immediate opponent finish/minus risk.


## 2026-10-10 03:55:53 +04:00 — clockwise opponent-vector audit
- 36 fresh positions, 540 exhaustive hidden worlds (15 each), 3240 forced continuations, 0 new full rounds. Cumulative **180000 full rounds + 97931 hidden worlds**.
- Fixed vector interpretation: previous opponentSizes arrays were player-index ordered, NOT clockwise. This experiment stratifies clockwise next/following opponents.
- Opening X-X exposed immediate opponent finish in 6/18 positions when next opponent had 2 stones, versus 0/18 when next opponent had 4; policy-dependent, provisional.
- V8 self-test and deterministic replay green; independent Node CLI pending. Code: simulator/urgent-five-clockwise-vector.js; data/notes: runs/2026-10-10-0354-urgent-five-clockwise-vector.{json,md}.
- Next: disjoint-seed next-player=2 threat study across focal hand 3/4/5.


## 2026-10-10 07:48:22 +04:00 — exact next-two minus risk (source-of-truth branch)
- Latest reproducible checkpoint: 54 fresh reachable positions (36 discovery + 18 independent holdout), 459 exhaustive next-two-hand allocations, 918 forced first actions; **not** full sampled hidden worlds.
- 18 extra mixed −10 opportunities after double opening vs connector across 459 allocations; 7/54 positions positive, none negative. Discovery 6/36 versus holdout 1/18: magnitude/prevalence did not replicate; no general human rule.
- Cumulative remains **180,000 matched complete strategy rounds + 98,490 credited fixed-visible hidden worlds** (historical 4,000 and quarantined 30,000 separate).
- Reproduce: `simulator/next-two-minus-exact.js`, frozen exact rows/seeds in `runs/2026-10-10-0745-exact-next-two-minus-holdout.json`.
- Next: fresh-seed matched full-game rollouts conditioned on exact immediate-minus risk; Node CLI regression remains pending.
