# Qoşa açdı research — current status

Last checkpoint: 2026-11-02T12:04:41+04:00 Asia/Baku.

- Fresh disjoint pass-history opponent-choice likelihood replication; qosha-research-0.5.3 + decision-trace instrumentation; recovered qosa-1.0.0 / 3×9. Global-ever-open/current-only remain provisional.
- Seeds 3505601–3521600; scanned through 3517833; 12,233 unique allocations, 0 duplicates.
- Selected 80 joint-support multi-action states (40 3–3, 40 2–3); 508 state-world assignments. Support partition reconciles: raw 1,200; global 508; current-only 888; joint 508; global-only 0; current-only-exclusive 380; neither 312.
- Equal-prior opponent likelihood: random-legal/min-hand-pips/fast-doubles; stable-style vs per-decision. Three continuation profiles, 7,944 paired model rollouts, 0 unresolved.
- Global closed-control first-finish regret shift: stable-style +0.19±1.69 pp; per-decision +0.55±1.48 pp versus pass-only. Intervals include zero; no reliable tactic or strategy promotion. Mean ESS 3.56 / 4.15 worlds per state.
- Validation: 9 assertions and SHA-256 known vector passed. Live scoreboard/PWA untouched.
- Cumulative separate cohorts: 53,028 deal allocations, 774 selected joint-support multi-action states, 4,171 state-world assignments; no global dedup across state/cohort worlds.
- Exact next: fresh seeds from 3521601; prior-grid robustness on matched worlds and policies; seek authenticated branch/block ruling.

Report: qosha-research/runs/2026-11-02-1204-pass-history-opponent-choice-replication.md
Data: qosha-research/runs/2026-11-02-1204-pass-history-opponent-choice-replication.json
Reproducer/test: qosha-research/simulator/pass-history-opponent-choice-likelihood.js and qosha-research/simulator/pass-history-opponent-choice-likelihood-test.js
