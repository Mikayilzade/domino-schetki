# Qoşa açdı research — current status

Last checkpoint: 2026-11-02 04:54:38+04 Asia/Baku.

- Added exact paired candidate continuations on joint pass-conditioned support for the current-only-generated cohort.
- Seed scan 3454291–3455100: 810 unique deals, 0 duplicate allocations; 100 selected late positions, 17 with joint support.
- Exact support over those 17 state-world assignments: raw 212; global 52; current-only 151; joint 52; current-only-exclusive 99; neither 61.
- 133 candidate-action/world pairs and 266 model continuations completed. Global model: 127 finish / 6 block; current-only: 23 / 110. This is selected synthetic model sensitivity, not a real-game frequency or strategy result.
- State-cluster global-minus-current-only focal first-finish delta: +15.44 ± 12.13 pp; focal remainder −4.63 ± 2.47 pips. No strategy promoted.
- Live scoreboard/PWA files remain untouched. Clean Node checkout integration remains unrun due GitHub DNS; V8 regression passed.
- Exact next: scan fresh seeds from 3455101 for at least 50 joint-support multi-action positions; replicate with a third continuation profile and seek authentic branch-opening evidence.

Report: runs/2026-11-02-0454-pass-history-joint-support-choice-audit.md
Data: runs/2026-11-02-0454-pass-history-joint-support-choice-audit.json
Runner/test: simulator/pass-history-joint-support-choice-audit.js and simulator/pass-history-joint-support-choice-audit-test.js
