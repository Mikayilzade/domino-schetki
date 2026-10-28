# Qoşa research status

Updated: 2026-10-29 00:51 +04:00 (Asia/Baku)

## Verified cumulative (incompatible models kept separate)
- **1,380,975** complete model rounds across incompatible branch assumptions; historical 4,000 separate.
- **1,898,856** forced hidden-world continuations; **14,082** next-pass labels; **4,900** known-world diagnostics (unchanged).
- **490,000** deterministic opening deals (unchanged).
- **740,496** separate synthetic hidden-world allocations (unchanged; current audit reused **59,136** exact partitions, not new allocations).
- Engine `qosa-research-0.5.3 + double-five-structural-audit-1.0`, recovered `qosa-1.0.0` 3×9; both branch models **PROVISIONAL**.
- Latest new hidden seeds `2809448..2811495`; next unused >= `2811496`.

## Latest checkpoint — 5-5 structural association (post-hoc)
- [Script](simulator/double-five-structural-audit.js), [checkpoint](runs/2026-10-29-0051-double-five-structural-audit.md), [raw](runs/2026-10-29-0051-double-five-structural-audit.json).
- **0 new simulations**, exact reanalysis of 64 disjoint hands × 924 partitions (59,136 reused conditional partitions).
- For `chain06/high`, 5-5 presence is associated with higher robust second-return mobility in all 4 connector strata in each of two cohorts; equal-stratum gap **36.58%** discovery and **35.22%** holdout.
- **NOT a validated winning tactic:** post-hoc feature search, synthetic provisional branch models, and both-double chain rarely beats `single0/low` on the same hand.

## NEXT ACTION
Pre-register 5-5 prediction, test new hash-ranked hands 16..23 per stratum with exact partitions and optional seeds >=2811496; authenticate late-arrival branch opening and blocked ties. No scoreboard/PWA or GitHub Actions touched.
