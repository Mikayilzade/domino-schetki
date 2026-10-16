# Exact end-number geometry checkpoint — 2026-10-17T02:51:44 +04:00
Engine/rules: qosa-research-0.5.3 / recovered qosa-1.0.0; primary 3x9. No engine or live scoreboard changes.
Six first-eligible min-hand-pips discovery deal seeds: 703612, 704026, 709028, 715654, 733993, 747376. Hidden allocations per seed: 15, 15, 15, 21, 15, 15; 96 exhaustive hidden allocations and 576 paired forced continuations (2 actions x 3 bot policies). 0 new full strategy rounds; previous confirmed total 186000, historical 4000 separate.
V8 CommonJS regression passed (21/21 distinct allocations at 715654, deterministic replay, 28 unique stones, unchanged visible state); Node CLI NOT executed.
All six positions have equal *counts* of accessible ends, but 0/6 have equal *number identities*; count matching cannot isolate connector retention.
Seed 715654: connector 0-5 leaves accessible end 2; unrelated 2-3 leaves accessible end 5. Exhaustive 21 allocations: connector-minus-other finish-first delta -71.43 pp closed-branch, -66.67 pp min-pips, 0 pp fast-doubles; remainder +6.81/+4.52/+7.67 pips; immediate next-opponent pass -42.86 pp. Exact allocation comparisons: closed-branch 15 worse, 6 tied; min-pips 15 worse, 1 better, 5 tied.
Six-position equal-weight finish-first delta: -11.90/-14.44/0.00 pp; driven by one seed, so NO general strategy rule.
Raw per-allocation deltas and geometry: runs/2026-10-17-0248-exact-geometry-six-positions.json; reproducible code: simulator/exact-geometry-enumeration.js (test or six seed arguments).
Confidence: exhaustive for fixed visible positions under uniform hidden allocations; not an opponent-history posterior. Six clusters, deterministic bots, first-eligible selection, provisional branch opening, block winner unassigned. No human-play generalization.
Next: seek independent equal-accessible-NUMBER identity controls; test alternative hidden-history priors and end-number effects. Do not count allocations as full rounds.
