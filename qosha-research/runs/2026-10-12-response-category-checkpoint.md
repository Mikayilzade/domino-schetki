# Exact first-opponent response-category holdout — 2026-10-12 07:46 Asia/Baku

Engine: qosa-research-0.5.3; rules: recovered qosa-1.0.0; mode: 3 players x 9 stones.
Deals: 6,359 scanned in seed range 1200000..1319999; 30 selected positions, 280 exact hidden allocations, 3,519 candidate continuations; zero new complete strategy rounds. Prior verified total: 180,000 complete strategy rounds; historical 4,000 separate.
Selected seeds: 1200007, 1200163, 1200174, 1200190, 1200317, 1200802, 1200909, 1201467, 1201580, 1201656, 1201891, 1201963, 1202204, 1202369, 1202513, 1202652, 1202924, 1203245, 1203363, 1203515, 1203650, 1203871, 1203968, 1204780, 1205408, 1205482, 1205840, 1206263, 1206285, 1206358.
Policies: closed-branch-control, min-hand-pips, fast-doubles. Equal-pip connector vs unrelated single, both retaining X-X. Identical exhaustive hidden allocations; uniform hidden worlds within position, equal weight per position. Continuation seed: 57000000+1000*dealSeed+lexicographicAllocationIndex.
Connector-minus-unrelated first-place delta: -15.88 pp closed-branch-control, -15.88 pp min-hand-pips, -0.25 pp fast-doubles. Closed-branch remainder +1.81 pips. Exploratory position CI for closed-branch first-place: -29.86 to -1.90 pp.
Next-opponent replies (closed-branch): connector forces pass in 54 worlds; unrelated forces pass in 35; different-tile reply in 54; both pass in 30; same action in 81; same tile different side in 26. In unrelated-forces-pass worlds connector-minus-unrelated finish-first = -45.71 pp (pooled); descriptive, NOT causal.
Geometry: every one of 30 compared pairs differs in exactly two of four post-action branch ends. No geometry-matched pair; no independent connector-effect claim.
Validation: deterministic V8 CommonJS self-test passed on seeds 1100677 and 1101051 (31 allocations), category coverage and source-state immutability passed; Node CLI not run. No unresolved continuations.
Limitations: post-action reply categories are mediators, not randomized controls; branch semantics assumed; first eligible selection; uniform hidden allocations ignore prior opponent choices; block winner unassigned; bot-specific estimates.
Reproduce: simulator/response-category-holdout.js test, then 1200000 1320000 30.
Next: independent replication of forced-pass direction; seek matched four-end alternatives or explicitly restrict claims to geometry-dependent tactics.
