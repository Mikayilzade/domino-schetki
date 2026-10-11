# 2026-10-11 19:46 Asia/Baku — alternate-discovery conditional experiment and fresh matched baseline

Engine: qosa-research-0.5.3; rules: recovered qosa-1.0.0; mode: 3 players × 9 stones; no rule changes. Executed using V8 CommonJS module loader reading current GitHub source; Node CLI not executed.

## Conditional experiment
- New independent discovery seeds: 320000..399999; 5,124 ready deals scanned until 25 first-eligible positions found using **min-hand-pips** discovery policy (not the previous closed-branch-control).
- 25 matched hidden worlds per position = 625 allocations, world seed `34000000+1000*dealSeed+worldIndex`; 7,875 candidate continuations under closed-branch-control, min-hand-pips and fast-doubles. No unresolved candidates. No new complete rounds credited from this paired-world experiment.
- Forced comparison: play connector X-Y versus unrelated equal-pip ordinary stone, both moves retain X-X plus another connector. Same visible state, same hidden allocation, same continuation policy. Outcomes reported as **connector minus unrelated**.
- Finish-first difference: closed-branch-control **-13.92 percentage points** (exploratory position-normal 95% CI -27.49..-0.35); min-hand-pips **-13.92 pp** (CI -27.48..-0.36); fast-doubles **+0.64 pp** (CI -1.95..+3.23).
- Mean focal remainder difference: +2.5312 / +2.5568 / +0.0976 pips for those three policies, respectively.
- Connector next-turn accessibility difference: -0.456 (connector minus unrelated; probability that an X connector is playable on the focal player's next turn, after two opponents' moves); same across the three deterministic policies in this cohort. Available X connectors: -0.9344 per position.
- Immediate opponent mobility measured before either responds: unrelated minus connector, next player +0.0384 playable tiles, third player +0.0016; no meaningful average difference.
- Only 27/625 hidden worlds from 2/25 positions had **both** opponents' immediate mobility unchanged; too sparse for a reliable conditional estimate.
- Self-test: deterministic V8 replay passed on first selected seed 320058. No new human-play generalization: branch side/geometry confounded; hidden allocations not conditioned on opponent move history; first-eligible selection; locked/open assumptions; block winner not assigned. Position-normal confidence intervals are exploratory, not preregistered. The paired-world runner used for this analysis has not yet been persisted to the repo: prioritize persisting/replaying its code before treating this as independently reproducible.

## Fresh complete-round matched baseline
- Source: existing `simulator/strategy-runner.js` `runMatchedBaseline({startSeed:500000,count:1000,maxTurns:200})`, V8 CommonJS execution; independent seed range **500000..500999**, three seat rotations each.
- **3,000 new complete strategy rounds**, 2,881 finishes, 119 blocks, 0 unresolved, mean 24.318 turns.
- Strategies: random-legal: 1,132 finish wins / 3,000 appearances = 37.733%, mean final pips 5.5947, median 5, minus finishes -10:55, -20:1, -30:1, -40:0.
- min-hand-pips: 1,044 / 3,000 = 34.800%, mean pips 3.620, median 3, minus -10:125, -20:1, -30:0, -40:0.
- fast-doubles: 705 / 3,000 = 23.500%, mean pips 5.0453, median 4, minus -10:17, -20:0, -30:0, -40:0.
- Remaining 119 block rounds have **no winner assigned**; finish-first rates are not total game win rates.
- Previous validated 180,000 complete matched-seat rounds + this independent 3,000 = **183,000**; historical 4,000 remain separate; 625 sampled hidden worlds / 7,875 continuations never added to this cumulative full-round total.

## Finding and next action
No universal connector heuristic. On this independent min-hand-pips-discovered cohort, spending the connector was worse for finish-first against two policies even though opponents' immediate mobility barely differed. This is provisional, policy- and selection-dependent, not a causal explanation.

**Next:** persist the exact paired-world runner, replay all selected seeds, then enlarge the rare both-opponent-mobility-unchanged subset and stratify by target branch geometry. Validate Node CLI in an executable checkout. Do not alter live scoreboard/PWA files.
