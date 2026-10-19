# Independent public next-pass policy holdout — 2026-10-19 04:54 Asia/Baku

Engine: qosa-research-0.5.3; rules: qosa-1.0.0; mode: 3 players × 9 tiles, later round.

Reproduce: `node qosha-research/simulator/public-pass-tournament.js 2021000 1000`.

1000 distinct deterministic seeds `2021000..2021999`; 3 seat rotations per seed; 2 arms. **6000 complete rounds**, **0 unresolved**, **393 blocks**. V8 CommonJS self-test passed; Node CLI not run in this environment.

| Arm | Policy | Finish-first count / 3000 | Finish-first % | Mean remaining pips | Median pips | -10 | -20 | -30 | -40 |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| A | public-next-pass | 1133 | 37.7667 | 5.4917 | 3 | 297 | 25 | 3 | 0 |
| A | public-no-pass | 723 | 24.1000 | 7.0477 | 5 | 148 | 12 | 1 | 0 |
| A | closed-branch-control | 949 | 31.6333 | 5.6517 | 4 | 200 | 13 | 0 | 0 |
| B | public-next-pass | 1234 | 41.1333 | 4.8677 | 3 | 330 | 27 | 2 | 0 |
| B | public-no-pass | 846 | 28.2000 | 6.5900 | 5 | 181 | 10 | 1 | 0 |
| B | min-hand-pips | 722 | 24.0667 | 6.4423 | 5 | 76 | 2 | 0 | 0 |

Arm A blocks 195, mean turns 26.718; Arm B blocks 198, mean turns 26.2087.

Matched public-next-pass vs public-no-pass: **+13.6667 pp (A)** and **+12.9333 pp (B)**. Independent previous seed set 2020000..2020999 reported +12.83 and +10.90 pp. Direction replicated. No new history-conditioned rule proven.

**Confidence/limitations:** in-simulator, opponent-mixture-dependent, seat rotations correlated; provisional branch rules, uniform unknown allocation, previous observed passes ignored, block winner unassigned. Not a causal human-play conclusion.

**Cumulative:** 201000 previously persisted + 6000 executed = 207000 executed. GitHub persistence of this run FAILED due connector safety checks. Do NOT credit as GitHub-persisted until checkpoint is uploaded and verified; historical 4000 rounds separate, old 215520 claim unverified.

**Exact next action:** recover GitHub write, upload this checkpoint, then implement previous-pass-conditioned public opponent posterior and compare on independent matched seeds with hand-size/end-number strata.