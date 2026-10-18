# Fresh-seed pass–pip holdout — 2026-10-18 06:47 Asia/Baku

Engine `qosa-research-0.5.3`, rules `qosa-1.0.0`, 3×9 later-round. Executed `public-pass-pip-frontier.js` with `run(1063660,80)` in V8 CommonJS harness after deterministic self-test passed (96 replay rounds); Node CLI not independently run. **160 unique fresh deal seeds** 1063660..1063819, two 80-deal cohorts, 3 focal seats, 4 policies, 2 opponent mixes: **3840 complete matched-seat rounds**; zero unresolved (runner throws on unresolved). Prior documented 207840 complete rounds + 3840 = **211680**, historical 4000 separate. Reused deal seeds across opponent mixes, so these are not independent replication samples.

Preselected comparison: public-pass-pip-0.01 versus pure-pass; secondary exploratory: weight 0.025 and no-pass. Each arm shares initial deal and seat; two identical opponents either closed-branch-control or moderate-double-hold. Public unknown-pool pass probability assumes uniform unseen allocations and ignores opponents' action histories. Score is first finisher (not match winner); pips are raw remainder; block winner unassigned.

| Opponent | Seed cohort | Pass first % | Hybrid .01 first % | Δ first pp (paired seed CI95) | Pass mean pips | Hybrid mean pips | Δ pips | Δ block pp | .025 Δ first pp | No-pass Δ first pp |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| closed-branch-control | 1063660..1063739 | 40.42 | 36.25 | -4.17 [-9.15, 0.82] | 5.01 | 5.16 | 0.15 | 0 | -5.83 | -10 |
| closed-branch-control | 1063740..1063819 | 37.92 | 37.5 | -0.42 [-5.55, 4.71] | 5.6 | 5.5 | -0.1 | 0.83 | -4.58 | -5.83 |
| moderate-double-hold | 1063660..1063739 | 43.75 | 46.67 | 2.92 [-3.36, 9.2] | 3.95 | 3.78 | -0.17 | -0.83 | 2.08 | -5 |
| moderate-double-hold | 1063740..1063819 | 39.17 | 44.58 | 5.42 [-0.67, 11.51] | 4.04 | 3.69 | -0.35 | 1.67 | 3.75 | -2.08 |

**Finding and confidence:** independent holdout from earlier 1063500..1063659. This is an exploratory replication check of a preselected hybrid, not a confirmed real-game advantage. Interpret sign consistency and uncertainty across the four cells, without treating opponent mixes on shared deals as independent. Branch-opening mechanics are assumption-labelled; score-floor and match bust are not modeled as full-match outcomes. CIs are exploratory, cluster by deal seed with 3 focal seats averaged, not adjusted for multiple strategies or comparisons. No causality from pass-vs-pips can be inferred from this tournament alone.

**Exact next action:** test whether hybrid gains vary with number of tiles remaining and candidate pip-gap, using paired *decision-level* counterfactuals under identical sampled hidden worlds; pre-register strata before checking outcomes. Also run full Node CLI invariants in a checkout. Do not promote this policy to human advice unless repeatable across opponents and fresh seeds.

Reproduce: `node qosha-research/simulator/public-pass-pip-frontier.js test` then `node -e "console.log(JSON.stringify(require('./qosha-research/simulator/public-pass-pip-frontier').run(1063660,80),null,2))"`.
