# Qoşa research status

Updated: 2026-10-29T07:52:12+04:00 (Asia/Baku)

## Verified cumulative (incompatible models kept separate)
- **1,380,975** complete model rounds across incompatible branch assumptions; historical 4,000 separate.
- **1,898,856** forced hidden-world continuations; **14,082** next-pass labels; **4,900** known-world diagnostics (unchanged).
- **490,000** deterministic opening deals (unchanged).
- **748,688** separate synthetic seeded hidden-world allocations (**744,592 + 4,096** fresh). Exact 3,432-way partitions per chronology are not counted as random allocations.
- Engine `qosa-research-0.5.3 + double-five-fourth-cohort-1.0` (analysis only), recovered `qosa-1.0.0` 3×9; both branch models **PROVISIONAL**.
- Latest new hidden seeds `2815592..2817639`; next unused >= `2817640`.

## Latest checkpoint — exact repeated opening pass locks
- [Executable exact census and four exhaustive opponent-partition regressions](simulator/opening-lock-depth-exact.js); [RESULTS checkpoint](RESULTS.md).
- With all six 1-X connectors, retaining matching X-X doubles permits **1, 2, or 3 complete rotations of two forced opponent passes**: **875**, **245**, or **20** possible post-draw starter hands (at-least thresholds) out of **4,686,825**. Independent 1,330-filler enumeration and four 48,620-way partition checks passed in V8; Node CLI from fresh checkout not run.
- **0** new complete rounds/deals/seeded worlds; cumulative remains **1,380,975** incompatible-model rounds and **748,688** seeded hidden allocations. This is a very rare confirmed-opening guarantee, **not** a win-rate tactic.
- Physical late-arrival branch and blocked-tie rules remain unresolved; prioritize authentic examples before full-game ranking.

## Previous checkpoint — exact opening two-pass lock
- [Original one-rotation census](simulator/opening-two-pass-lock-exact.js), [checkpoint](runs/2026-10-29-0656-opening-two-pass-lock-exact.md).
- First lock confirmed for **875** of 4,686,825 post-draw starter hands; now extended to repeated rotations by the latest checkpoint. No new seeded samples.

## Previous checkpoint — same-model chronological pass posterior
- [Reproducible test/runner](simulator/branch-order-posterior.js), [checkpoint](runs/2026-10-29-0452-branch-order-posterior.md), [raw](runs/2026-10-29-0452-branch-order-posterior.json).
- Two identical board snapshots with different legal histories under the **same provisional all-current-only model**: after seat-2 pass, seat-1 ownership of 2-6 is exact **100%** (120/120) vs **36.36%** (120/330). 3,432 exact partitions per history; 4,096 new deterministic hidden worlds; 0 new full rounds.
- V8 CommonJS-compatible tests, exact brute/DP agreement and 28-tile conservation passed; **Node CLI not run**. Physical late-arrival and block ties remain unresolved. Cumulative hidden allocations now **748,688**.

## Previous checkpoint — chronological branch-order identifiability
- [Exact regression](simulator/branch-order-history-test.js), [checkpoint](runs/2026-10-29-0352-branch-order-history.md).
- Two legal synthetic histories have identical played tiles and final four ends, yet under all-current-only opening the late-arrival history forbids 0-2, 2-5 and 2-6 while early arrival allows them; global-ever-open permits them in both. No new deals or strategy wins.
- Physical late-arrival rule and blocked ties still unresolved; snapshot-only inference is insufficient. Cumulative and next seed unchanged.

## Previous checkpoint — fourth disjoint 5-5 cohort + paired policy outcomes
- [Run record](runs/2026-10-29-0254-double-five-fourth-cohort.md), [reproducible runner](simulator/double-five-fourth-cohort.js), [raw](runs/2026-10-29-0254-double-five-fourth-cohort.json).
- **32 new hands**, indices 24..31 per connector stratum; **29,568** exact conditional partitions and **2,048** new seeded hidden allocations. **0** new full model rounds.
- 5-5 association with `chain06/high` robust second-return mobility positive in **4/4** strata, equal-stratum gap **+25.13 pp**. Tiny 5-5 cells; structural correlation only.
- **Matched within-hand:** `single0/low` robust safety **90.39%** vs `chain06/high` **32.00%**. Of 29,568 exact partitions, **17,946** single-only safe, **682** chain-only safe. Chain safer on **0/32 hands**, including **0/9** hands containing 5-5.
- Tests: baseline and connector-strata regression, exact contingency invariants, disjoint cohort, seeded replay passed in V8 CommonJS-compatible execution; **Node CLI not run**. No scoreboard/PWA or GitHub Actions changed.
- **No confirmed real-game win, minus, block or regret claim**: branch late-arrival, blocked tie, optional double timing, loneZero and 101 scoring unverified.

## NEXT ACTION
Authenticate physical late-arrival branch reopening and blocked-tie scoring; then compare actual same-hand candidate actions on fixed visible real-game states and matched hidden worlds. Avoid extrapolating rare opening locks into a universal keep-double strategy.
