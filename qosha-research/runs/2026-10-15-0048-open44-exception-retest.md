# Independent 4-4 exception retest — 2026-10-15 00:50 Asia/Baku

- Engine: `qosa-research-0.5.3`; rules: `recovered qosa-1.0.0`; mode 3x9. Tests: deterministic replay and candidate/seed invariants passed in V8 CommonJS (not Node CLI).
- Fresh world indices: **1000..1199**; world formula: `(1500000000 + Math.imul(dealSeed,73) + worldIndex) >>> 0`. Seeds: exceptions **4401931, 4407745**, controls **4402067, 4405689**. Same hidden worlds and continuation seeds for both candidate moves.
- New full strategy rounds **0**; cumulative verified **180,000** full rounds, historical 4,000 separate. New sampled hidden worlds **800**, paired candidate continuations **6400**, 0 unresolved.
- Four continuation policies: closed-branch-control, min-hand-pips, fast-doubles, random-legal. Sign is **single retaining 4-4 minus opening 4-4**; negative first-finish delta favors opening.

| Seed | Cohort | 4-connectors after single/double | Own immediate legal actions single/double | Next opponent actions single/double (mean) | Win delta pp by policy (branch / pips / fast / random) |
|---|---|---|---|---|---|
| 4401931 | exception | 0-4 / 0-4 | 1 / 5 | 1.52 / 3.23 | -9.5 / -9.0 / -3.5 / -3.5 |
| 4407745 | exception | none / none | 2 / 4 | 2.64 / 5.61 | -11.0 / -5.5 / -3.0 / -3.5 |
| 4402067 | control | 2-4 / 2-4 | 3 / 6 | 2.10 / 5.24 | -6.0 / 3.0 / 11.5 / -1.0 |
| 4405689 | control | 0-4 / 0-4 | 4 / 4 | 3.44 / 5.68 | 7.5 / 54.5 / 73.5 / 44.0 |

### Per-policy exploratory 95% world intervals (pp)
- 4401931: closed-branch-control -13.6..-5.4; min-hand-pips -13.0..-5.0; fast-doubles -8.6..1.6; random-legal -10.8..3.8
- 4407745: closed-branch-control -16.7..-5.3; min-hand-pips -9.0..-2.0; fast-doubles -6.9..0.9; random-legal -11.5..4.5
- 4402067: closed-branch-control -14.2..2.2; min-hand-pips -5.6..11.6; fast-doubles 2.2..20.8; random-legal -8.1..6.1
- 4405689: closed-branch-control -1.4..16.4; min-hand-pips 46.9..62.1; fast-doubles 66.5..80.5; random-legal 35.1..52.9

### Findings and caution
- These are **previously selected exceptions** plus two nonrandom controls. Their result cannot estimate the prevalence of exceptions among ordinary hands; any single-seed effects require caution. Policies share worlds and are not independent confirmations.
- Geometry, 4-connector identity and immediate mobility are recorded for mechanistic exploration, **not causal attribution**. The count of legal actions immediately after a move is not the same as access on the player's next actual turn.
- Selected exceptions and two nonrandom controls; 200 independent-seed draws per position, but allocations can repeat. Position selection based on previous results, so effect estimates have winner selection bias. Uniform hidden allocations not conditioned on opponent play history; fixed deterministic policies; assumed branch-opening semantics; block winner unassigned; exploratory CIs are per-world and do not imply population generalization. Immediate legal-action count is post-action descriptive mediator.
- Next: If exceptions replicate, compare 4-connector identities and post-action four-end geometry with matched fresh non-exception positions; preregister a new unselected discovery holdout before promoting any human rule.

Reproduce: `node qosha-research/simulator/open44-exception-retest.js test` then `node qosha-research/simulator/open44-exception-retest.js`. Machine-readable data: `runs/2026-10-15-0048-open44-exception-retest.json`.
