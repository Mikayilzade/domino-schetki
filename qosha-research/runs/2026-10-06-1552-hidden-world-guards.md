# Hidden-world guard checkpoint — 2026-10-06 15:52 (+04)

- engine/rules: current qosa-research stack; primary 3×9 recovered qosa-1.0.0 rules
- deals: 0 new strategy deals; cumulative validated scale remains **180,000 matched-seat rounds**
- seed set: sampler regression worlds 700..724 (25 deterministic worlds), source-level test persisted but not runtime-executed in this connector environment
- strategies: paired continuation uses `closed-branch-control` by default
- change: extended `simulator/hidden-world-test.js` with executable fail-fast assertions for focal/current-player mismatch and focal-hand mismatch
- additional invariant: legal candidate keys derived from a sampled world must equal those from the fixed visible focal position, not merely remain equal to each other across sampled worlds
- key metric target: every candidate n=25; known+hidden tile set exactly 28 unique tiles; visible source state unchanged
- finding: no new gameplay-strength conclusion; this closes an input-integrity hole before empirical regret is trusted
- confidence: high for persisted source/test logic; runtime execution still required
- limitation: no Node execution against repository checkout in this connector runtime
- next: execute hidden-world regression, persist first 25-world numeric paired-regret JSON, then scale worlds/positions; separately reproduce quarantined corrected 30000..39999 controlled-double run
