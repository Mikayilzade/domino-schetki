# Qoşa double-retention audit — 2026-10-18 12:50 Asia/Baku

Engine qosa-research-0.5.3; rules qosa-1.0.0; 3 players x 9 stones, later-round.

V8 CommonJS execution: scanned 555 independent deal seeds 1069000..1069554, selected 50 late-game positions (49 with 3 stones, 1 with 2), 3000 hidden-world allocations, 12000 paired forced continuations, 0 unresolved. Policies: public next-pass versus pass-pip-0.01, with closed-branch-control and moderate-double-hold continuations. Both forced actions use the same hidden worlds. New complete tournament rounds: 0.

The hybrid minus pass finish-first delta was -3.27 / -2.87 percentage points (closed-branch / moderate-hold). Beneficial minus-finish delta: -31.67 points, exploratory 95% position CI [-39.83,-23.50].

When the pass policy played a single while the hybrid spent a double (25 positions), the hybrid finish-first delta was -13.93 points under both continuation policies, and beneficial minus-finish -29.80 points. When both actions spent doubles (19 positions), hybrid finish-first was +8.16 / +8.33 points, but beneficial minus-finish -40.53 points. For single-to-single transitions (6 positions), no reliable effect.

All tests passed in V8 CommonJS harness: test.js, dispatcher-test.js, finish-minus-test.js, round-test.js, turn-test.js, hidden-world-test.js and late holdout self-test. Node CLI not executed. Seed/position reproduction: existing simulator/pass-pip-late-holdout.js, arguments 1069000 1600 50 60; classify each output position by pass.key and hybrid.key prefix.

Cumulative verified complete strategy rounds: 215520, historical 4000 separate. Previous local-only 11:50 checkpoint (not rerun) had 50 positions, 3000 worlds, 12000 continuations and -29.93 pp beneficial-minus hybrid delta.

Finding is provisional, not human advice: selected policy-disagreement positions, uniform hidden worlds ignoring opponent history, assumed branch-opening semantics, no block winner, two deterministic bots, exploratory uncorrected position intervals.

Next: fresh-seed controlled double-retention comparisons stratified by accessible ends and retained connectors, and target 1-2-stone endings separately.