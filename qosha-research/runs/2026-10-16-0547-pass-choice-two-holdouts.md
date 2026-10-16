# Qoşa açdı research — 2026-10-16 05:47 Asia/Baku

Engine qosa-research-0.5.3; rules qosa-1.0.0; primary 3×9. Branch semantics provisional.
Recovered holdout 910000..959999: 50000 deals scanned, 94 positions, 803 exhaustive hidden allocations, 10809 candidate continuations. Policies closed-branch-control / min-hand-pips / fast-doubles: changes 5/5/5, strict reversals 3/3/4, actual first-finish delta 0/0/0, remaining pips saved 11/11/7. Previously unsaved.
New holdout 960000..1009999: 50000 deals scanned, 113 positions, 1003 exhaustive hidden allocations, 13443 candidate continuations. Same policies: changes 4/4/4, strict reversals 1/1/2, first-finish delta 0/0/0, remaining pips saved 2/2/7, minus-finish delta 0/0/0. Posterior reduced in 18 positions; every changed recommendation had conditioned support 1.
Reproduce: node qosha-research/simulator/pass-choice-regret-runner.js test; node qosha-research/simulator/pass-choice-regret-runner.js 960000 1010000 150. Fixture seed 773582 passed V8 CommonJS test; Node CLI not run.
Confidence: no reliable first-place benefit; retrospective, selected equal-pip positions, uniform exhaustive allocations, deterministic bots, provisional branch semantics, no block winner. Policies not independent.
Total this checkpoint: 100000 scanned deals, 207 positions, 1806 hidden allocations, 24252 continuations. Zero new complete strategy rounds. Verified complete-round baseline stays 180000; historical 4000 separate.
Next: fresh seeds 1010000..1059999; stratify posterior support and finish-first regret; test unequal-pip alternatives controlling hand size.
