# 2026-10-16 22:48 Asia/Baku — independent connector response holdout

Engine qosa-research-0.5.3 / recovered qosa-1.0.0, primary 3x9.
Discovery: closed-branch-control, first eligible equal-pip connector versus unrelated single; both retain X-X and another connector. Seeds 610000..619999; 10000 scanned; 24 eligible positions. Hidden world seed 63000000+1000*dealSeed+worldIndex, index 0..24; 600 worlds, 3600 forced continuations, zero unresolved. Policies: closed-branch-control, min-hand-pips, fast-doubles. V8 CommonJS deterministic 2-position/2-world replay PASS; Node CLI not run.

Connector minus unrelated, equal-position means:
- First-finish: -21.50, -18.67, +2.50 percentage points (policies in order).
- Remaining pips: +1.958, +1.733, -0.858.
- Next opponent pass: +10.83 percentage points; next distinct playable tiles: -0.083.
- Same next-player selected tile: 44.33 percent.
- X=0 (14 positions) first-finish: -23.43/-23.43/0.00 pp. X>0 (10 positions): -18.80/-12.00/+6.00 pp.
- Connector action had 0.958 fewer accessible open branch ends on average; 23 positions fewer, 1 same, 0 more.

Finding: the connector move increased immediate opponent passes yet underperformed on first-finish for two policies. Immediate passes alone do not explain outcomes. Not causal: post-action branch geometry differs; bot policies, first-eligible selection, small clusters, uniform hidden worlds, provisional branch semantics and unassigned block winner limit generalization. Fast-doubles differs.

No new full strategy rounds. Previously verified full rounds 186000, historical 4000 separate. Hidden worlds are separate. No scoreboard changes.

Reproduction gap: standalone script and raw rows were not saved. Exact next action: persist/replay standalone connector response geometry runner and rows on these seeds; Node CLI validation; fresh holdout with different discovery policy and four-end/next-response stratification.
