# Public pass vs pip-sensitive move: fixed-visible decision strata — 2026-10-18 08:50:30 Asia/Baku

- **Engine/rules:** `qosa-research-0.5.3` / recovered `qosa-1.0.0`; primary 3 players × 9 stones, later-round initialization. No gameplay-rule edits.
- **Fresh seeds:** scanned 61 deals, `1064160..1064220` (from a prespecified `1064160..1064809` search window), selecting **60 distinct first-disagreement positions** (one per deal). All selected seed IDs and action keys are in the JSON.
- **Workload:** 12 uniformly sampled hidden allocations per position = **720 fixed-visible worlds**, with **2,880 forced-action continuations** across two bot policies. Zero new full strategy rounds; **215,520 previously validated complete matched-seat rounds** remain cumulative (historical 4,000 separate).
- **Method:** compare the public-pass move against the public-pass+0.01×discarded-pips move only when they disagree. Fix the visible hand, played stones, branches, and hand sizes; sample opponents/stock anew, force each action in the same hidden world, then use an identical continuation policy for all players. Prespecified hand strata: 1–3, 4–6, 7–9 stones; absolute pip-gap strata: 0, 1–3, 4+.
- **Validation:** deterministic replay self-test passed in a V8 CommonJS harness (2 selected positions, 16 continuations); no unresolved continuation in the main sample. **Node CLI not run.**

| Continuation bot | Stratum | Positions | Hybrid − pass finish-first | Exploratory 95% position CI | Hybrid − pass raw pips |
| --- | --- | ---: | ---: | --- | ---: |
| closed-branch-control | all | 60 | −0.83 pp | [−5.98, +4.31] pp | +0.06 |
| moderate-double-hold | all | 60 | +3.61 pp | [−1.86, +9.08] pp | −0.22 |
| closed-branch-control | 4–6 stones | 20 | +6.67 pp | [+1.03, +12.30] pp | +0.13 |
| moderate-double-hold | 4–6 stones | 20 | +3.33 pp | [−3.82, +10.48] pp | +0.32 |
| closed-branch-control | 7–9 stones | 39 | −4.70 pp | [−11.82, +2.42] pp | +0.02 |
| moderate-double-hold | 7–9 stones | 39 | +3.85 pp | [−3.79, +11.48] pp | −0.50 |

**Finding:** There is **no reliable general win-rate advantage** for the pip-sensitive move in this decision-level sample. A possible middle-hand advantage under one continuation bot is **exploratory only** and is not reproduced conclusively against the other bot. Just **one** eligible position had 1–3 stones, so the late-game hypothesis is **not tested adequately**. The discarded-pip gap was 4+ in 49/60 positions.

**Confidence and limitations:** low for gameplay advice; 12 hidden worlds per position and 60 first-disagreement positions, no history-conditioned posterior, selection from a single discovery policy, bot-dependent continuation, provisional branch semantics, no block winner/full-match scoring, no multiple-testing correction. Position-level normal CIs are exploratory and do not account for dependence across alternate bot continuations. These are conditional local counterfactuals, not whole-game strategy wins.

**Exact next action:** modify the discovery sampler to collect *late-game* 1–3-stone divergences rather than the first divergence, select at least 30 independent seeds per hand-size stratum if feasible, and rerun >=50 identical hidden worlds per position on a disjoint seed range `1064809..`. Compare finish-first, raw remainder, beneficial minus finishes, block rate, and regret with two continuation policies. Run the Node CLI self-test and invariants in an executable checkout before promoting any claim.

**Reproduce:** `node qosha-research/simulator/pass-pip-decision-strata.js test` then `node qosha-research/simulator/pass-pip-decision-strata.js 1064160 650 60 12`. Source: `simulator/pass-pip-decision-strata.js`. Full seed set, per-position deltas, and uncertainty: `runs/2026-10-18-0848-pass-pip-decision-strata.json`.
