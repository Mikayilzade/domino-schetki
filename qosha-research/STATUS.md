# Latest checkpoint — matched legal branch-opening double vs ordinary single (2026-11-02 01:00 +04 Asia/Baku)

- Engine qosha-research-0.5.3; recovered qosa-1.0.0, 3×9 + stock. Global number-unlock/branch geometry remains PROVISIONAL.
- Reserved seeds 3418620–3421019. Actual disjoint scans: min-hand-pips 3418620–3419476 (857 deals); closed-branch-control 3419820–3420932 (1,113 deals). 1,970 unique complete allocations, 0 deal duplicates; 1,902 finishes / 68 blocks / 0 unresolved.
- 96 matched positions: 12 per exact next-opponent hand-size stratum 1, 2, 3, 4 under each profile. Both actions are legal: one branch-opening double vs ordinary single, selected at minimum pip gap; only 6/96 pairs are exactly equal-pip.
- Hidden worlds: 4,608 draws; 1,214 unique assignments within visible states; 3,394 repeats; mean ESS 10.64/48. 2,428 paired continuations after dedup.
- Provisional signal: for a one-stone next opponent, opening-double vs single increased modeled immediate opponent finish chance by 47.92 ± 18.87 pp (min-hand-pips) and 30.56 ± 19.78 pp (closed-branch-control). Profile-wide focal finish-first deltas were −14.32 ± 7.35 pp and −22.91 ± 9.96 pp. These are exploratory position-cluster intervals, confounded by tile/hand changes and pip gaps; no strategy is promoted.
- Regression: 6 assertions passed; deterministic replay, deal/world dedup accounting, tile conservation, and candidate legality checked.
- Exact next: fresh seeds 3421020 onward; enlarge equal-pip candidates and repeat on an independent holdout. Continue seeking authentic branch-opening and block-scoring evidence.
- Report: [2026-11-02-0100-branch-legal-choice-strata-dedup.md](runs/2026-11-02-0100-branch-legal-choice-strata-dedup.md); raw JSON and runner linked there.
