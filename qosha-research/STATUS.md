# Qoşa açdı research — current status

Last checkpoint: 2026-11-02T23:47:54+04:00 Asia/Baku.

- Added `simulator/opening-initializer-invariant-test.js` for the recovered 3×9 + one-stock initializer.
- Seed range 7,000,000–7,019,999: 20,000 deterministic draws, 20,000 unique seat-labelled allocations, 0 duplicate pairs; Node v22.16.0.
- Exact GitHub source blob hashes were verified before execution: engine.js `82e5bd544a57683d5b4f7812b2d4abf80da894`; initializer.js `2fad29e516454580ec9a06115354e9866f3096e6`.
- 1,105,683 assertions passed. 1-1 was in seats 0/1/2 = 6,421/6,265/6,634 and in stock 680 times. All 680 first-round stock-1-1 cases returned the redeal marker.
- On continuation rounds, 18,704/20,000 mandatory follow-ups were played and 1,296 passed. Exact no-follow-up reference under uniform dealing and independent previous winner: C(21,9)/C(27,9) = 6.2714%; observed 6.48%, within a broad 7-sigma smoke guard.
- Four-side selector checks: 7,404 variants across the first 2,000 seeds; same tile/hand remainder, only side changes. This is branch-label diagnostic only.
- No full rounds or strategy outcomes; no tactical finding. This is finite-seed implementation validation, not physical-rule authentication or a PRNG proof.
- Clean git checkout still fails because this runtime cannot resolve github.com; exact GitHub blobs were verified and executed in an isolated harness.
- Existing gameplay cohorts remain separate: 88,886 deal allocations, 1,074 selected multi-action positions, 5,863 state-world assignments; no global deduplication.
- Branch lock/open, block winner/scoring/tie, and loneZero=10 remain unresolved.
- Exact next: integrate initialized states with round-driver and validate first return cycles after mandatory follow-up and forced opening pass, including pass count/reset, legal actions, conservation, and finish/block gates.

Report: qosha-research/runs/2026-11-02-2347-opening-initializer-invariant-audit.md
Data: qosha-research/runs/2026-11-02-2347-opening-initializer-invariant-audit.json
Test: qosha-research/simulator/opening-initializer-invariant-test.js
