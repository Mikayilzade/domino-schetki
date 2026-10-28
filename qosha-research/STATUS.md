# Qoşa research status

Updated: 2026-10-29 01:48 +04:00 (Asia/Baku)

## Verified cumulative (incompatible models kept separate)
- **1,380,975** complete model rounds across incompatible branch assumptions; historical 4,000 separate.
- **1,898,856** forced hidden-world continuations; **14,082** next-pass labels; **4,900** known-world diagnostics (unchanged).
- **490,000** deterministic opening deals (unchanged).
- **742,544** separate synthetic hidden-world allocations (**740,496 + 2,048** fresh). The 29,568 exact opponent partitions for this run are conditional combinatorial evaluations, not extra random allocations.
- Engine `qosa-research-0.5.3 + double-five-preregistered-1.0` (analysis only), recovered `qosa-1.0.0` 3×9; both branch models **PROVISIONAL**.
- Latest new hidden seeds `2811496..2813543`; next unused >= `2813544`.

## Latest checkpoint — pre-registered 5-5 predictor, third disjoint cohort
- [Run record with runnable exact reproduction](runs/2026-10-29-0148-double-five-preregistered.md).
- **32 unseen hash-ranked focal hands**, indices 16..23 per zero/six connector stratum; **29,568** exact conditional opponent partitions + **2,048** fresh seeded allocations. **0** new complete model rounds or full-game forced continuations.
- Prediction recorded in previous status **before this cohort**: 5-5 presence predicts higher robust second-return mobility under `chain06/high` within each stratum. All **4/4** stratum gaps positive; equal-stratum difference **+23.91 pp**, exploratory hand-level bootstrap interval **[+9.72, +38.08] pp**. Smaller than earlier +36.58/+35.22 pp; replicates direction only.
- **NOT a winning tactic:** `chain06/high` is safer than `single0/low` on only **1/32** hands (tie 1/32); pooled robust safety **39.10% vs 92.94%**. A 5-5 hand has only **31/924** safe partitions. Both branch models and greedy continuations are provisional.
- Tests: existing baseline and connector-strata regression suites, exact partitions, disjoint selection and deterministic seed replay passed in V8 CommonJS-compatible execution; Node CLI not executed. No scoreboard/PWA or GitHub Actions changed.

## NEXT ACTION
Prioritize **within-hand matched-policy comparison** for the 5-5 subset and authentic late-arrival branch and blocked-tie fixtures. If still unresolved, pre-register fourth unseen hash cohort (indices 24..31 per stratum), seed >=2813544; no win/minus claims until full rules are validated.
