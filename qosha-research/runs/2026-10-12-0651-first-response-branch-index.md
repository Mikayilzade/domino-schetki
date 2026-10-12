# Qoşa first-opponent exact response — 2026-10-12 06:51 Asia/Baku

Full reproducible checkpoint lives on branch `qosha-research-20261012-first-response` at commit `37f05881972c26a400c95aa9f4deea6aa5c828c9` (main ref update blocked).

Read there: `qosha-research/RESULTS.md`, `simulator/exact-first-response-runner.js`, and `runs/2026-10-12-exact-first-response-1100000.json`.

3x9, engine qosa-research-0.5.3 / recovered qosa-1.0.0. Fresh deal seeds 1100000..1179999, 8,114 scanned, 30 positions, 346 exact hidden allocations, 4,836 candidate continuations, 0 new full rounds. Continuation seed: 49000000 + 1000*dealSeed + lexicographicAllocationIndex. Closed-branch-control connector-minus-unrelated first-place delta -17.28 pp; min-hand-pips -17.75 pp; fast-doubles -0.25 pp. First clockwise opponent response changes in 54.58% of worlds (position-weighted); pass status flips 37.98%; these are descriptive and not causal proof. V8 CommonJS deterministic test passed; Node CLI not run. Verified cumulative 180,000 full strategy rounds, historical 4,000 separate.

Next: independent seed replication, category-conditioned finish analysis, forced passes vs different-tile replies, and four-end geometry audit. Assumptions: uniform hidden allocations, model bots, assumed branch opening, block winner unassigned.
