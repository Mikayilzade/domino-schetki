# Qoşa research status

## Additional independent holdout — 2026-10-20 11:03:44 Asia/Baku (+04)
- Engine/rules `qosa-research-0.5.3` / `qosa-1.0.0`, 3×9; seed range **1325000..1329999** (disjoint from prior 5k).
- **5,000** new scanned deals; 18 eligible equal-pip connector positions; 64 matched worlds each (32 train, 32 test), **1,152 hidden allocations**, **5,504 forced continuations**, 0 unresolved. Policies: min-hand-pips and closed-branch-control. V8 execution passed, Node CLI not run.
- Held-out connector-preserving minus connector-breaking finish-first: **+10.76 pp** (95% exploratory position CI **-6.29..27.82 pp**) and **+12.50 pp** (CI **-4.28..29.28 pp**) respectively; mean focal remainder **-1.059 / -1.049** pips; minus-finish **+15.45 / +17.19 pp**.
- Geometry: 0/18 exact active-end multiset matches. Immediate next-opponent legal action count equal in **32.47%** of held-out hidden worlds; mean mobility shift keep-minus-break **+0.0139** actions. Only 3/18 positions had mean mobility shift <0.25; within those, finish-first difference was **-5.21 pp** for both policies, an extremely small descriptive subgroup.
- Reproduce `simulator/connector-equal-pip-preservation-holdout.js 1325000 5000 64 30`. Geometry: `engine.applySinglePlacement`, next-player mobility: `turn-dispatcher.applyTurn` then `turnOptions` on held-out worlds i=32..63, using the original runner's deterministic seed formula. A separate detailed run-data file write was blocked by connector safety checks; these aggregate metrics are persisted here.
- **Combined independent holdout** (both disjoint 5k ranges): **10,000 scanned**, **27 eligible positions**, **1,728 hidden allocations**, **8,448 forced continuations**. Position-weighted finish-first deltas: **+11.34 pp** min-pips, **+12.85 pp** branch-control. These are exploratory and not yet statistically reliable or causal.
- Cumulative verified complete-strategy rounds **266,700** unchanged; paired continuations **75,344 + 2,944 + 5,504 = 83,792**. Historical 4,000 separate.
- **Exact next action:** run a third independent 10k-deal seed block with the same matched equal-pip protocol; analyze branch-end geometry and opponent-mobility distributions, and try to persist an executable diagnostic runner. Do not infer causal connector value from post-action mobility conditioning.
- Limitations: small selected positions, intervals including zero on part 2, provisional branch-opening semantics, deterministic bots, first-finisher not full-match winner, block winner unassigned.


## Research checkpoint — 2026-10-20 10:54 Asia/Baku (+04)
- Engine/rules: `qosa-research-0.5.3` / `qosa-1.0.0`, primary 3×9; no gameplay-rule changes.
- Fresh independent deal seeds **1320000..1324999**: 5,000 scanned, 9 eligible late equal-pip positions, 64 matched hidden allocations each (32 train / 32 holdout), **576 allocations**, **2,944 forced continuations**, 0 unresolved. Two deterministic continuation policies: min-hand-pips and closed-branch-control. V8 CommonJS harness executed; Node CLI not run.
- Holdout keep-connector minus break-connector finish-first: **+12.50 pp** min-pips (exploratory 95% position CI -1.65..26.65 pp); **+13.54 pp** branch-control (CI 1.72..25.36 pp). Mean focal remainder -1.20/-1.32 pips. Only 9 positions: no generalization claim.
- **Geometry confounding remains**: 0/9 positions had equal post-action active-end multisets. The existing `simulator/geometry-identity-test.js` already encodes the structural impossibility of exact active-end matching for distinct legal non-double tiles. Across holdout hidden worlds, the next opponent's immediate legal-action count was equal under both actions only **42.36%** of the time; mean keep-minus-break next-player mobility **+0.253 actions**. Equal-mobility worlds do NOT fully match branch geometry.
- Verified cumulative: **266,700 complete strategy rounds** unchanged (historical 4,000 separate), paired forced continuations **75,344 + 2,944 = 78,288**; do not add these to complete rounds.
- Data: `runs/2026-10-20-1054-geometry-mobility-holdout.json`; reproduce via `simulator/connector-equal-pip-preservation-holdout.js` with `1320000 5000 64 30`; geometry `engine.applySinglePlacement`, mobility `turn-dispatcher.applyTurn` then `turnOptions` for next seat on the 32 holdout worlds, using the same seed formula.
- Confidence/limitations: provisional, exploratory CIs, first eligible state per seed, deterministic bots, uniform pass-conditioned hidden allocations, assumed branch-number opening, first finisher not match winner and no block winner. An attempted new standalone diagnostic runner was not persisted because GitHub write safety checks blocked it; run-data and this checkpoint were saved.
- **Exact next hypothesis/action:** run disjoint seeds **1325000..1329999** with 64 worlds and the same precommitted equal-pip criteria; pool position-level deltas only if engine and policies match; analyze mobility-matched worlds as descriptive sensitivity, not causal isolation. Add a minimal persistent geometry/mobility runner when connector writes permit. Do not create Actions or modify scoreboard/PWA files.


## Latest research checkpoint — 2026-10-20, 09:50 Asia/Baku (+04)
- Source branch: qosha-research-20261020-0750; validated full-strategy rounds: **266,700**, historical 4,000 separate.
- New equal-pip control: 28 independent late positions, 1792 matched hidden allocations, **8576** forced continuations; 0 unresolved. Prior paired continuations 66,768; cumulative **75344**.
- Equal discarded pip sums for connector-preserving vs connector-breaking ordinary singles; disjoint train/test worlds; V8 deterministic self-tests passed (Node CLI not run).
- min-pips first-finisher difference: 17.75 pp; branch-control: 21.21 pp; both exploratory, not human-game causal proof.
- Reproduce: simulator/connector-equal-pip-preservation-holdout.js; results: runs/2026-10-20-0946-equal-pip-connector-holdout.{md,json}.
- Next: disjoint seeds 1320000..1329999 and post-action branch-geometry matched controls. Provisional branch-opening semantics and block-winner limitation remain.

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
