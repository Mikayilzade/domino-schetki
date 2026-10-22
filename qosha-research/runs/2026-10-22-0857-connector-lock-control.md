# 2026-10-22 08:57 (+04) — same-side connector control

Engine/rules: qosa-research-0.5.3 / qosa-1.0.0; primary 3x9; no gameplay rule change.

Fresh deterministic seeds 1315640..1316839. Discovery scanned 418 min-hand-pips seeds and 236 closed-branch-control seeds; 48 selected positions (12 per 3-3/5-5 x discovery profile), 2747 distinct pass-constrained hidden allocations, 12 exact-support positions, 16482 forced counterfactual continuations, 0 unresolved.

For each fixed visible position, force X-X opening, X-Y connector single, or U-Y nonconnector single on the same side; both singles defer X-X. Cross two continuation bots over identical hidden allocations.

Connector-minus-nonconnector first-place: +2.36 pp (min-pips continuation, exploratory seed-cluster 3-SE interval -4.16..8.87), +2.42 pp (branch-control, -5.90..10.74). Neither confirms a win advantage. Immediate next-opponent pass: +18.25 pp for connector versus nonconnector. Mean final remainder difference: -0.68 / -0.24 pips.

Connector-minus-immediate-X-X-opening first-place: +15.11 / +18.27 pp; nonconnector-minus-opening: +12.75 / +15.85 pp. These are selected-position contrasts, not full-deal win-rate gains.

Same-side X-Y vs U-Y cannot be equal-pip unless U=X (then both are connectors). Different discarded pips and resulting endpoints confound connector retention. Therefore do not claim a pure causal pair-retention effect.

Validation: V8 CommonJS deterministic replay passed, 28-tile integrity, pass constraints, unique-world counts and immutable source state checked. Node CLI not run. Assumptions: provisional branch semantics, no block winner, uniform pass-constrained hidden allocations without opponent action likelihood, fixed bots, selected first-eligible positions.

Cumulative: 389700 validated full continuations unchanged; 181016 separate counterfactual continuations (previous 164534 + 16482), historical/quarantined excluded.

Reproduce: node qosha-research/simulator/connector-lock-control.js test ; node qosha-research/simulator/connector-lock-control.js 1315640 1200 12 64 . Raw rows: runs/2026-10-22-0857-connector-lock-control.json.

Exact next hypothesis/action: stratify by pip gap and resulting end opened/closed; compare next-opponent legal moves and finish-first on fresh seeds >=1316840, target >=30 positions per stratum and 128 distinct worlds, run Node CLI regression.
