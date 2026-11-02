# Qoşa açdı research — current status

Last checkpoint: 2026-11-02T14:50:21+04:00 Asia/Baku.

- Fresh disjoint opponent-choice softmax temperature grid; qosha-research-0.5.3 + trace-instrumented pass-history support + common-world regret evaluator; recovered qosa-1.0.0 / 3×9. Global-ever-open/current-only remain provisional.
- Seeds 3553601–3569600; scanned through 3565552; 11952 unique allocations, 0 duplicates.
- Selected 100 joint-support multi-action positions (50 3–3, 50 2–3); 599 exact state-world assignments. Support partition: raw 1500; global 599; current-only 979; joint 599; global-only 0; current-only-exclusive 380; neither 521.
- Uniform prior over random-legal / min-hand-pips / fast-doubles; stable-style vs per-decision mixture; temperatures 0.1 / 0.3 / 1.5. Three continuation profiles; 8694 paired model rollouts; 0 unresolved.
- Global / closed-control first-finish regret shifts vs pass-only all <1 pp; every descriptive state-cluster interval includes zero. ESS rises as temperature increases; no reliable tactical effect, no strategy promoted.
- Validation: 27 assertions passed; exact support reconciled. Live scoreboard/PWA untouched.
- Cumulative separate cohorts: 88886 deal allocations, 1074 selected multi-action positions, 5863 state-world assignments; no global dedup.
- Exact next: calibrate opponent-choice likelihood/temperature against held-out real decision traces or independent action data; preserve paired hidden worlds and continuation seeds; continue seeking authenticated branch/block ruling.

Report: qosha-research/runs/2026-11-02-1450-pass-history-opponent-choice-temperature-grid.md
Data: qosha-research/runs/2026-11-02-1450-pass-history-opponent-choice-temperature-grid.json
Runner/test: qosha-research/simulator/pass-history-opponent-choice-temperature-grid.js and qosha-research/simulator/pass-history-opponent-choice-temperature-grid-test.js
