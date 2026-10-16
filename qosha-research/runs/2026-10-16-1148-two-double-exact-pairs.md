# Two-double exact-pair independent holdout — 2026-10-16 11:48 (+04)

- Engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0` 3×9, provisional branch opening.
- Seeds: 1070000..1072499 and 1072500..1074999; 5,000 unique deals; **5630** eligible seat positions, **11260** complete matched rounds, 0 unresolved.
- Policies: focal closed-branch-control vs moderate-double-hold; two moderate-double-hold opponents; identical seed/deal/seat.
- Validation: deterministic 12-seed V8 replay, 5,000 deck checks, complete pair accounting. Node CLI not run.
- Overall control advantage: **9.43 pp / 8.58 pp**; mean focal pip delta -0.372 / -0.4039.
- Exact-pair stratification: 15 possible non-1 double pairs; **12** pairs have >100 observations in each block and positive model-specific finish-first difference in both. This is exploratory; subgroup ranking is not causal.
- No pair is promoted to a human gameplay rule. Initial hand composition, starter and opponent bot can explain the differences; intervals/multiple comparisons not corrected.
- Recovered unsaved 10:54 checkpoint at `runs/2026-10-16-1054-recovered-two-double-checkpoint.md` (11,272 rounds quarantined, not added).
- Verified cumulative complete strategy rounds: **438760** (prior 427,500 + 11260); quarantined 11,272 separate.
- Exact next: starter-matched and hand-pip-matched exact-pair comparisons on disjoint seeds with alternate opponents, and execute Node regression on persisted runner.
- Raw metrics: `runs/2026-10-16-1148-two-double-exact-pairs.json`.
