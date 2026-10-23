# Bootstrap correction — 2026-10-23 07:46 Asia/Baku

The 07:46 JSON report's `ci95PositionBootstrap` fields are INVALID because the bootstrap used `LCG % n`; power-of-two sample sizes yield degenerate intervals. **Use the corrected intervals below**, computed with `floor((LCG / 2^32) * n)`, 3000 deterministic resamples. Point estimates, raw rows, sample counts and run data in the JSON remain valid.

| Cohort | Opponents | Group | n | Δ finish-first (pp) | Corrected 95% CI (pp) |
|---|---|---|---:|---:|---|
| new | min-pips | all | 50 | -5.31 | [-14.30, 3.45] |
| new | min-pips | single→double | 19 | -13.53 | [-27.92, 0.33] |
| new | min-pips | other | 31 | -0.28 | [-11.90, 11.01] |
| new | branch-control | all | 50 | -10.38 | [-16.83, -3.89] |
| new | branch-control | single→double | 15 | -20.78 | [-27.71, -13.33] |
| new | branch-control | other | 35 | -5.92 | [-14.67, 2.28] |
| pooled previous + new | min-pips | all | 100 | -2.96 | [-8.95, 2.90] |
| pooled previous + new | min-pips | single→double | 32 | -12.96 | [-25.93, -0.76] |
| pooled previous + new | min-pips | other | 68 | 1.75 | [-4.64, 8.38] |
| pooled previous + new | branch-control | all | 100 | -3.53 | [-8.34, 1.40] |
| pooled previous + new | branch-control | single→double | 20 | -19.22 | [-28.75, -9.73] |
| pooled previous + new | branch-control | other | 80 | 0.39 | [-4.48, 5.66] |

Intervals are exploratory, unadjusted for multiple comparisons, and resample positions rather than worlds. Selected changed-choice states, provisional branch semantics, deterministic opponent bots, no block winner. The single→double result is a provisional warning about this particular policy switch, not a universal instruction to hold doubles.

Cumulative persisted: 290,100 complete continuations + 229,888 paired continuations; historical 4,000 separate. Next: independent seeds 1310390..1311289, preregister the single→double switch and test equal-pip controls.
