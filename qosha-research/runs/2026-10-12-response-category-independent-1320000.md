# Independent exact response-category replication — 2026-10-12T09:48:35 +04:00 Asia/Baku

- Engine/rules: qosa-research-0.5.3 / qosa-1.0.0; 3 players × 9 stones.
- Source branch: `qosha-research-20261012-first-response`; code: `simulator/response-category-holdout.js`; deterministic V8 CommonJS self-test passed (1100677, 1101051, 31 exact allocations). Node CLI not run.
- Deals: 8508 scanned, 35 selected; seeds `1320000..1439999` (first eligible per deal, min-hand-pips discovery). **362 exhaustive hidden allocations**, 4629 evaluated candidate continuations; 0 unresolved; 0 new full strategy rounds.
- Previous validated full-strategy baseline: **180,000 rounds**, historical 4,000 separate; exact hidden allocations must not be added to full rounds.
- Seed formula: `57000000+1000*dealSeed+lexicographicAllocationIndex`; selected seeds: 1320399, 1320448, 1320528, 1321177, 1321253, 1321271, 1322132, 1322205, 1322463, 1322483, 1322524, 1322557, 1322680, 1322852, 1322957, 1323084, 1323121, 1323397, 1323436, 1323675, 1323775, 1324276, 1324702, 1324790, 1325441, 1325515, 1325728, 1326167, 1326277, 1326470, 1326708, 1327320, 1328141, 1328199, 1328507.
- Comparison: connector X-Y single minus unrelated equal-pip single, both retain X-X and another X connector, same visible position and exact hidden worlds; three deterministic policies; equal position weights for unconditional deltas.
- Geometry: number of different post-action branch ends: {"0":0,"1":0,"2":35,"3":0,"4":0}; opening-state differences at 0 positions. Distinct actions can affect different ends, so no independent connector causal effect.

### closed-branch-control
- connector minus unrelated: finish-first -15.13 pp (exploratory 95% position CI -27.60 pp to -2.66 pp), mean remaining pips 1.931, minus-finish -14.84 pp.
- Post-action response categories (descriptive, not causal):
  - connector-forces-pass: worlds=74, positions=24, pooled finish delta=8.11 pp, position-conditional delta=0.73 pp, next-opponent immediate finish delta=-1.35 pp
  - same-action: worlds=124, positions=25, pooled finish delta=-11.29 pp, position-conditional delta=-15.03 pp, next-opponent immediate finish delta=0.00 pp
  - both-pass: worlds=24, positions=16, pooled finish delta=-16.67 pp, position-conditional delta=-25.00 pp, next-opponent immediate finish delta=0.00 pp
  - unrelated-forces-pass: worlds=61, positions=21, pooled finish delta=-45.90 pp, position-conditional delta=-35.24 pp, next-opponent immediate finish delta=3.28 pp
  - different-tile: worlds=73, positions=23, pooled finish delta=-4.11 pp, position-conditional delta=-14.13 pp, next-opponent immediate finish delta=0.00 pp
  - same-tile-different-side: worlds=6, positions=4, pooled finish delta=0.00 pp, position-conditional delta=0.00 pp, next-opponent immediate finish delta=0.00 pp

### min-hand-pips
- connector minus unrelated: finish-first -11.14 pp (exploratory 95% position CI -23.02 pp to 0.73 pp), mean remaining pips 1.857, minus-finish -12.76 pp.
- Post-action response categories (descriptive, not causal):
  - connector-forces-pass: worlds=74, positions=24, pooled finish delta=12.16 pp, position-conditional delta=6.98 pp, next-opponent immediate finish delta=-1.35 pp
  - same-action: worlds=124, positions=25, pooled finish delta=-12.10 pp, position-conditional delta=-15.70 pp, next-opponent immediate finish delta=0.00 pp
  - both-pass: worlds=24, positions=16, pooled finish delta=0.00 pp, position-conditional delta=0.00 pp, next-opponent immediate finish delta=0.00 pp
  - unrelated-forces-pass: worlds=61, positions=21, pooled finish delta=-26.23 pp, position-conditional delta=-23.33 pp, next-opponent immediate finish delta=3.28 pp
  - different-tile: worlds=73, positions=23, pooled finish delta=-2.74 pp, position-conditional delta=-13.04 pp, next-opponent immediate finish delta=0.00 pp
  - same-tile-different-side: worlds=6, positions=4, pooled finish delta=0.00 pp, position-conditional delta=0.00 pp, next-opponent immediate finish delta=0.00 pp

### fast-doubles
- connector minus unrelated: finish-first 1.33 pp (exploratory 95% position CI -1.91 pp to 4.57 pp), mean remaining pips 0.134, minus-finish 0.00 pp.
- Post-action response categories (descriptive, not causal):
  - connector-forces-pass: worlds=74, positions=24, pooled finish delta=8.11 pp, position-conditional delta=4.17 pp, next-opponent immediate finish delta=-1.35 pp
  - same-action: worlds=124, positions=25, pooled finish delta=-0.81 pp, position-conditional delta=-0.33 pp, next-opponent immediate finish delta=0.00 pp
  - both-pass: worlds=24, positions=16, pooled finish delta=8.33 pp, position-conditional delta=12.50 pp, next-opponent immediate finish delta=0.00 pp
  - unrelated-forces-pass: worlds=61, positions=21, pooled finish delta=-4.92 pp, position-conditional delta=-2.86 pp, next-opponent immediate finish delta=3.28 pp
  - different-tile: worlds=73, positions=23, pooled finish delta=1.37 pp, position-conditional delta=0.36 pp, next-opponent immediate finish delta=0.00 pp
  - same-tile-different-side: worlds=6, positions=4, pooled finish delta=0.00 pp, position-conditional delta=0.00 pp, next-opponent immediate finish delta=0.00 pp

