# Qoşa açdı research — current status

Last checkpoint: 2026-11-03T04:49:39+04:00 Asia/Baku.

- Latest matched tie-break ablation: seeds 3,405,520–3,406,519; 1,000 unique allocations, 0 duplicate pairs; three seat rotations; 6,000 paired rounds, all resolved.
- Per-deal cluster data is retained in the run JSON (2,000 rows, 1,000 per mix). Cluster rate/mean uncertainty is recomputable from saved numerators, denominators, and deal-level deltas.
- Branch-label audit (100-deal subset): 2,289 sampled positions, 54,936 permutation checks, 47,472 playable comparisons, 237,360 distributional checks; no option, legal-action-set, or distribution mismatch.
- Outcome kind changed in 5.13% / 6.03% of matched pairs across the two mixes; finish winner changed in 19.49% / 20.32% of both-finish pairs. Mean turn and final-pip intervals span zero. This is tie-break sensitivity, not strategic superiority.
- Runner deterministic replay and cluster recomputation passed; cluster-statistics fixture passed 17 assertions in the isolated V8 harness. No clean Node checkout; GitHub DNS resolution failed in the container.
- Matched tie-break cohorts across three distinct seed ranges: 2,120 seed draws / 12,720 paired rounds. Other separate cohorts remain 88,886 deal allocations, 1,074 selected multi-action positions, 5,863 state-world assignments, and 5,000 invariant-smoke rounds. No cross-cohort global deduplication or historical-baseline pooling.
- No strategy promoted. Physical branch lock/open, block winner/tie allocation, and loneZero=10 remain unresolved.
- Exact next action: audit block winner/tie allocation under explicitly labelled candidate rules across seat permutations; treat outcomes as model sensitivity until physical rules are authenticated.

Report: qosha-research/runs/2026-11-03-0449-branch-label-tiebreak-clustered-1000.md
Data: qosha-research/runs/2026-11-03-0449-branch-label-tiebreak-clustered-1000.json
Reproducers: qosha-research/simulator/branch-label-symmetric-tiebreak.js, qosha-research/simulator/cluster-statistics.js, qosha-research/simulator/cluster-statistics-test.js
