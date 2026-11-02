# Qoşa açdı research — current status

Last checkpoint: 2026-11-02 05:54:43+04 Asia/Baku.

- Added profile-aware continuation selection to the exact pass-history joint-support paired audit; default `closed-branch-control` behavior remains backward-compatible.
- Fresh seed window 3455101–3457600; scan stopped at 3457406 after 2,306 unique deals / 0 duplicate allocations and 300 selected late positions.
- 50 selected positions had non-empty joint pass-conditioned support and at least two common root actions; exact support totals raw 617, global 249, current-only 457, joint 249, current-only-exclusive 208, neither 160.
- Three matched continuation profiles: closed-branch-control, min-hand-pips, fast-doubles. 698 candidate-world pairs / 1,396 model rollouts per profile; 2,094 / 4,188 total.
- Branch-model gap remained similar across profiles: first-finish delta +20.08 ± 9.62 pp for closed/min-pips, +19.48 ± 9.57 pp for fast-doubles. This is selected synthetic model sensitivity, not a physical rule result or tactic.
- Base regression (8 assertions) and fixed-cohort profile regression (29 assertions) passed in V8. Live scoreboard/PWA files remain untouched; clean Node checkout remains blocked by GitHub DNS.
- Exact next: fresh seeds, target 100 joint-support multi-action states, add an orbit-symmetric moderate-double-hold continuation, and seek authentic branch-opening/block evidence.

Report: runs/2026-11-02-0554-pass-history-continuation-profile-audit.md
Data: runs/2026-11-02-0554-pass-history-continuation-profile-audit.json
Runner/test: simulator/pass-history-joint-support-choice-audit.js and simulator/pass-history-joint-support-profile-audit-test.js
