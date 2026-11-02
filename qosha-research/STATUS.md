# Qoşa açdı research — current status

Last checkpoint: 2026-11-02T19:54:23+04:00 Asia/Baku.

- Read-only inspected the active PWA script chain and added `simulator/match-scoring.js` as a source-derived compatibility adapter; no round-engine change.
- Node v22.16.0: `match-scoring-test.js` passed 23 assertions. The exact research `engine.js` blob hash was verified before running in an isolated temporary directory.
- Active PWA code uses bust threshold 101, score floor 0, and a result gate at <=2 survivors; two survivors receive 2/1 points by ascending score. The one-survivor 3-point branch is an implementation-only edge and is not reached from a normal 3+ player sequence that stops at two.
- `index.html` does not load `app.js`, `qosha-rules.js`, or `qosha-101.js`; the latter is a legacy target-win variant and is not mixed with active bust behavior.
- Help text says a gosha finish removes 10, but the exact mapping to `loneZero=10` and the qualifying hand/finish remain unresolved.
- No new deals, seeds, real traces, or strategy comparisons. No tactical finding and no strategy promoted.
- Cumulative separate game cohorts unchanged: 88,886 deal allocations, 1,074 selected multi-action positions, 5,863 state-world assignments; additive summaries, no global dedup.
- Exact next: treat gosha-finish −10 as a separate hypothesis requiring a concrete fixture; continue authentic branch-lock/open and block winner/tie validation before large strategy batches.

Report: qosha-research/runs/2026-11-02-1954-live-pwa-match-scoring-contract.md
Data: qosha-research/runs/2026-11-02-1954-live-pwa-match-scoring-contract.json
Test: qosha-research/simulator/match-scoring-test.js
