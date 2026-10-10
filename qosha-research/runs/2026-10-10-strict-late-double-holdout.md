# Strict connector-vs-double paired holdout

Timestamp: 2026-10-10 09:52 Asia/Baku. Engine: qosa-research-0.5.3. Rules: qosa-1.0.0. Mode: 3 players x 9 stones. No scoreboard/PWA changes.

## Methodology audit
Existing simulator/pattern-paired-runner.js permits unrelated singles in its "preserve pair" class. Example seed 62020: hand 0-4,3-3,3-6,0-3; it compares opening 3-3 against unrelated 0-4. Therefore earlier loose results cannot establish the value of an X-Y connector specifically.

Strict experiment: from comparableChoices(hand, actions), compare one legal X-X double opening against legal single X-Y connectors ONLY when the connector action leaves X-X and another X-Y in hand. The strict preserve filter is usesConnector && keepsPair && action.type === 'single'. Double spend filter is action.type === 'double-sequence' && action.tiles.length === 1. All legal candidates are evaluated under identical hidden worlds and continuation policy.

## New deterministic batches
A (loose diagnostic): deal seeds 61000..61118; 119 deals scanned, 50 positions, 30 worlds each, 1500 unique worlds. Continuation closed-branch-control; world seed 9100000+1000*dealSeed+worldIndex. Preserve-minus-spend finish-first +22.64 percentage points, exploratory CI [16.62,28.66]; remainder -2.48 pips.

B (loose diagnostic): seeds 62000..62097; 98 deals scanned, 50 positions x 25 worlds = 1250 worlds, 12900 candidate continuations. World seed 12000000+1000*dealSeed+worldIndex. Finish-first delta +26.14 pp branch-control, +23.25 pp min-hand-pips, +13.76 pp fast-doubles.

C (STRICT primary): seeds 63000..63115; 116 deals scanned, 45 eligible positions x 25 worlds = 1125 unique hidden worlds, 13725 candidate continuations, zero unresolved. World seed 13000000+1000*dealSeed+worldIndex. Equal weight per position. Preserve-connector minus spend-double:
- closed-branch-control: finish-first +24.65 pp [16.71,32.59]; mean remainder -1.97 pips; minus-finish +13.13 pp. Signs: 33 positive, 6 negative, 6 tied.
- min-hand-pips: finish-first +23.51 pp [15.79,31.24]; remainder -1.58; minus-finish +7.07 pp. Signs 35/3/7.
- fast-doubles: finish-first +15.61 pp [8.18,23.04]; remainder -0.65; minus-finish +2.31 pp. Signs 29/7/9.

For 7 strict positions with opponent minimum hand <=2: finish deltas +16.57, +13.71, +0.86 pp. For 38 positions with opponent minimum >=3: +26.14, +25.32, +18.33 pp. Small exploratory subgroups; minimum is across both opponents, not necessarily next in turn order.

Concrete counterexample seed 63040: focal hand 3-3,3-4,1-3,0-0; both opponents 4 tiles. Spending 3-3 rather than connector 3-4 increased finish-first by 30, 20 and 16 pp across three continuation policies (25 worlds only).

## Reproduction
In a checkout use simulator/engine.js, initializer.js, round-driver.js, turn-dispatcher.js, strategy-runner.js, pattern-choice-classifier.js, decision-regret.js, hidden-world.js. Initialize each seed as later round with previousWinnerIndex=seed%3; advance with closed-branch-control to first strict eligible focal hand of 4-5 tiles with empty stock. Fix all played/known tiles (full deck minus three current hands and stock), focal hand, board, opening state, current player and hand sizes. Use runHiddenWorlds(spec,{count:25,startSeed:13000000+1000*seed,continuationStrategy:policy,maxTurns:200}); compare actionKey classes above, average within each world then each position. Strict selected seeds: 63000,63001,63002,63003,63005,63007,63008,63009,63010,63011,63016,63021,63025,63030,63032,63033,63037,63038,63040,63046,63047,63048,63050,63055,63056,63058,63060,63066,63073,63074,63077,63081,63083,63084,63086,63087,63091,63093,63094,63095,63097,63099,63101,63111,63115.

Validation: V8 CommonJS execution of persisted source (Node CLI not run). Seeds 62000, 62020 and 62094 replayed twice with identical 25-world candidate outcomes, unique action keys and zero unresolved.

## Cumulative and limitations
333 deals scanned, 145 positions, 3875 new hidden worlds; no new full strategy rounds. Verified GitHub main cumulative: 180000 matched-seat full rounds + 27685 hidden worlds (prior 23810 + 3875). Historical 4000 rounds separate; chat-only unpersisted estimates excluded.

Confidence moderate for model-specific direction; low for causal connector advantage, hand-size interaction or human-play generalization. Assumed branch-opening rules, first-eligible selection under one discovery bot, class-averaged moves, only 25 worlds/position, unassigned block winner and no multiple-testing correction.

Exact next action: compare strict connector preservation against matched non-pattern double-vs-single controls; sample >=40 new cases where NEXT opponent has <=2 tiles under another discovery policy; explain seed 63040; execute Node CLI regressions.
