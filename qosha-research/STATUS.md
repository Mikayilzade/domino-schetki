# Qoşa açdı research — current status

Last checkpoint: 2026-11-02T21:47:47+04:00 Asia/Baku.

- Added `simulator/block-seat-permutation-test.js`, a seat-order metamorphic regression for coded block diagnostics. It covers 3-player unique/tied minima and 5-player unique-zero/tied minima with unique tile identities in each fixed fixture.
- An independent standalone JavaScript property harness passed 1,524 assertions across 252 seat permutations. It checks candidate-set mapping, remainder order, no inferred block winner/minus, and the 3-/5-player empty-stock pass thresholds.
- The repository Node test was not executed: a clean GitHub checkout failed because this runtime could not resolve github.com. Do not report the standalone harness as execution of repository modules.
- No new deals, seeds, real traces, or strategy comparisons. No tactical finding and no strategy promoted.
- Cumulative separate cohorts unchanged: 88,886 deal allocations, 1,074 selected multi-action positions, 5,863 state-world assignments; no global dedup.
- Block winner/scoring/tie, physical branch lock/open, and `loneZero=10` remain unresolved.
- Exact next: run the committed Node test and existing block/branch regressions in a clean checkout; preserve block scoring as labelled alternatives until table evidence resolves it.

Report: qosha-research/runs/2026-11-02-2147-block-seat-permutation-audit.md
Data: qosha-research/runs/2026-11-02-2147-block-seat-permutation-audit.json
Test: qosha-research/simulator/block-seat-permutation-test.js
