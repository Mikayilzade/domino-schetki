# Qoşa late double opening — exact enumeration checkpoint

Timestamp: 2026-10-21 11:55 Asia/Baku (+04:00).
Engine: qosa-research-0.5.3; rules: qosa-1.0.0; primary mode 3 players x 9 stones. Branch semantics provisional.

## Reproduction
Run: node qosha-research/simulator/late-equal-pip-exact-recheck.js test
Then: node qosha-research/simulator/late-equal-pip-exact-recheck.js
Actual execution: GitHub-sourced V8 CommonJS harness; Node CLI not run.
Test passed: deterministic replays and exhaustive counts 20, 10, 20, 35 for four exception seeds, full 28-tile conservation, legal equal-pip forced moves, unchanged source state.

Revisited the same 60 late positions from deal seeds 1345000..1346066 (min-pips discovery) and 1350000..1350605 (branch-control discovery), 1,673 deals scanned. Enumerated every distinct assignment of unknown tiles to both opponent hands: **1,287 exact hidden allocations**. Evaluated **10,296 paired candidate continuations**, 0 unresolved; **0 new complete strategy rounds**. No double counting with prior 1,920 sampled worlds/11,520 continuations on these same positions.

Comparison: X-X opening vs an ordinary single discarding exactly the same pip total, identical hidden allocation and continuation policy. Policies: min-hand-pips, closed-branch-control, fast-doubles (canonical tie-breaking), and moderate-double-hold (separate policy). Equal weighting of exact allocations within each position and equal weighting of 60 positions.

| Policy | Opening-minus-single finish-first | Mean focal remainder difference |
| --- | ---: | ---: |
| min-hand-pips | -29.14 pp | +1.487 pips |
| closed-branch-control | -31.24 pp | +1.636 pips |
| fast-doubles | -21.71 pp | +0.971 pips |
| moderate-double-hold | -27.56 pp | +1.416 pips |

Four previously opening-favorable exception positions, exact opening-minus-single finish-first (pp):
| Seed | Focal hand | Exact allocations | min-pips | branch-control | fast-doubles | moderate-hold |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| 1345275 | 3-3, 0-6, 0-2 | 20 | +15.00 | +15.00 | +15.00 | 0.00 |
| 1345728 | 2-2, 0-4, 0-2 | 10 | +10.00 | +10.00 | +10.00 | -10.00 |
| 1350085 | 0-2, 3-3, 0-6 | 20 | +30.00 | +30.00 | +30.00 | -15.00 |
| 1350420 | 0-4, 0-6, 2-2 | 35 | +25.71 | +25.71 | +25.71 | +25.71 |

Exact positive across original three policies: seeds 1345275, 1345728, 1345825, 1350085, 1350420, 1350496 (6 of 60); exact negative across all three: 35 of 60. Only original exception seed **1350420** remains positive across all four policies. Next-opponent immediate distinct legal tile types opening-minus-single: +1.152 on average across positions; focal own immediate legal types: +0.583.

**Finding:** all four original exceptions survive removal of Monte Carlo allocation noise under the assumed uniform-hidden model, but three are not robust to a fourth continuation policy. No universal double-opening rule is established.

**Confidence/limitations:** exhaustive over the current unseen pool only; equal hidden-world weighting ignores earlier opponent choices and passes, first eligible late states are selected, post-action geometry and hand connectivity differ, branch unlock semantics provisional, block winner unassigned, deterministic bots, finish-first is not match win. Position-level CIs exploratory, not causal.

**Cumulative:** prior full-strategy continuation count **264,900 unchanged**; this checkpoint adds **10,296 exact candidate continuations**, tracked separately from previous Monte Carlo and historical 4,000 rounds.

**Exact next hypothesis/action:** search fresh disjoint deal seeds for isolated-double + 0-X connector/bridge patterns, enumerate hidden worlds exactly, compare all four policies, stratify by post-action focal connectivity and observed opponent passes; investigate seed 1350420. Do not modify scoreboard/PWA or create GitHub Actions.
