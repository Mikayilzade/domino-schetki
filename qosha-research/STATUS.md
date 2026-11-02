# Qoşa açdı research — current status

Last checkpoint: 2026-11-02 09:52:03+04 Asia/Baku.

- Fresh disjoint pass-history Cohort D; engine/rules: qosha-research-0.5.3 / recovered qosa-1.0.0 / 3×9; global-ever-open and current-only remain provisional.
- Seeds 3473601–3486024: 12,424 unique allocations, 0 duplicates; 1,500 selected late states, 264 joint-support multi-action states, 1,512 exact joint state-world assignments.
- Four continuation profiles: 4,118 candidate-world pairs / 8,236 rollouts each; 16,472 pairs / 32,944 rollouts total; 0 unresolved.
- State-cluster model gap: +23.50±4.39 pp closed-control, +23.57±4.39 min-pips, +23.46±4.41 fast-doubles, +23.57±4.39 moderate-hold. Profile range 0.104 pp.
- Exploratory stratification: 3–3 opponent hands +34.10±6.47 pp vs 2–3 +15.48±7.13 pp; difference +18.62±9.62 pp. Selected synthetic model sensitivity only; no tactic promoted.
- Validation: exact support partition reconciled, 0 duplicate allocations, 0 unresolved rollouts; stratification summary passed 10 V8 assertions. Clean Node checkout remains blocked by GitHub DNS. Live scoreboard/PWA untouched.
- Cumulative separate cohorts: 28,637 unique deal allocations, 614 joint-support multi-action states, 3,254 state-world assignments across five cohorts. Strategy tournament unchanged.
- Exact next: fresh holdout from 3489601; compare pass-only support with opponent-choice likelihood mixtures in 3–3 / 2–3 strata; seek authenticated branch/block ruling.

Report: runs/2026-11-02-0952-pass-history-joint-support-cohort-D.md
Data: runs/2026-11-02-0952-pass-history-joint-support-cohort-D.json
Reproducer/test: simulator/pass-history-cohort-strata-audit.js and simulator/pass-history-cohort-strata-audit-test.js
