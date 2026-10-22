# 2026-10-22 08:50 (+04) — connector-control identifiability checkpoint

- Engine/rules: qosa-research-0.5.3 / qosa-1.0.0; primary 3x9, no rule change.
- Deterministic exploratory scan: seeds 1315440..1315639 (200 unique deals), 3 focal seats per seed, both min-hand-pips and closed-branch-control policies, 1200 complete discovery trajectories; zero unresolved.
- Condition: focal has an optional high double X-X (X=3..6), at least one opponent passed without stock, and legal X-Y connector versus U-Y nonconnector single alternatives.
- Counts: 20 eligible first positions for min-hand-pips and 61 for closed-branch-control. Same-side controls: 20 and 56, respectively. Same-side equal-pip controls: 0 for both. Counts are descriptive, not first-place results.
- Mathematical finding: for a side ending in Y, X-Y and U-Y have different pip totals whenever U!=X. Thus same-side connector versus nonconnector singles cannot be matched on discarded pip sum. This is structural, not a failure to sample enough deals. Different resulting endpoints also confound a pure connector-retention effect.
- Validation: deterministic V8 CommonJS execution of current GitHub engine, turn-kernel, turn-dispatcher, round-driver, initializer and strategy-runner; Node CLI not run.
- New paired hidden worlds: 0. New full baseline rounds: 0. Prior cumulative scale unchanged: 389700 complete continuations + 164534 separate paired continuations. Historical/quarantined excluded.
- Confidence: arithmetic impossibility is exact; exploratory eligibility frequencies are policy/seed dependent. Provisional branch semantics and no block winner remain limitations.
- Exact next hypothesis/action: compare same-side X-Y versus U-Y alternatives in fixed-visible, pass-constrained hidden worlds, crossing both continuation bots; quantify immediate opponent legal-action count, win chance, remainder and minus finish, and stratify by pip gap and resulting branch endpoint. Fresh seeds 1315640 onward, target >=30 positions per stratum and 128 unique worlds, run Node CLI regression.
