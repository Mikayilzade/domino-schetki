# Qoşa açdı research — current status

Last checkpoint: 2026-11-02T13:50:23+04:00 Asia/Baku.

- Fresh disjoint opponent-choice softmax temperature holdout; qosha-research-0.5.3 + trace-instrumented pass-history support + common-world regret evaluator; recovered qosa-1.0.0 / 3×9. Global-ever-open/current-only remain provisional.
- Seeds 3537601–3553600; scanned through 3549828; 12,228 unique allocations, 0 duplicates.
- Selected 100 joint-support multi-action states (50 3–3, 50 2–3); 523 exact state-world assignments. Support partition: raw 1,500; global 523; current-only 1,058; joint 523; current-only-exclusive 535; neither 442; global-only 0.
- Softmax rank likelihoods at τ=0.2 / 0.5 / 1.0, priors uniform / random-legal-heavy / fast-doubles-heavy; stable-style vs per-decision. Three continuation profiles, 7,848 paired model rollouts, 0 unresolved.
- Global / closed-control first-finish regret shifts are all <1 pp; every descriptive interval includes zero. ESS rises with temperature (about 3.4–4.3 at τ=.2 to 4.5–4.6 at τ=1). No reliable tactical effect; no strategy promoted.
- Validation: 11 softmax + 11 prior-grid assertions passed; exact support reconciled. Live scoreboard/PWA untouched.
- Cumulative separate cohorts: 76,934 deal allocations, 974 selected joint-support multi-action positions, 5,264 state-world assignments; no global dedup across cohorts/state-world assignments.
- Exact next: fresh disjoint holdout from seed 3553601; temperatures 0.1 / 0.3 / 1.5; continue seeking authenticated branch/block ruling.

Report: qosha-research/runs/2026-11-02-1350-pass-history-opponent-choice-softmax.md
Data: qosha-research/runs/2026-11-02-1350-pass-history-opponent-choice-softmax.json
Runner/test: qosha-research/simulator/pass-history-opponent-choice-softmax.js and qosha-research/simulator/pass-history-opponent-choice-softmax-test.js
