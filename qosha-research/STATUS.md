# Latest checkpoint — late next-opponent hand-size strata + deduplicated unlock-delay (2026-11-01 23:46 +04 Asia/Baku)

- New disjoint profile windows from seed 3416220; 473 complete deal allocations scanned, 473 unique seat/stock assignments, 0 duplicates. Tile-conservation and 3×9+1 checks passed.
- 1337 discovery trajectories: 1300 finishes / 37 blocks / 0 unresolved.
- 72 late positions: 12 each for next-opponent hand sizes 1, 2, 3–4 under min-hand-pips and closed-branch-control.
- Hidden worlds: 1728 draws, 629 unique within visible states, 1099 repeats; mean unique 8.74/position, mean draw ESS 7.58/24. 1258 paired continuations after dedup.
- One-stone opponent: immediate unlock increased modeled next-opponent finish chance by 31.25 ± 17.66 pp and 36.11 ± 15.49 pp under two simple continuation policies. Mechanism signal only; delayed arm is nonlegal, focal finish-first intervals include zero, no strategy promotion.
- Runner test: 8 deterministic replay/dedup/allocation assertions passed. Global number-unlock and physical branch/block rules remain provisional.
- Cumulative unlock-delay cohorts: 152 positions / 2,507 within-state unique allocation records (not globally deduplicated). Strategy tournament unchanged: 1,500 deals / 18,000 arm-rounds (+120-deal pilot).
- Exact next: from seed 3418620, compare the double against actual legal alternative actions under common hidden worlds, stratified by next-opponent hand size; seek authentic branch/block rule trace.

See [run report](runs/2026-11-01-2346-late-hand-strata-unlock-delay-dedup.md), [raw JSON](runs/2026-11-01-2346-late-hand-strata-unlock-delay-dedup.json), and [runner](simulator/branch-late-hand-strata-dedup.js).
