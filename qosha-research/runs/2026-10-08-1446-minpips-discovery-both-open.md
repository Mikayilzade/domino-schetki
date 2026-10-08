# Independent both-open same-side connector holdout — 2026-10-08 14:46 Asia/Baku

Engine: `qosa-research-0.5.3`; recovered rules: `qosa-1.0.0`; mode 3×9. No gameplay-rule changes.

## Reproducibility
Scan consecutive deal seeds 34000..36966 (2,967 deals); initialize each as later round with `previousWinnerIndex=seed%3`. Advance with `round-driver.stepRound` and `strategy-runner.chooseBy('min-hand-pips',opts,{seed,turns:state.turns,player:state.currentPlayer})` until first eligible state from `same-side-holdout.eligible` or finish. Keep only `bothOpen` states, stop after 60. This is an independent discovery policy from prior `closed-branch-control` holdout.

For each selected position, use `same-side-holdout.analyze(position,25,policy)` for `closed-branch-control`, `min-hand-pips`, `fast-doubles`. Preserve visible focal hand, table, known tiles and hand sizes; resample only hidden opponents/stock. Hidden world seeds `4100000 + 1000*dealSeed + worldIndex`, worldIndex 0..24. Compare legal singles from the *same side/from X* with both destination numbers already opened. Metric = **keep HIGH minus keep LOW** = forced spend LOW minus spend HIGH; per-position mean across worlds, then equal-weight position mean. All continuations resolved.

## Measured sample
- 60 reachable positions; 1,500 sampled hidden worlds; 4,500 policy-world evaluations; 30,300 forced candidate continuations; 0 new full strategy rounds.
- Finish-first difference (percentage points; position-normal exploratory 95% CI):
  - closed-branch-control: **+1.87** [−2.80, +6.53].
  - min-hand-pips: **+3.33** [−1.15, +7.81].
  - fast-doubles: **+2.00** [−1.13, +5.13].
- Mean remaining-pips difference (keep HIGH minus keep LOW):
  - closed-branch-control: **+1.02** [+0.23, +1.81].
  - min-hand-pips: **+0.64** [+0.08, +1.21].
  - fast-doubles: **+0.69** [+0.24, +1.14].
- Opponent minimum hand size <=3: only **8 positions**; finish differences −7.00, −4.00, −4.00 pp for the respective policies; all wide CIs cross zero.
- Opponent minimum hand size >=4: **52 positions**; finish differences +3.23, +4.46, +2.92 pp respectively; all approximate CIs include zero.

## Finding and limitations
Independent min-pips discovery does **not** establish a reliable finish-first advantage for keeping the higher connector. Keeping it consistently increases expected remaining pips in this model. The apparent opponent-hand-size reversal is exploratory and underpowered (8 versus 52 positions), not a playing rule.

The `same-side-holdout.selfTest()` and a dedicated three-fixture both-open/min-pips discovery + two-world immutability check passed in a V8 CommonJS harness (not Node CLI). No new JS runner was persisted because the attempted multi-file GitHub write was blocked. Existing source modules suffice to reproduce with the selection algorithm above.

Limitations: assumed locked/open branch semantics, first-eligible selection, simple bots, block winner unassigned, no multiple-comparison correction, hand-size groups observational.

## Scale and next
Previously verified 180,000 complete strategy rounds + 19,810 hidden worlds. With this run: **180,000 full strategy rounds + 21,310 sampled hidden worlds** (historical 4,000 rounds separate). Next: persist a standalone min-pips discovery runner; run an independent pre-registered 50+ position matched-hand-size holdout, with special focus on opponents down to <=3 stones and decision regret. Do not promote a universal rule.
