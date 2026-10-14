# Qoşa matched-K exceptions — 2026-10-14 17:55 Asia/Baku

Engine/rules: qosa-research-0.5.3 / qosa-1.0.0; 3 players x 9 stones. No gameplay changes.

Independent discovery: seeds 4200000..4299999, min-hand-pips, first eligible matched-K single vs one double; 2,726 deals scanned, 70 positions. 25 hidden allocations/position = 1,750 sampled worlds (1,571 unique within positions); 10,500 candidate continuations; 0 unresolved. Continuation bots: closed-branch-control, min-hand-pips, fast-doubles. Seed formula: (1500000000 + Math.imul(dealSeed,73) + worldIndex) >>> 0.

Single minus double finish-first advantage, position-weighted:
- closed-branch: +15.20 percentage points (exploratory 95% position interval 10.16..20.24), 50 positive, 9 negative, 11 tied; remaining pips -1.134.
- min-hand-pips: +9.14 pp (4.67..13.62), 41 positive, 16 negative, 13 tied; remaining pips -0.854.
- fast-doubles: +4.80 pp (0.77..8.83), 33 positive, 20 negative, 17 tied; remaining pips -0.017.

Opening the double outperformed retaining it in 4/70 positions under all three continuation policies and 14/70 under at least two. Illustrative candidate counterexamples (single-minus-double):
- seed 4200696, hand 0-2 0-4 2-3 2-5 3-5 4-4: -32/-16/-12 pp (closed/min/fast).
- seed 4201987, hand 2-2 2-3 2-4 3-5 4-4 4-5: -28/-12/+8 pp.
- seed 4202369, hand 1-3 1-4 2-2 2-4 2-5 4-4 4-5: -36/+4/+20 pp.

Number-X connectors excluding X-X: zero in 2 positions, one in 25, two or more in 43. Exploratory closed-branch single-minus-double: +6.0/+13.76/+16.47 pp respectively. Too few zero-connector positions for conclusions.

Validation: V8 CommonJS deterministic two-world fixture passed, 70-position strata partition passed; Node CLI not run. Reproduce using:
node qosha-research/simulator/matched-k-exceptions.js test
node qosha-research/simulator/matched-k-exceptions.js 4200000 4300000 70 25

Cumulative verified full strategy rounds: 180,000; new full strategy rounds: 0. Historical 4,000 separate. Do not confuse candidate continuations with new full strategy rounds.

Confidence/limitations: exploratory intervals, 25 hidden worlds/position with replacement, first-eligible selection, differing full four-end geometry, unconditioned hidden allocations, deterministic bots, assumed branch-opening semantics, block winner unassigned. Individual negative positions can be sampling artifacts. No universal human-play exception proven.

Next: independent-world retest of opening-double-favorable positions and matched connector/four-end geometry analysis.
