# Late next-opponent hand-size strata + deduplicated unlock-delay audit — 2026-11-01 23:54:24 +04 (Asia/Baku)

## Reproducible cohort

- Engine: `qosha-research-0.5.3`; recovered `qosa-1.0.0`, 3×9 + stock. Global number-unlock semantics remain **PROVISIONAL**.
- Reserved seed span: `3416220–3418619`. Actual disjoint profile windows:
  - `min-hand-pips`: `3416220–3416423` (204 deals scanned)
  - `closed-branch-control`: `3417420–3417688` (269 deals scanned)
- Complete deal audit: 473 deal draws, 473 unique seat/stock allocations, 0 duplicates; 473 28-tile checks and 473 3×9+1 checks passed.
- Discovery trajectories: 1337 (1300 finishes / 37 blocks / 0 unresolved); not a strategy tournament.
- Selected positions: 72, exactly 12 per next-opponent hand-size stratum (1, 2, 3–4) for each continuation profile.

## Hidden-world accounting

- 1728 draws; 629 unique allocations within visible states; 1099 repeats (63.6%).
- Mean unique worlds/position: 8.74 (range 1–23); mean draw ESS 7.58/24; 1258 paired continuations after dedup.
- Duplicate seed pairs are preserved in raw JSON. Uniqueness is within each visible state, not global across states.

## Matched one-turn unlock-delay mechanism

Immediate arm plays the same legal single double and unlocks its number. Delayed arm artificially keeps the number locked for the next opponent turn, then unlocks it. **The delayed arm is not a legal move**; this is mechanism sensitivity, not a tactic recommendation. Values are immediate minus delayed; approximate 95% half-widths are clustered by selected position (12 positions/cell).

| Continuation profile | Next hand | Unique worlds | Next-opponent finish Δ | Focal finish-first Δ | Next-pass Δ | Playable tiles Δ |
|---|---:|---:|---:|---:|---:|---:|
| min-hand-pips | 1 | 30 | 31.25 ± 17.66 pp | 0.00 ± 0.00 pp | -0.31 | 0.31 |
| min-hand-pips | 2 | 70 | 0.00 ± 0.00 pp | -1.39 ± 2.72 pp | -0.38 | 0.87 |
| min-hand-pips | 3-4 | 210 | 0.00 ± 0.00 pp | -1.31 ± 4.48 pp | -0.04 | 1.11 |
| closed-branch-control | 1 | 31 | 36.11 ± 15.49 pp | -4.17 ± 8.17 pp | -0.36 | 0.36 |
| closed-branch-control | 2 | 87 | 13.33 ± 18.27 pp | -0.83 ± 1.63 pp | -0.31 | 0.78 |
| closed-branch-control | 3-4 | 201 | 0.00 ± 0.00 pp | -3.58 ± 9.49 pp | -0.18 | 1.24 |

### Finding and confidence

The strongest mechanistic signal is the **one-stone next-opponent stratum**: immediate unlock increased modeled next-opponent immediate-finish chance by 31.25 ± 17.66 pp under min-hand-pips and 36.11 ± 15.49 pp under closed-branch-control. Direction agrees across these two simple policies. However, only 12 position clusters/cell were sampled, and hidden support is small in the one-stone stratum (mean 2.50 / 2.58 unique worlds per position).

No reliable focal finish-first change was detected: all focal finish-first intervals include zero. No strategy is promoted. This is provisional to global number-unlock semantics, pass-only posterior conditioning, and synthetic opponent policies; it does not authenticate physical branch rules.

## Regression

The new runner's deterministic replay/dedup/allocation test passed (8 assertions).

## Cumulative scale

- This cohort: 473 unique complete deal allocations / 1337 discovery trajectories; 72 selected positions / 629 within-state unique hidden allocations / 1258 paired continuations.
- Previous unlock-delay diagnostic remains separate: 80 positions / 1,878 within-state unique allocations. Across both cohorts: 152 positions and 2,507 within-state unique allocation records (not globally deduplicated).
- Branch-label metamorphic cohorts remain 1,500 deals / 60,274 reachable positions; validation/opening/tie-break allocations 7,550; property audit 52,315 positions; strategy tournament 1,500 deals / 18,000 arm-rounds (+120-deal pilot). No strategy arms added.

## Exact next action

On fresh seeds starting at **3418620**, compare the opening double with actual legal alternative actions under identical hidden worlds, stratified by next-opponent hand size 1–4. Keep candidate sets matched and hidden worlds deduplicated per visible state. Continue seeking an authentic table trace or ruling for global/local branch unlock and block winner/tie scoring.

Raw data: [JSON](./2026-11-01-2346-late-hand-strata-unlock-delay-dedup.json); runner: [branch-late-hand-strata-dedup.js](../simulator/branch-late-hand-strata-dedup.js).
