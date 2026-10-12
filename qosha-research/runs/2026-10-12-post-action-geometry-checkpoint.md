# Post-action geometry + return access — 2026-10-12T04:58:20 +04:00 (Asia/Baku)

- Engine: qosa-research-0.5.3; rules qosa-1.0.0; 3×9. Code: `simulator/post-action-geometry-runner.js`.
- Deterministic command: `node qosha-research/simulator/post-action-geometry-runner.js 900000 1000000 200 25 20` (test: same path with `test`). V8 CommonJS replay self-test passed: 4 positions; Node CLI not executed.
- Scanned 46041 deals, 200 eligible first positions; selected 50 (25 X=0; 25 X>0), 1000 sampled hidden allocations and 12120 candidate continuations; unresolved 0. Seed formula `42000000+1000*dealSeed+worldIndex`.
- Comparison: connector X-Y minus unrelated same-pip single, both retain X-X; policies closed-branch-control, min-hand-pips, fast-doubles; fixed visible hand/table and identical worlds.
- All positions, finish-first delta (connector minus unrelated): closed-branch -25.9 pp; min-hand -26.1 pp; fast-doubles 0.1 pp. Mean remainder deltas: 2.656 / 2.614 / 0.032 pips.
- Own immediately playable distinct tiles after connector minus unrelated: 11 negative, 24 zero, 15 positive. For unchanged own-playability subgroup (n=24), closed-branch finish delta -22.08 pp; min-hand -25.21 pp. These post-action subgroups are descriptive and **not causal controls**.
- All selected positions changed 4-end vector in 0 one-side, 50 two-side cases; no exact geometry equality should be presumed. Return-access delta (connector minus unrelated): closed-branch -66.7 pp; min-hand -66.7 pp; fast-doubles -66.7 pp.
- Finding: immediate focal mobility alone cannot be assumed to explain the observed finish gap; subgroup direction is recorded separately. No new causal rule claimed; all CIs exploratory and positions not independently randomized.
- Confidence/limitations: reproducible within assumed branch semantics and deterministic policies; only 50 selected positions, first-eligible/quota bias, post-action mediator conditioning, hidden allocations ignore prior opponent decisions, block winner unassigned. Full-round strategy samples added: **0**; verified cumulative **180,000**; historical 4,000 separate.
- Next: independent-seed replication of own-playability strata, then record first actual opponent response and match complete post-action four-end vectors where possible.
- Raw reproducible position/world summary: `runs/2026-10-12-post-action-geometry.json`.
