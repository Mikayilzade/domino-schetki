# Qoşa açdı research — current status

Last checkpoint: 2026-11-02T22:50:39+04:00 Asia/Baku.

- Added simulator/deal-distribution-test.js: exact hypergeometric reference checks for the 3x9+1-stock deal generator, per-tile seat/stock marginals, hand double counts, and the conditional 1-1 holder hand.
- Fixed deterministic seed range 0–49,999: 50,000 deal draws; 172 assertions passed in Node v22.16.0 against the exact fetched engine.js blob SHA 82e5bd544a57683d5b4f7812b2d4abf80da894 in an isolated harness.
- Mean starting doubles by seat were 2.25224 / 2.24808 / 2.24776 versus exact 2.25. Conditional on 1-1 in a 9-tile hand, 2 or 3 pre-opening doubles have exact probability 68.09% (observed 68.33%).
- This is a dealing baseline and statistical smoke test, not proof of PRNG uniformity or a tactical result. No round strategies, branch/block outcomes, or match scoring were simulated.
- Clean GitHub checkout still fails because this runtime cannot resolve github.com; the committed test has not yet run from the repository checkout.
- Separate game cohorts unchanged: 88,886 deal allocations, 1,074 selected multi-action positions, 5,863 state-world assignments; no global dedup.
- Branch lock/open, block winner/scoring/tie, and loneZero=10 remain unresolved.
- Exact next: run this committed test plus block/branch Node regressions in a clean checkout when DNS is available; then validate the initializer's mandatory 1-1 draw/follow-up separately.

Report: qosha-research/runs/2026-11-02-2250-deal-distribution-audit.md
Data: qosha-research/runs/2026-11-02-2250-deal-distribution-audit.json
Test: qosha-research/simulator/deal-distribution-test.js
