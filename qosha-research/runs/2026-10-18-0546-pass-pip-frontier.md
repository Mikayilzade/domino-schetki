# Public pass–pip frontier (2026-10-18 05:46 Asia/Baku)

Engine `qosa-research-0.5.3`, rules `qosa-1.0.0`, 3 players × 9. Fresh seeds `1063500..1063659` in two non-overlapping 80-deal cohorts; 160 unique deals × 3 focal seats × 4 policies × 2 opponent mixes = **3840 complete rounds**. Zero unresolved. Cumulative documented full rounds: **207840** (historical 4,000 excluded). Reproduction: `node qosha-research/simulator/public-pass-pip-frontier.js test`, then `node qosha-research/simulator/public-pass-pip-frontier.js 1063500 80`. This run executed in a V8 CommonJS evaluation harness; Node CLI not independently verified.

All policies share immediate-finish priority, public next-opponent pass probability, and tie-breakers. The experimental hybrid policies rank by `P(next pass)+w×pips removed` with `w=0.01` or `0.025`; no-pass and pure-pass are controls. Each focal policy plays against two identical opponents, on identical deals/seats. Opponent policies: closed-branch-control and moderate-double-hold. All focal decisions use only public played tiles, own hand and opponent hand sizes; the unknown pool is assumed uniform.

| Opponents | Cohort | Policy | Finish first | Mean remainder | Block rate | Δ finish vs pure pass (pp) | Δ remainder vs pure pass |
|---|---|---|---:|---:|---:|---:|---:|
| closed-branch-control | 1063500..1063579 | pass | 37.08% | 5.74 | 7.08% | — | — |
| closed-branch-control | 1063500..1063579 | no-pass | 31.67% | 5.33 | 5.00% | -5.42 | -0.41 |
| closed-branch-control | 1063500..1063579 | pass-pip-0.01 | 40.42% | 5.15 | 6.67% | 3.33 | -0.59 |
| closed-branch-control | 1063500..1063579 | pass-pip-0.025 | 37.50% | 5.70 | 5.83% | 0.42 | -0.03 |
| closed-branch-control | 1063580..1063659 | pass | 35.83% | 6.80 | 6.67% | — | — |
| closed-branch-control | 1063580..1063659 | no-pass | 33.33% | 6.16 | 0.00% | -2.50 | -0.63 |
| closed-branch-control | 1063580..1063659 | pass-pip-0.01 | 37.08% | 6.49 | 6.67% | 1.25 | -0.31 |
| closed-branch-control | 1063580..1063659 | pass-pip-0.025 | 37.50% | 6.44 | 6.67% | 1.67 | -0.35 |
| moderate-double-hold | 1063500..1063579 | pass | 38.75% | 4.81 | 7.50% | — | — |
| moderate-double-hold | 1063500..1063579 | no-pass | 31.67% | 4.78 | 3.75% | -7.08 | -0.03 |
| moderate-double-hold | 1063500..1063579 | pass-pip-0.01 | 41.67% | 4.23 | 6.67% | 2.92 | -0.58 |
| moderate-double-hold | 1063500..1063579 | pass-pip-0.025 | 41.25% | 4.43 | 5.83% | 2.50 | -0.38 |
| moderate-double-hold | 1063580..1063659 | pass | 43.75% | 4.47 | 5.42% | — | — |
| moderate-double-hold | 1063580..1063659 | no-pass | 43.75% | 4.20 | 3.33% | -0.00 | -0.27 |
| moderate-double-hold | 1063580..1063659 | pass-pip-0.01 | 39.17% | 4.54 | 5.42% | -4.58 | 0.07 |
| moderate-double-hold | 1063580..1063659 | pass-pip-0.025 | 39.17% | 4.20 | 5.00% | -4.58 | -0.27 |

**Finding / confidence:** this is a matched-seat exploratory comparison, not a match-scoring win rate. closed-branch-control 1063500..1063579: w=.025 vs pure pass Δ finish 0.42 pp, Δ pips -0.03; closed-branch-control 1063580..1063659: w=.025 vs pure pass Δ finish 1.67 pp, Δ pips -0.35; moderate-double-hold 1063500..1063579: w=.025 vs pure pass Δ finish 2.50 pp, Δ pips -0.38; moderate-double-hold 1063580..1063659: w=.025 vs pure pass Δ finish -4.58 pp, Δ pips -0.27; Two cohorts are independent by seed within each opponent mix, but opponent mixes reuse deals and cannot be counted as independent replications. Seed-cluster 95% CIs are in the linked JSON, not corrected for multiple hypotheses. Branch opening assumptions, uniform hidden worlds, unassigned block winners, simple bots and historical RNG incompatibility limit generalization. No human-game strategy rule is claimed without consistent holdout evidence.

**Next hypothesis/action:** test the best candidate on a preregistered fresh seed range against different opponent mixtures, using full-continuation paired decision regret and scoring sensitivity to blocks; do not invent block winner logic. Inspect the pass–pip Pareto frontier instead of maximizing finish-first alone. Exact source/data: `simulator/public-pass-pip-frontier.js`, `runs/2026-10-18-0546-pass-pip-frontier.json`.
