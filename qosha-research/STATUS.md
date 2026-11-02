# Qoşa açdı research — current status

Last checkpoint: 2026-11-02T13:10:52+04:00 Asia/Baku.

- Fresh disjoint opponent-choice prior-grid sensitivity; qosha-research-0.5.3 + trace-instrumented pass-history support + common-world regret evaluator; recovered qosa-1.0.0 / 3×9. Global-ever-open/current-only remain provisional.
- Seeds 3521601–3537600; scanned through 3533278; 11678 unique allocations, 0 duplicates.
- Selected 100 joint-support multi-action states (50 3–3, 50 2–3); 570 exact state-world assignments. Support partition: raw 1500, global 570, current-only 1112, joint 570, global-only 0, current-only-exclusive 542, neither 388.
- Prior grid: uniform / random-legal-heavy / fast-doubles-heavy; stable-style vs per-decision mixture; three continuation profiles, 9012 paired model rollouts, 0 unresolved.
- Global closed-control regret shifts vs pass-only: stable-style 1.04 / 0.89 / 1.05 pp; per-decision 0.66 / 0.27 / 0.76 pp across uniform / random-heavy / fast-heavy priors. Intervals include zero; no reliable tactical effect, no strategy promoted.
- Mean ESS remains modest (about 3.3–4.5 worlds); opponent-choice likelihood depends on assumed prior and uniform-top-action model. Branch opening/block/scoring remain unauthenticated.
- Validation: 9 existing + 11 prior-grid assertions passed in V8 harness. Live scoreboard/PWA untouched.
- Cumulative separate cohorts: 64706 deal allocations, 874 selected joint-support multi-action states, 4741 state-world assignments; no global dedup across cohorts/state-world assignments.
- Exact next: fresh holdout with softmax/temperature action likelihood; same hidden worlds and continuation seeds; seek authenticated branch/block ruling.

Report: qosha-research/runs/2026-11-02-1310-pass-history-opponent-choice-prior-grid.md
Data: qosha-research/runs/2026-11-02-1310-pass-history-opponent-choice-prior-grid.json
Runner/test: qosha-research/simulator/pass-history-opponent-choice-prior-grid.js and qosha-research/simulator/pass-history-opponent-choice-prior-grid-test.js
