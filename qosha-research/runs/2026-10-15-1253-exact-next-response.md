# Exact next-opponent response checkpoint — 2026-10-15 12:53 Asia/Baku

Engine qosa-research-0.5.3; recovered qosa-1.0.0 (branch rules provisional); primary 3x9.
Fresh min-hand-pips discovery: 10,190 seeds scanned, 170000..180189; 40 eligible positions; 346 exhaustive unseen allocations; 2,076 matched candidate continuations; 0 unresolved. No new full strategy rounds; verified cumulative remains 180,000 (historical 4,000 separate).
Connector X-Y vs non-X single: equal pip sum, both retain X-X and another connector, same hidden allocations and continuation policies.
Connector-minus-other finish-first: closed-branch-control -26.74 pp; min-hand-pips -28.49 pp; fast-doubles -0.92 pp. Mean remainder: +2.00 / +2.07 / +0.21 pips.
Post-hoc next-player pass strata (closed-branch): connector causes more passes, 12 positions, +10.87 pp; fewer passes, 18 positions, -69.63 pp; unchanged, 10 positions, +5.33 pp. This is exploratory, not a causal human rule.
Exact allocations are lexicographic combinations of unseen stones to opponents; continuation seed = 42000000 + 1000*dealSeed + allocationIndex. Source unchanged; 28-tile integrity and deterministic replay checked in V8 (not Node).
Limitations: first eligible positions, lexicographically first pair, provisional branch semantics, unconditioned equal-weight hidden allocations, bots, block winner unassigned; pass strata confounded with four-branch geometry. No universal rule established.
Next: persist standalone exact runner if write permitted, run Node regression, and compare branch-matched pass effects on fresh seeds.
