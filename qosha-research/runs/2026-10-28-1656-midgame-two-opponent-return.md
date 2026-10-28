# 2026-10-28 16:56 (+04, Asia/Baku) — matched two-opponent midgame return

- **Engine/rules:** `qosa-research-0.5.3 + midgame-two-opponent-return-1.0` / recovered `qosa-1.0.0`, 3 players × 9 stones. **Both branch models are provisional**, not authentic rule confirmations.
- **New deterministic hidden allocations:** **40,000** (two independent seed cohorts `2709200..2729199` and `2729200..2749199`). **0** new complete strategy rounds/deals, **0** forced full-game continuations. No new independent 101-match data. Exact previous 1,820×924 conditional enumeration is **not** added again.
- **Matched comparison:** same public synthetic trace (1-1, 1-2, 2-2, 1-3, 1-4, 4-4, 3-4, 1-5, 5-5, 3-5, 3-3), same focal `2-3` and four other stones, same two 6-stone hidden opponent hands. Put `2-3` on the 2 end to **collapse** to four 3s, versus put it on a 3 end to **spread** the values 2 and 3. The same tile and 5 discarded pips in both candidates.
- **Opponent continuation:** two clockwise opponents each make at most one legal stone move, or pass. Compare deterministic **highest-pip** and **lowest-pip** choices, fixed tie breaks. Both `global-ever-open` and `all-current-only` branch unlock assumptions evaluated separately. Doubles can open a locked matching end; no optional multi-double chain is assumed in this short window.
- **First opponent pass:** collapse **37.2325%** vs spread **2.485%** in the 40,000 sampled worlds; exact earlier conditional target **37.50% vs 2.6224%**. Both 20,000-world cohorts passed prespecified 5-sigma calibration. First-pass eligibility invariant between the two models in this fixture.

## Results: collapse minus spread

| Provisional branch model / opponent policy | Opponent stones across two turns | Own playable stones on return | Increase in own no-legal-move probability |
| --- | ---: | ---: | ---: |
| global-ever-open / highest pip | **−0.5722** | **−1.1638** | **+22.42 pp** |
| global-ever-open / lowest pip | **−0.5739** | **−1.0431** | **+20.47 pp** |
| all-current-only / highest pip | **−0.4823** | **−0.2739** | **+4.31 pp** |
| all-current-only / lowest pip | **−0.4428** | **−0.1427** | **+1.48 pp** |

- All four signs reproduced independently in both 20,000-world cohorts. Exploratory paired-world 95% intervals for opponent-stone deltas: global/high **[−0.5778,−0.5665]**, global/low **[−0.5796,−0.5682]**, current/high **[−0.4879,−0.4767]**, current/low **[−0.4483,−0.4372]**. These are model-sampling intervals, **not human-play confidence intervals**.
- In **17,831/40,000** worlds, the focal hand retained at least one 3 connector: collapse caused **no extra immediate no-legal-move risk** in this stratum, though other mobility and opponent-tempo effects remain. In **22,169/40,000** worlds with no own 3 connector, additional own no-legal-move risk was **+40.45 / +36.93 / +7.78 / +2.67 pp** in the four rows above. This is a position-specific tactical filter, not a proven win heuristic.
- The **size of the return-risk effect changes sharply across the two unverified branch models**; do not merge them or infer finish-first/match win, minus frequency, or score impact. The one-stone greedy opponents are simplified; hidden allocations are uniform and not conditioned on earlier opponent decisions.
- **Validation:** Node 22 `test` and full run executed; 100 deterministic replays, 28 unique stones in every world, immutable source state, locked double unlock, two branch post-action lock fixtures, maximum one stone per opponent, and exact immediate-pass calibration. No branch authentication, blocked-winner/tie resolution, `loneZero`, `bust`, or 101-match scoring validation.
- **Finding:** collapsing the ends suppresses opponents' next two moves but can also leave the focal player unable to play; **the tactical tradeoff is sensitive to branch semantics**. No reliable new win-rate claim.
- **Cumulative, nonpooled:** **1,380,975** complete model-rounds across incompatible rule assumptions, **1,898,856** forced hidden-world continuations (both unchanged); **490,000** separate opening deals unchanged; **678,200** separate synthetic hidden-world allocations (638,200 previous + 40,000 new). Historical 4,000 rounds separate. Next unused seed **>=2749200**.
- **Reproduce:** `node qosha-research/simulator/midgame-two-opponent-return.js test`; `node qosha-research/simulator/midgame-two-opponent-return.js 2709200 20000 20000` (prints full per-cohort/per-model JSON metrics).
- **Exact next hypothesis/action:** study matched **3-connector-present vs absent** counterexamples and opponent access, preferably under multi-double-aware continuation; authenticate physical late-arrival branch unlocking and block ties before full-game regret or match scoring claims.
