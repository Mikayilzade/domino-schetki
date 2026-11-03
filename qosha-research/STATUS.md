# Qoşa açdı research — current status

Last checkpoint: 2026-11-03T14:50:33+04:00 Asia/Baku.

- Latest checkpoint: full-round first-match redeal and later-round continuation audit under the recovered qosa-1.0.0 coded model.
- First-round accepted cohort: 2,000 deals / 2,080 attempts / 80 redeal signals; seeds 15,000,000–15,002,079; 2,000 unique accepted allocations.
- Continuation cohort: 2,000 deals, seeds 16,000,000–16,001,999; 2,000 unique allocations; 73 stock-owned 1-1 cases, 1,927 hand-owned.
- Full outcomes: 4,000/4,000 rounds resolved; 94,580 transitions independently matched to the round driver; 98,580 exact inventory snapshots; 91,305 played-tile provenance checks; 985,748 full-run assertions passed.
- Separate active-PWA match-scoring adapter tests: 23 unit assertions and 64,066 exhaustive assertions passed. No block winner/tie score was assigned.
- No strategy comparison or promotion. This is internal coded-model validation, not physical-rule authentication. Branch semantics, block winner/tie scoring, and loneZero=10 remain unresolved; no historical-baseline pooling.

Exact next action: connect finish-only round score deltas to the active-PWA adapter end-to-end and test score-floor / 101-bust progression, leaving block rounds unscored.

Results: qosha-research/RESULTS.md
Reproducer: qosha-research/simulator/redeal-full-round-audit.js
Test: qosha-research/simulator/redeal-full-round-audit-test.js
