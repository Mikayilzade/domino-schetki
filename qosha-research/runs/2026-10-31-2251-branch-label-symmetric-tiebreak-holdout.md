# Qoşa research — disjoint 500-deal action-orbit holdout

- **Timestamp:** 2026-10-31 22:51 +04 (Asia/Baku)
- **Source revision executed:** `416c8032a4c399ba0585fd21daba1f7747d59bc7`
- **Engine/rules:** `qosa-research-0.5.3 + symmetric-action-orbit-tiebreak/v1`; recovered `qosa-1.0.0`, 3 players × 9 stones + 1 stock tile. Four branch labels are symmetric for metamorphic testing only. Physical branch reopening and blocked-round tie scoring remain **PROVISIONAL**.
- **Run type:** new matched full-round cohort; no hidden-world sampler run.
- **Seeds/deals:** 500 draws, 500 unique allocations, seeds `3405020..3405519`; no duplicate allocations.
- **Design:** two policy mixes × three seat rotations × 500 deals = **3,000 paired round comparisons / 6,000 arm-rounds**. Each pair uses the same deal and seat assignment; baseline policy tie-break is the existing stable/raw action order, comparison policy keeps the same primary ranks but samples action-orbits uniformly then members uniformly. `random-legal` is uniform over top actions.
- **Reproduction:** `node qosha-research/simulator/branch-label-symmetric-tiebreak.js 3405020 500 40 200`; regression: `node qosha-research/simulator/branch-label-symmetric-tiebreak.js test`.

## Structural audit

- 40 unique audit deals; 921 sampled positions; all 24 branch-label permutations.
- **22,104** permutation checks and **19,392** playable comparisons; option-state and legal-action-set mismatches: **0**.
- Five policy distributions × 19,392 = **96,960 checks, 0 mismatches**.
- Existing deterministic choice changed under relabeling: random-legal 16.00%; min-hand-pips 14.44%; fast-doubles 13.55%; moderate-double-hold 15.02%; closed-branch-control 16.11%.

## Paired full-round metrics

| Mix | Outcome kind changed | Both-finish pairs | First finisher changed | Minus class changed | Baseline block rate | Action-orbit block rate |
|---|---:|---:|---:|---:|---:|---:|
| Mix 1 (includes random-legal; sensitivity cohort) | 100/1,500 (6.67%) | 1398 | 684/1398 (48.93%) | 320/1398 (22.89%) | 3.13% | 3.80% |
| Mix 2 (cleaner deterministic-policy comparison) | 79/1,500 (5.27%) | 1408 | 320/1408 (22.73%) | 157/1408 (11.15%) | 3.87% | 3.13% |

- Mix 2 first-finisher rate by strategy (baseline → action-orbit): fast-doubles 19.00% → 18.40%; moderate-double-hold 32.33% → 33.80%; closed-branch-control 44.80% → 44.67%.
- Mean round length: Mix 1 25.41 → 25.42 turns; Mix 2 25.22 → 25.24.
- Minus outcomes across 1,500 rounds per arm: Mix 1 baseline {"0":1224,"-10":218,"-20":11,"-30":0,"-40":0} vs action-orbit {"0":1227,"-10":211,"-20":5,"-30":0,"-40":0}; Mix 2 baseline {"0":1163,"-10":269,"-20":9,"-30":1,"-40":0} vs action-orbit {"0":1166,"-10":273,"-20":13,"-30":1,"-40":0}. No −40 observed; this sample does not imply impossibility.
- Per-strategy mean/median remaining pips, starting/ending doubles, first-finish counts and all arm metrics are retained in the machine-readable JSON.

## Repeated holdout comparison

Across the previous disjoint 500-deal cohort `3404520..3405019` and this cohort `3405020..3405519` (1,000 deal allocations; 12,000 arm-rounds; do not merge with other research populations):
- Mix 2: first finisher changed in **632/2825 (22.37%)** both-finish pairs; outcome kind changed in **145/3,000 (4.83%)**. Cohort-specific first-finisher change rates are 22.02% and 22.73%.
- Mix 1: first finisher changed in **1363/2804 (48.61%)** both-finish pairs; outcome kind changed in **192/3,000 (6.40%)**. It includes randomized `random-legal`, so it is the more sensitive comparison.

## Finding, confidence, limitations

- **Useful finding:** tie-break choice remains outcome-sensitive on a disjoint holdout. In the cleaner Mix 2, the first finisher changed in 22.73% of both-finish pairs; the prior holdout was 22.02%. The repeated rates are descriptively close. This is **tie-break sensitivity, not strategy superiority**.
- **Confidence:** high for deterministic replay and the tested metamorphic/distributional contract; descriptive only for full-round outcome sensitivity. No paired CI was calculated here. Round first-finisher is not a 101-match win rate.
- **Limitations:** the current kernel's physical late-arrival branch unlocking and blocked-tie scoring are unverified. This run does not authenticate them. No decision-regret or opponent-model posterior was evaluated. Branch-opening value is not isolated.
- **Execution:** the exact committed GitHub source and its dependencies were fetched at `416c8032a4c399ba0585fd21daba1f7747d59bc7` and executed in a V8 CommonJS-compatible harness; runner test passed (2232 permutation checks, 10440 distribution checks, 0 distribution mismatches). This was **not** a clean Node 22 checkout/CLI run.

## Cumulative populations (kept separate)

- Existing incompatible-model rounds: **1,380,975**; forced continuations: **1,898,856**; opening-deal study seeds: **630,000**; hidden-world allocations: **1,195,408** (unchanged; this run added 0).
- New action-orbit full-round cohorts: **1,000 unique deals / 12,000 arm-rounds** total; this run added **500 / 6,000**.
- Historical 4,000-round baseline remains separate. Next full-round seed: **3405520**.

## Exact next hypothesis/action

Run a matched-seed full-round sensitivity comparison of the two still-provisional branch-unlocking interpretations (global-ever-open vs current-active-only) using the same 500 deals, policy tie-break, and seat rotations. Record any strategy-ranking reversals separately from tie-break sensitivity. Do not promote branch-dependent results until a physical trace/ruling is available.
