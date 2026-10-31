# Disjoint 500-deal holdout — symmetric action-orbit tie-break

- **Timestamp:** 2026-10-31 21:53 +04 (Asia/Baku) — disjoint 500-deal symmetric tie-break holdout
- **Engine/rules:** `qosa-research-0.5.3 + symmetric-action-orbit-tiebreak/v1`; recovered `qosa-1.0.0`, primary 3×9 + one stock. Branch-label symmetry is a metamorphic assumption only. Late branch reopening and blocked-tie scoring remain **PROVISIONAL**.
- **Execution:** exact GitHub-fetched committed modules were executed in an isolated V8 CommonJS-compatible harness. Smoke/regression test passed. This was **not** a clean local Node 22 checkout/CLI run.

## Seeded workload

- **500 new deal allocations**, seeds **3404520–3405019**, **500 unique**, 0 duplicate allocations.
- Two policy mixes × 3 seat rotations × 500 deals = **3,000 matched round pairs / 6,000 arm-rounds**; 0 new hidden-world allocations. Max-turn cap 200; all rounds resolved.
- Mix 1 includes `random-legal`, whose random stream differs between arms; treat it as a sensitivity cohort, not a pure tie-break isolation. Mix 2 contains deterministic base policies and is the cleaner comparison.

## Structural symmetry audit

- 40 fresh audit deals; 903 sampled positions; all 24 branch-label permutations.
- **21,672** option/action permutation checks; **19,368** playable comparisons; option-state and legal-action-set mismatches: **0**.
- Five policy distributions × 19,368 = **96,840 distribution checks, 0 mismatches**. Existing raw deterministic choices remained label-sensitive (12.22%–15.21% across policies).

## Paired full-round sensitivity (not a strength ranking)

| Cohort | Outcome kind changed | First finisher changed among both-finish pairs | Minus changed among both-finish pairs |
|---|---:|---:|---:|
| Mix 1 | 92/1500 (6.13%) | 679/1406 (48.29%) | 308/1406 (21.91%) |
| Mix 2 | 66/1500 (4.40%) | 312/1417 (22.02%) | 164/1417 (11.57%) |

Mix 2 outcome-kind changes were 4.40%; deal-clustered 95% interval [3.38 pp, 5.42 pp]. This quantifies tie-break sensitivity under the provisional engine, not strategy superiority.

### Mix 2 strategy finish-rate differences

Each strategy appears 1,500 times per arm (500 deals × 3 seat rotations). Differences are action-orbit minus baseline; 95% intervals are clustered by deal.

| Strategy | Baseline | Action-orbit | Paired difference | 95% CI |
|---|---:|---:|---:|---:|
| fast-doubles | 17.67% | 18.27% | 0.60 pp | [-1.21 pp, 2.41 pp] |
| moderate-double-hold | 33.67% | 34.80% | 1.13 pp | [-0.82 pp, 3.08 pp] |
| closed-branch-control | 45.60% | 43.33% | -2.27 pp | [-4.50 pp, -0.03 pp] |

Two of three intervals include zero. The closed-branch-control interval narrowly excludes zero in this exploratory run, but this is a tie-break ablation with multiple comparisons, provisional branch/block rules, and no multiplicity correction; **do not interpret it as a tactical improvement**. First-finisher is a round outcome, not a 101-match win rate.

## Round-level context

- Mix 1: baseline 1447 finishes / 53 blocks; action-orbit 1457 / 43. Mean turns 25.307 → 25.263.
- Mix 2: baseline 1454 finishes / 46 blocks; action-orbit 1446 / 54. Mean turns 25.229 → 25.228.
- No reliable winning tactic established. Full-round outcomes remain sensitive to policy tie-breaking even though the action distribution is branch-label invariant.

## Confidence, cumulative scale, next action

- High confidence for deterministic bookkeeping and the tested distributional symmetry contract; low external validity for human play.
- Legacy populations remain separate and unchanged: 1,380,975 incompatible-model rounds; 1,898,856 forced continuations; 630,000 opening-deal study seeds; 1,195,408 seeded hidden allocations. This checkpoint adds a separate 500-deal full-round holdout / 6,000 arm-rounds. Historical 4,000-round baseline remains separate.
- **Next full-round seed:** 3405020. Hidden-world seed stream unchanged.
- **Exact next action:** obtain/record an authenticated physical trace or explicit ruling for late-arrival branch reopening and blocked-round tie scoring; then repeat the same matched-seed strategy comparison under the confirmed rule. Keep branch-dependent advice provisional until then.
