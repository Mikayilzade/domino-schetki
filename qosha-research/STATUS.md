# Qoşa research status

Updated: 2026-10-29T03:54:15+04:00 (Asia/Baku)

## Verified cumulative (incompatible models kept separate)
- **1,380,975** complete model rounds across incompatible branch assumptions; historical 4,000 separate.
- **1,898,856** forced hidden-world continuations; **14,082** next-pass labels; **4,900** known-world diagnostics (unchanged).
- **490,000** deterministic opening deals (unchanged).
- **744,592** separate synthetic seeded hidden-world allocations (**742,544 + 2,048** fresh). Fourth cohort's 29,568 exact conditional partitions are not additional independent random allocations.
- Engine `qosa-research-0.5.3 + double-five-fourth-cohort-1.0` (analysis only), recovered `qosa-1.0.0` 3×9; both branch models **PROVISIONAL**.
- Latest new hidden seeds `2813544..2815591`; next unused >= `2815592`.

## Latest checkpoint — chronological branch-order identifiability
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
Prioritize **authentic late-arrival branch and blocked-tie physical fixtures**, then compare same-hand candidate policies on pass-conditioned real-history worlds. Do not infer a universal keep-double tactic from this synthetic mobility metric; avoid additional 5-5-only cohorts without new rules/positions.
