# Exact opening pass-control vs pip-shedding frontier

- **Timestamp (Asia/Baku):** 2026-10-29T08:55:05+04:00
- **Engine/rules:** `qosa-research-0.5.3 + opening-pass-pip-frontier-1.0`; confirmed 3×9 first-round `1-1` opening, one stock draw, and first `1-X` connector placement. No late-arrival/block-scoring assumption.
- **Seeds/deals/strategies:** none; exact combinatorial comparison of maximizing next-opponent forced-pass chance (choose owned `X-X` matching `1-X`) versus maximizing immediately shed pips (choose largest `X`). **0 new seeded deals, 0 complete rounds, 0 hidden-world samples, 0 forced continuations.**
- **Exact census:** all **4,686,825** possible post-draw starter hands. **1,749,665** (37.33%) offer both owned-double and unowned-double connector options. Among these, objectives agree for **780,190** (44.59%) and conflict for **969,475** (**55.41%**). Choosing the pass-maximizing owned-double connector sacrifices **2.70** pips on average *when there is a conflict* (1.49 averaged over all mixed hands). This is the difference between the pips of the stone played now, not a final-hand remainder.
- **Existing first-pass result, reconfirmed:** owned versus unowned matching double gives **5.70 percentage points** higher probability that the **next opponent has no legal move** under uniform unseen allocations. This is not a win-rate difference.

| Number of `1-X` connectors | Mixed hands | Conflict % | Mean pip sacrifice, all mixed | Immediate pass advantage, pp |
|---:|---:|---:|---:|---:|
| 2 | 813,960 | 50.00 | 1.33 | 2.65 |
| 3 | 697,680 | 57.89 | 1.57 | 6.18 |
| 4 | 212,160 | 65.87 | 1.81 | 13.24 |
| 5 | 24,990 | 72.63 | 2.04 | 26.47 |
| 6 | 875 | 78.29 | 2.28 | 50.00 |

- **Validation:** independently enumerated all **4,686,825** distinct 9-tile post-draw hands (not Monte Carlo), matching a separate 4,096-mask weighted combinatorial calculation exactly for mixed/aligned/conflict counts, pip-sum and every sacrifice bucket. Tested in V8; Node CLI from fresh GitHub checkout not run.
- **Finding:** in a majority (**55.41%**) of hands with the relevant choice, the connector that best restricts the next opponent is *not* the connector that sheds the most pips. Therefore, **"keep the matching double" is not a free tempo benefit**; it trades an exact one-ply pass probability for a real immediate pip-shedding difference. No new validated winning tactic.
- **Confidence/limitations:** exact combinatorial statement for the confirmed opening only. No evidence about first-place, end-of-round remainder, minus finishes, human choices, late-arrival branch opening, blocked-tie scoring, `loneZero`, or 101-match outcomes. Do not pool with incompatible full-round simulations.
- **Reproduce:** `node qosha-research/simulator/opening-pass-pip-frontier.js`. Script runs the exhaustive independent regression on every execution.
- **Cumulative unchanged:** **1,380,975** complete model-rounds under incompatible rules; **1,898,856** forced continuations; **748,688** separate seeded hidden allocations; **490,000** opening deals. Historical 4,000 separate. Next unused seed **>=2817640**.
- **Exact next hypothesis/action:** authenticate a real physical late-arrival branch and blocked-tie outcome, then compare owned-double pass-control against highest-pip connector on matched hidden worlds, split by pip sacrifice 0 / 1–2 / 3+ and opponent policy.
