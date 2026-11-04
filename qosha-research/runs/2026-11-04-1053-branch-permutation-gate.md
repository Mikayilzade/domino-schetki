# Four-side permutation regression gate — 2026-11-04 10:53 (+04, Asia/Baku)

- Engine/rules: `qosha-research-0.5.3`, recovered `qosa-1.0.0`, provisional branch-number unlocking.
- Executed deals: **0**; seeds: none; strategies: none. Historical 4,000-deal baseline remains separate.
- New test: `simulator/branch-permutation-regression.js`. Three constructed states × all 24 permutations of the four side labels = 72 state-permutation checks. For each legal action, compare the relabeled action multiset and apply matched actions on both states; verify branch state, opened numbers, hand and played tiles. Includes ordinary placements, multi-double and mixed-finish opportunities.
- Finding: earlier `side-symmetry-audit.js` covered only a same-end example and a different-end control. It did not exercise all 24 permutations or the unified dispatcher after each matched action. New regression closes this **test-design gap**, but no pass is claimed.
- Confidence/limits: test source persisted, **not executed**; 72 checks are planned, not measured. This is an equivariance test of provisional engine semantics, not proof of physical rules or strategy advantage. Block winner/tie remains unresolved. 0 new win, remainder, minus, block, branch-value or regret metrics.
- Exact next action: run `node qosha-research/simulator/branch-permutation-regression.js` and `node qosha-research/simulator/round-conservation-regression.js` in a Node checkout; record actual outputs/failures before any strategy promotion. Then test seeded matched-deal branch-label equivariance with continuation policies.
- Scope: only `qosha-research/`; no scoreboard/PWA modification.
