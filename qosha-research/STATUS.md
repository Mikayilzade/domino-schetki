# Qoşa açdı research — current status

Last checkpoint: 2026-11-02T20:57:24+04:00 Asia/Baku.

- Added `simulator/match-scoring-exhaustive-test.js` for the source-derived active-PWA match-scoring adapter; no round-engine or live scoreboard/PWA file changed.
- Node v22.16.0 isolated harness: existing match-scoring regression passed 23 assertions; exhaustive test passed 64,066 assertions (64,089 total).
- Exhaustive coverage: 8,080 non-zero score/delta cases, 101 zero-event cases, 10,201 survivor-ranking pairs, and all 120 five-player explosion orders (360 event steps). Verified engine helper blob: `82e5bd544a57683d5b4f7812b2d4abf80da894`.
- Finding is implementation-only: floor, bust threshold, survivor ranking, and stop-at-two sequence are internally consistent. No physical-rule or tactical conclusion.
- `loneZero=10`, block winner/tie, and physical branch lock/open remain unresolved.
- No new deals, seeds, real traces, or strategy comparisons. Cumulative separate game cohorts unchanged: 88,886 deal allocations, 1,074 selected multi-action positions, 5,863 state-world assignments; no global dedup.
- Exact next: run the committed test in a clean Node checkout when available, then resume branch lock/open and blocked-round winner/tie validation before large strategy batches.

Report: qosha-research/runs/2026-11-02-2057-match-scoring-exhaustive-contract.md
Data: qosha-research/runs/2026-11-02-2057-match-scoring-exhaustive-contract.json
Test: qosha-research/simulator/match-scoring-exhaustive-test.js
