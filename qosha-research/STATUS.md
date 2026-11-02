# Qoşa açdı research — current status

Last checkpoint: 2026-11-03T01:46:01+04:00 Asia/Baku.

- Branch-label transition audit: seeds 3,404,360–3,404,399; 40 unique allocations, 0 duplicate pairs; 891 reachable sampled positions and all 24 branch-label permutations.
- Metamorphic checks: 21,384 action-set/permutation checks, 61,800 mapped legal-action transitions, and 2,760 pass transitions. No action-set, transition, or pass mismatch.
- Policy tie-break sensitivity: 14.08%–17.76% mapped-choice mismatch rates across five deterministic policies. This is representation sensitivity, not strategy superiority.
- Branch transition regression tests passed: direct replay test (4 deals; 1,152 permutation checks) and stratified replay test (8 seeds; 50 selected states; 1,200 action-set checks; 3,960 transitions; draw/play/pass fixtures passed).
- Full-round invariant smoke: seeds 7,105,000–7,109,999; 5,000 seed draws, 5,000 unique full allocations, 0 duplicates; 956,148 assertions passed.
- Smoke outcomes under deterministic random-legal policy: 4,740 finishes, 260 blocks, 0 unresolved; mean 23.7572 turns, median 24, max 34. Finish-minus: 0=4,552; −10=184; −20=4; −30/−40=0. Descriptive only, not strategy evidence.
- No strategy comparison rounds or new hidden-world allocations; no strategy promoted.
- Prior separate cohorts remain 88,886 deal allocations, 1,074 selected multi-action positions, 5,863 state-world assignments. Added separate 40-deal branch audit and 5,000-round smoke cohorts; no global dedup and no pooling with historical baselines.
- Physical branch lock/open, block winner/tie, and loneZero=10 remain unresolved. Exact GitHub source was executed in an isolated V8 harness with a compatible assertion shim; clean Node checkout remains DNS-blocked.
- Exact next action: matched-seed full-round tie-break ablation, holding deals/seat rotations/primary policy score fixed; compare canonical branch-label tie-break against seeded symmetric/action-orbit selection and report paired outcome sensitivity, not strategy superiority.

Report: qosha-research/runs/2026-11-03-0146-branch-label-equivariance-and-5k-smoke.md
Data: qosha-research/runs/2026-11-03-0146-branch-label-equivariance-and-5k-smoke.json
Reproducers: qosha-research/simulator/branch-label-transition-equivariance.js, qosha-research/simulator/branch-label-stratified-transition-audit.js, qosha-research/simulator/full-round-invariant-smoke.js
