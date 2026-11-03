# Qoşa açdı research — current status

Last checkpoint: 2026-11-03T09:49:17+04:00 Asia/Baku.

- Latest checkpoint: deterministic mixed-finish contract audit for the recovered qosa-1.0.0, 3×9 coded model.
- Exhaustively applied 33 mixed-finish sequence orderings across 1–4 closing doubles; new test passed 1,095 assertions. Score-floor integration covered 408 score/magnitude pairs.
- Existing checks rerun: finish-minus integration passed; score-floor contract passed 41,237 assertions; four-branch lock fixture passed with 24 four-double orderings.
- No deals, seed draws, strategy comparisons, or strategy promotion in this run. Finding is internal implementation consistency only; physical rules remain unauthenticated.
- Unresolved: physical branch lock/open semantics, block winner/tie allocation, and loneZero=10.

Cumulative independent cohorts remain separate: block audit 6,000 seed draws / 144,000 model-rounds; tie-break ablation 2,120 seed draws / 12,720 paired rounds; prior allocation/state-world/multi-action cohorts and 5,000 smoke rounds unchanged. No historical-baseline pooling.

Exact next action: validate draw-one-then-play/pass when a drawn tile enables a double sequence or mixed finish; test stock consumption, pass counter, hand conservation, and finish precedence.

Report: qosha-research/runs/2026-11-03-0949-mixed-finish-exhaustive-contract-audit.md
Test: qosha-research/simulator/mixed-finish-exhaustive-contract-test.js