## Per-position reproducibility

| Deal seed | Turn | Exact worlds | Different ends | Closed-control finish Δ | Min-pips finish Δ | Fast-doubles finish Δ |
|---:|---:|---:|---:|---:|---:|---:|
| 1320399 | 17 | 10 | 2 | 60.00 pp | 60.00 pp | 50.00 pp |
| 1320448 | 17 | 10 | 2 | 0.00 pp | 0.00 pp | 0.00 pp |
| 1320528 | 14 | 15 | 2 | -6.67 pp | 0.00 pp | 0.00 pp |
| 1321177 | 17 | 10 | 2 | -60.00 pp | -60.00 pp | 0.00 pp |
| 1321253 | 14 | 15 | 2 | -20.00 pp | -20.00 pp | 0.00 pp |
| 1321271 | 15 | 15 | 2 | -20.00 pp | 6.67 pp | 6.67 pp |
| 1322132 | 20 | 4 | 2 | -50.00 pp | -50.00 pp | 0.00 pp |
| 1322205 | 16 | 10 | 2 | 20.00 pp | 20.00 pp | 20.00 pp |
| 1322463 | 17 | 21 | 2 | -9.52 pp | 0.00 pp | 0.00 pp |
| 1322483 | 14 | 15 | 2 | 0.00 pp | 0.00 pp | 0.00 pp |
| 1322524 | 19 | 6 | 2 | 0.00 pp | 0.00 pp | 0.00 pp |
| 1322557 | 21 | 6 | 2 | -100.00 pp | -100.00 pp | 0.00 pp |
| 1322680 | 14 | 15 | 2 | 0.00 pp | 0.00 pp | 0.00 pp |
| 1322852 | 17 | 6 | 2 | 0.00 pp | 0.00 pp | 0.00 pp |
| 1322957 | 17 | 6 | 2 | 0.00 pp | 0.00 pp | 0.00 pp |
| 1323084 | 17 | 10 | 2 | 0.00 pp | 0.00 pp | 0.00 pp |
| 1323121 | 14 | 15 | 2 | 0.00 pp | 0.00 pp | 0.00 pp |
| 1323397 | 14 | 15 | 2 | -46.67 pp | 0.00 pp | 0.00 pp |
| 1323436 | 25 | 3 | 2 | 0.00 pp | 0.00 pp | 0.00 pp |
| 1323675 | 14 | 15 | 2 | 66.67 pp | 66.67 pp | 0.00 pp |
| 1323775 | 17 | 10 | 2 | 0.00 pp | 0.00 pp | 0.00 pp |
| 1324276 | 17 | 10 | 2 | -10.00 pp | -10.00 pp | 0.00 pp |
| 1324702 | 19 | 6 | 2 | 0.00 pp | 0.00 pp | 0.00 pp |
| 1324790 | 14 | 15 | 2 | -26.67 pp | -26.67 pp | -6.67 pp |
| 1325441 | 14 | 15 | 2 | -26.67 pp | -26.67 pp | -6.67 pp |
| 1325515 | 17 | 10 | 2 | -80.00 pp | -30.00 pp | 0.00 pp |
| 1325728 | 17 | 10 | 2 | 10.00 pp | 10.00 pp | 0.00 pp |
| 1326167 | 17 | 10 | 2 | 0.00 pp | 0.00 pp | 0.00 pp |
| 1326277 | 17 | 10 | 2 | -10.00 pp | -10.00 pp | 0.00 pp |
| 1326470 | 18 | 10 | 2 | -20.00 pp | -20.00 pp | 0.00 pp |
| 1326708 | 19 | 6 | 2 | 0.00 pp | 0.00 pp | 0.00 pp |
| 1327320 | 17 | 10 | 2 | 0.00 pp | 0.00 pp | 0.00 pp |
| 1328141 | 21 | 6 | 2 | 0.00 pp | 0.00 pp | 0.00 pp |
| 1328199 | 20 | 6 | 2 | -100.00 pp | -100.00 pp | 0.00 pp |
| 1328507 | 21 | 6 | 2 | -100.00 pp | -100.00 pp | -16.67 pp |

## Finding and limitations

On this independent seed set, playing the unrelated equal-pip tile again outperformed spending the X connector under closed-branch continuation. The next-opponent forced-pass direction is associated with large outcome differences, but the category is determined after the focal move; **this is not a causal isolation of passes**. Exact enumeration removes hidden-allocation Monte Carlo noise *within each selected visible state*, not first-eligible selection bias, geometry confounding, or uncertainty about branch rules. Uniform hidden allocations do not condition on observed prior opponents' decisions. Block winner is unassigned. Intervals are exploratory and position-clustered, not confirmatory.

## Exact next hypothesis/action

Implement an executable **same-side or post-action four-end-matched** action-pair search with an explicit feasibility count. If no matches are possible for distinct equal-pip tiles under these rules, document the impossibility and switch to a within-geometry opponent-pass risk predictor, evaluated on fresh seeds with an out-of-sample calibration test. Do not label pass-category conditional deltas causal.
