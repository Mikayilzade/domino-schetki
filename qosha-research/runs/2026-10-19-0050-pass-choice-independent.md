# Independent pass-conditioned choice holdout — 2026-10-19 00:50 Asia/Baku

- Engine/rules: qosa-research-0.5.3 / qosa-1.0.0, 3×9 later-round.
- New full rounds: 0; 35,218 independent deals scanned, 16 positions selected; 642 exact hidden allocations, 381 pass-compatible, 2,568 matched forced continuations.
- Choices changed: 4/16 (closed-branch-control) and 5/16 (moderate-double-hold); **0 realized extra first finishes**, 0 realized pip or minus change for both policies.
- Effective pass restrictions in 10/16 positions. All 16 had same/near end-number overlap; lower-overlap stratum empty.
- Seed set: 1481803, 1482278, 1484164, 1486256, 1489856, 1494248, 1497586, 1501396, 1502352, 1503079, 1504699, 1505363, 1507863, 1508955, 1514761, 1515217.
- Selection, assumptions, metrics and exact seed range: linked JSON. Validation: deterministic V8 CommonJS fixture passed (seed 1481803, 35 assignments, 15 pass-compatible); Node CLI not run.
- **No reliable new win rule.** Earlier pass-prediction improvement is not the same as winning more.
- Cumulative full rounds: 215,520 previously reported but unaudited this run; STATUS.md independently documents 180,000. New full rounds 0.
- Limitation: standalone runner source was not persisted in this run; existing modules and the exact seed set define the reproduction path, but complete reproduction still needs a checked-in orchestrator.
- Next: persist and execute standalone runner; expand fresh holdout with open-number-identity strata and next-hand-size controls.
