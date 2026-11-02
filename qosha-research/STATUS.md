# Qoşa açdı research — current status

Last checkpoint: 2026-11-02T11:00:37+04:00 Asia/Baku.

- Fresh disjoint opponent-choice likelihood holdout; engine qosha-research-0.5.3 + decision-trace instrumentation; recovered qosa-1.0.0 / 3×9. Global-ever-open and current-only remain provisional.
- Seeds 3489601–3505600; scanned through 3501758. 12158 unique allocations; 1500 late states; balanced holdout 40 3–3 and 40 2–3 multi-action states.
- Exact support: 1200 labeled allocations; 409 joint state-world assignments; global 409, current-only 792; no within-state duplicates.
- Opponent-choice posterior: equal prior random-legal / min-hand-pips / fast-doubles; stable per-opponent style and per-decision mixture. Paired profiles closed-branch-control, min-hand-pips, fast-doubles; 6612 model rollouts; 0 unresolved.
- Stable mixture shifts global first-finish regret by about +1 pp in both main strata, with intervals including zero. Mean posterior ESS ~2.9–3.6 worlds/state; no reliable tactic, no strategy promoted.
- Validation: 9 assertions passed. Live scoreboard/PWA untouched.
- Cumulative separate cohorts: 40,795 deal allocations, 694 joint-support multi-action states, 3,663 state-world assignments; not globally deduplicated across cohorts.
- Exact next: replicate posterior weighting/ESS on a disjoint holdout and seek an authenticated branch/block ruling.

Report: runs/2026-11-02-1100-pass-history-opponent-choice-likelihood.md
Data: runs/2026-11-02-1100-pass-history-opponent-choice-likelihood.json
Reproducer/test: simulator/pass-history-opponent-choice-likelihood.js and simulator/pass-history-opponent-choice-likelihood-test.js
