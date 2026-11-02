# Matched-seed branch-label tie-break ablation — 2026-11-03T02:52:25+04:00 (Asia/Baku)

## Scope

This run compares the existing deterministic stable-key tie-break with a symmetric action-orbit selector on the same 3×9 deals. The primary strategy ranking is unchanged. For non-random strategies, the orbit arm chooses a best-ranked branch-feature orbit uniformly, then an action within that orbit uniformly. The `random-legal` control uses the exact same seeded action in both arms so it does not add a separate random-stream treatment.

- Engine/rules: qosha-research-0.5.3; recovered qosa-1.0.0; 3 players × 9 stones + one stock tile.
- Seeds: 3,404,400–3,404,519; 120 draws, 120 unique allocations, 0 duplicates.
- Seat rotations: 3; 360 paired full-round comparisons per mix; 720 paired rounds total.
- Max turns: 200; all 720 rounds resolved.
- Node: v22.16.0. Exact GitHub blob hashes verified for the engine, initializer, turn kernel, dispatcher, round driver, and strategy runner. This was an isolated local harness, not a clean git clone.

## Branch-label metamorphic audit

The first 40 seeds are a subset of the same full-round seed set.

- 927 sampled positions; all 24 branch-label permutations.
- 22,248 permutation checks; 19,368 playable comparisons.
- Option-state mismatches: 0; legal-action-set mismatches: 0.
- Distributional checks: 19,368 per policy across five policies (96,840 total); mismatches: 0.

This supports internal distributional equivariance for the tested model states; it does not authenticate physical table rules.

## Matched full-round results

| Mix | Baseline finishes / blocks | Action-orbit finishes / blocks | Outcome kind changed | Winner changed when both finished |
|---|---:|---:|---:|---:|
| random-legal / min-hand-pips / closed-branch-control | 343 / 17 | 350 / 10 | 19/360 (5.28%) | 72/337 (21.36%) |
| fast-doubles / moderate-double-hold / closed-branch-control | 344 / 16 | 351 / 9 | 19/360 (5.28%) | 80/338 (23.67%) |

For each mix, 6 baseline finishes became orbit-arm blocks and 13 baseline blocks became orbit-arm finishes. Minus changed in 27/337 both-finish pairs (8.01%) for mix 1 and 39/338 (11.54%) for mix 2. Mean round-length changes were −0.128 and −0.008 turns respectively; mean final-pip change per seat was +0.002 and −0.217.

Strategy finish counts also moved within these matched cohorts: in mix 1, random-legal 109→101, min-hand-pips 100→106, closed-branch-control 134→143; in mix 2, fast-doubles 70→71, moderate-double-hold 129→127, closed-branch-control 145→153. These are consequences of tie-break-sensitive trajectories, not an independent strategy tournament.

## Finding and limitations

**Useful finding:** the action-set/transition model passes the branch-label permutation audit, but deterministic tie-break choice can still change the full-round outcome: 5.28% of paired round kinds changed in both mixes, and the finish winner changed in roughly 21–24% of pairs where both arms finished. This is representation sensitivity, not proof of a tactical advantage. No strategy was promoted.

The 360 comparisons per mix reuse 120 deals across three seat rotations; they are clustered, so no naive independent-round confidence interval is reported. Physical branch lock/open semantics, block winner/tie allocation, and `loneZero=10` remain unresolved. No new hidden-world Monte Carlo or 5-player cohort was added.

## Separate cohort scale

Prior cohorts remain separate: 88,886 deal allocations, 1,074 selected multi-action positions, 5,863 state-world assignments, and the prior 5,000-round invariant smoke. This run adds 120 unique matched-seed allocations and 720 paired round comparisons. No global deduplication or pooling with historical baselines.

## Exact next action

Extend the ablation to 1,000 unique seed allocations and compute deal-clustered paired uncertainty. Keep the common seeded `random-legal` selector and continue labeling outcome shifts as tie-break sensitivity, not strategy superiority.

Reproducer: [branch-label-symmetric-tiebreak.js](../simulator/branch-label-symmetric-tiebreak.js). Machine-readable record: [JSON](./2026-11-03-0252-branch-label-action-orbit-matched-seed-ablation.json).
