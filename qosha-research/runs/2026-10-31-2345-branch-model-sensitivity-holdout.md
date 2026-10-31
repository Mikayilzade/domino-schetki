# Qoşa research checkpoint — branch-model sensitivity + symmetric tie-break holdout

- **Timestamp:** 2026-10-31 23:45 +04 (Asia/Baku)
- **Source revision:** `99ce431457eb322b5fd5b0fde64b615991df0d1f`; per-mix accounting patch to the branch-model runner is committed with this checkpoint.
- **Engine/rules:** `qosa-research-0.5.3`, recovered `qosa-1.0.0`, primary 3 players × 9 stones + one stock tile. Four branch labels are a metamorphic symmetry assumption only. Physical late-arrival unlocking and blocked-tie scoring remain **PROVISIONAL**.
- **Execution:** exact GitHub-fetched JavaScript modules ran in a V8 CommonJS-compatible harness. Both regression tests passed. This was **not** a clean local Node 22 checkout/CLI run.

## A. Symmetric action-orbit tie-break holdout

- **Deals/seeds:** 500 unique deals, `3405520..3406019`, 0 duplicate allocations.
- **Design:** two policy mixes × three seat rotations × 500 deals = **3,000 matched round pairs / 6,000 arm-rounds**. No new hidden-world allocations.
- **Structural audit:** 40 audit deals, 921 positions, **22,104** branch-permutation checks, **19,392** playable comparisons. Option-state and legal-action-set mismatches: **0**. Five policy distributions × 19,392 = **96,960 checks, 0 mismatches**.
- **Mix 2 (deterministic-policy comparison):** outcome kind changed **79/1,500 (5.27%)**; first finisher changed **320/1,408 (22.73%)** both-finish pairs; minus class changed **157/1,408 (11.15%)**.
- Finish-rate differences (action-orbit − baseline): fast-doubles **−0.60 pp**; moderate-double-hold **+1.47 pp**; closed-branch-control **−0.13 pp**. These are tie-break ablations, not strategy-strength estimates.
- **Replication:** the preceding disjoint cohort `3405020..3405519` had the same Mix-2 counts (320/1,408 first-finish changes; 79/1,500 outcome-kind changes). Combined descriptively: **640/2,816 (22.73%)** first-finish changes and **158/3,000 (5.27%)** outcome-kind changes. This is tie-break sensitivity, **not strategy superiority**.

## B. Matched branch-unlocking model sensitivity

- **Same deals:** 500 unique seeds `3405520..3406019`; two policy mixes × three seat rotations. Each model has 3,000 rounds; four models = **12,000 model-rounds**. No new hidden worlds.
- **Primary comparison — global-ever-open vs current-active-only:** outcome kind changed **2,693/3,000 (89.77%)**; **2,686** global-finish rounds became current-model blocks, **7** global-block rounds became current-model finishes, and **60** both-finish pairs had a different first finisher.
- **Block rate:** global **3.87% (116/3,000)** vs current-active-only **93.17% (2,795/3,000)**. Paired mean turns (current − global): **−1.823**; mean remaining-pip delta per seat: **+10.686**.
- **By mix:** Mix 1 changed outcome kind in **1,355/1,500 (90.33%)**, block rate **3.33% → 93.27%**. Mix 2 changed outcome kind in **1,338/1,500 (89.20%)**, block rate **4.40% → 93.07%**.
- **Finish-first policy strata (not match win rates):**
  - Mix 1 global → current-active-only: random-legal **29.53% → 0.93%**; min-hand-pips **27.07% → 1.80%**; closed-branch-control **40.07% → 4.00%**.
  - Mix 2: fast-doubles **16.33% → 1.73%**; moderate-double-hold **34.33% → 1.73%**; closed-branch-control **44.93% → 3.47%**.
- The model assumption changes finish/block outcomes in about **9 of 10** matched rounds. Closed-branch-control remains highest finish-first within these two mixes, while some lower-policy ordering changes. This demonstrates that branch-rule ambiguity is decision-critical; it does **not** authenticate either interpretation.

## Confidence, limitations, cumulative scale, next action

- High confidence in deterministic replay, per-mix accounting, and the tested branch-label distributional symmetry contract; descriptive confidence only for outcomes under synthetic kernels.
- Block winners/ties are not assigned first place. These are round finish-first metrics, not 101-match win rates. Random-legal action indices can diverge when model action sets differ. No decision-regret or real-history posterior was evaluated.
- Existing populations unchanged: **1,380,975** incompatible-model rounds; **1,898,856** forced continuations; **630,000** opening-deal study seeds; **1,195,408** seeded hidden allocations.
- Action-orbit full-round holdouts now total **1,500 unique deals / 18,000 arm-rounds** (three 500-deal cohorts); the earlier 120-deal pilot / 1,440 arm-rounds remains separate. Historical 4,000-round baseline remains separate. Next full-round seed: **3406020**.
- **Exact next action:** obtain an authenticated physical ruling/trace for late-arrival branch reopening and blocked-round tie scoring. Until then, keep both branch models provisional; prioritize invariant tests or analysis of a real logged pass/branch trace.
