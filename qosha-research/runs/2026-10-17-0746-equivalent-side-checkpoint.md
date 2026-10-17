# Equivalent-side-only matched holdout — 2026-10-17T07:49:20+04:00

- Engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0`; 3 players × 9 stones; no gameplay-rule changes.
- Code: `simulator/equivalent-side-holdout.js`; keeps the **legacy chosen tile and action type** and changes **only** the physical side for same-tile/same-from/same-to ordinary placements; picks first `engine.SIDES` entry. Compared to untouched legacy and fully side-free tie-breaking.
- Validation: executable V8 CommonJS `test()` passed: 6594 decisions across 850000..850099, 1666 eligible side ties, 1505 equivalent-side overrides; no distinct-tile/action mutation, no unresolved. Node CLI not run.
- Replayed matched seeds `810000..810999`: 1000 deals × 3 rotations = 3000 complete rounds per mode, **not newly credited**. Legacy / equivalent-side-only / fully-side-free blocks: 115 / 123 / 21. Paired outcome changes legacy→equivalent-side-only 927/3000; block-status changes 194.
- Independent fresh seeds `816000..817999`: 2000 deals × 3 rotations = **6000 new complete rounds credited only for equivalent-side-only**; the other two modes are matched counterfactual replays, not added to cumulative scale. All modes zero unresolved.
- Fresh blocks legacy / equivalent-side-only / fully-side-free: 246 / 245 / 58; mean turns 25.269 / 25.276 / 25.166.
- Fresh first-finish rates legacy: closed-branch-control 45.87%; min-hand-pips 30.28%; fast-doubles 19.75%.
- Fresh first-finish rates equivalent-side-only: closed-branch-control 46.88%; min-hand-pips 29.57%; fast-doubles 19.47%.
- Fresh first-finish rates fully-side-free: closed-branch-control 48.37%; min-hand-pips 30.67%; fast-doubles 20.00%.
- Fresh paired outcome changes legacy→equivalent-side-only 1958/6000; equivalent-side-only→fully-side-free 1873/6000; legacy→equivalent-side-only block-status changes 403.
- Fresh equivalent-side-only side overrides: 30053 among 33275 eligible same-tile side choices.
- Finding: this **isolates the chosen-tile confound** in the tie-break intervention, but does not isolate all future side-label artifacts: downstream legacy distinct-tile ranking can still depend on side names. Differences are policy implementation sensitivity, not a real-game rule.
- Confidence/limits: high for deterministic matched-seed model comparison; provisional locked/open branch semantics, deterministic bots, no block winner, 5-player/loneZero excluded, no claim for human play. Side-only tie-break changes branch identity and may propagate through future policy decisions.
- Cumulative complete rounds: prior verified **204,000** + fresh equivalent-side-only **6000** = **210000**; historical 4,000 excluded; old runs never double-counted.
- Reproduce: `node qosha-research/simulator/equivalent-side-holdout.js test`; `node qosha-research/simulator/equivalent-side-holdout.js run 810000 1000`; `node qosha-research/simulator/equivalent-side-holdout.js run 816000 2000`.
- Exact next hypothesis/action: compare against a branch-multiset canonical tie-break that is invariant under renaming sides, while preserving **distinct tile/action rankings**, on a disjoint seed set; quantify whether block-rate shift survives. Revalidate with Node CLI when executable checkout available.
- Full output: `runs/2026-10-17-0746-equivalent-side-holdout.json`.
