# Branch-label symmetric action-orbit tie-break audit

- **Timestamp:** 2026-10-31 20:53 +04 (Asia/Baku)
- **Engine/rules:** qosa-research-0.5.3 + symmetric-action-orbit-tiebreak/v1; recovered `qosa-1.0.0`, primary 3×9. Branch-label interchangeability is used for metamorphic testing only. Physical branch reopening and blocked-tie scoring remain **PROVISIONAL**.
- **Source:** current GitHub `qosha-research/simulator/{engine,turn-kernel,turn-dispatcher,initializer,round-driver,strategy-runner}.js`; runner committed here. Executed in the V8 harness. Clean Node 22 checkout/CLI remains blocked by runtime DNS to github.com.

## Seeded workload
- **Full-round cohort:** 120 seed draws, 120 unique seat/stock allocations, seeds 3404400–3404519; duplicate allocations: 0. Three seat rotations × two mixes = **720 matched round pairs / 1440 arm-rounds**. No hidden-world allocations.
- **Branch-symmetry cohort:** 40 draws, 40 unique allocations, 927 sampled seat/position snapshots; 24 permutations; 22248 action-set checks; 19368 playable permutation comparisons. Option-state/legal-action-set mismatches: **0/0**.

## Distributional tie-break test
Keep each policy's primary rank. For non-random policies, group top actions by branch-state automorphism orbit (same active/end descriptor), then choose an orbit uniformly and a member uniformly. Random-legal remains uniform over all legal actions. Compare probability maps, not same-seed selected actions.

| Policy | Existing deterministic choice changes under relabel | Distribution checks | Distribution mismatches | Mean top actions | Mean action orbits |
|---|---:|---:|---:|---:|---:|
| random-legal | 3150/19368 (16.26%) | 19368 | 0 | 3.147 | 3.147 |
| min-hand-pips | 2734/19368 (14.12%) | 19368 | 0 | 1.465 | 1.237 |
| fast-doubles | 2446/19368 (12.63%) | 19368 | 0 | 1.398 | 1.192 |
| moderate-double-hold | 2822/19368 (14.57%) | 19368 | 0 | 1.423 | 1.187 |
| closed-branch-control | 3042/19368 (15.71%) | 19368 | 0 | 1.371 | 1.118 |

**Result:** 96840 distributional checks, **0 mismatches**. Existing raw tie-breaks remain label-sensitive (12.63%–16.26%). For closed-branch-control, mean best actions 1.371 group into 1.118 action orbits.

## Matched full-round sensitivity (not a strength ranking)
| Mix | Outcome kind changed | First finisher changed among both-finish pairs | Minus changed among both-finish pairs | Mean turn delta | Mean final-pip delta/seat |
|---|---:|---:|---:|---:|---:|
| mix1 | 33/360 (9.17%) | 162/327 (49.54%) | 74/327 (22.63%) | -0.053 | -0.172 |
| mix2 | 19/360 (5.28%) | 80/338 (23.67%) | 39/338 (11.54%) | -0.008 | -0.217 |

| Mix | Strategy | Baseline finish rate | Action-orbit finish rate | Baseline mean remainder | Action-orbit mean remainder |
|---|---|---:|---:|---:|---:|
| mix1 | random-legal | 109/360 (30.28%) | 91/360 (25.28%) | 7.453 | 7.650 |
| mix1 | min-hand-pips | 100/360 (27.78%) | 109/360 (30.28%) | 4.969 | 4.781 |
| mix1 | closed-branch-control | 134/360 (37.22%) | 144/360 (40.00%) | 3.842 | 3.317 |
| mix2 | fast-doubles | 70/360 (19.44%) | 71/360 (19.72%) | 6.656 | 6.458 |
| mix2 | moderate-double-hold | 129/360 (35.83%) | 127/360 (35.28%) | 4.275 | 4.014 |
| mix2 | closed-branch-control | 145/360 (40.28%) | 153/360 (42.50%) | 3.425 | 3.233 |

Mix 1 includes random-legal; its random stream differs between arms, so it is not a pure deterministic tie-break isolation. Mix 2 is the cleaner deterministic-policy sensitivity comparison. These are **round first-finisher** outcomes, not a 101 match win rate; block rounds have no assigned winner. Outcome changes show tie-break relevance under this model, not that action-orbit is stronger.

## Confidence, limitations, next action
- High confidence in distributional equivariance on tested reachable snapshots and all 24 branch permutations; deterministic replay passed.
- Descriptive full-round sensitivity only. Physical branch reopening, blocked ties, 101 scoring and human-policy external validity are not authenticated. New cohort remains separate from legacy samples.
- **Next:** run a disjoint 500-deal matched holdout, report paired uncertainty, and keep branch-dependent recommendations provisional until physical rule evidence is obtained.

## Reproduction
```sh
node qosha-research/simulator/branch-label-symmetric-tiebreak.js test
node qosha-research/simulator/branch-label-symmetric-tiebreak.js 3404400 120 40 200
```
