# Controlled-double checkpoint — 2026-10-04 17:47 (+04)

- Engine: qosa-research-0.5.3
- New completed strategy rounds: 0
- Persisted cumulative strategy rounds: 180,000 (historical 4,000 separate)
- Added: simulator/specific-double-control.js
- Planned fresh seeds: 30000..39999, three seat rotations.
- Strategies: min-hand-pips, moderate-double-hold, closed-branch-control.
- Design: stratify each appearance by total starting-double count and starter status (ownership of 1-1), then compare ownership/non-ownership of each double 0-0 through 6-6 within those strata.
- Metrics: finish rate and mean final pips; block winner remains unassigned.
- Finding: no strategic finding claimed yet. This checkpoint restores the controlled experiment without reconstructing the lost chat-only run.
- Limitation: within-stratum ownership is still observational and may retain hand-composition confounding; matched tile-swap experiments will be stronger causally.
- Next: execute seeds 30000..39999 and persist JSON; summarize only adequately populated strata; then build clone-safe paired decision-regret rollouts.
