# Qoşa açdı: independent pass-choice holdout — 2026-10-16 00:49 Asia/Baku

Engine: qosa-research-0.5.3; rules: recovered qosa-1.0.0, provisional branch opening; 3×9. Seeds 770000..779999 (10,000 scanned); 27 reachable positions, 233 exact hidden allocations, 3,540 candidate continuations, all legal actions, three policies: closed-branch-control, min-hand-pips, fast-doubles. No new complete strategy rounds. Validated cumulative complete strategy rounds: 180,000; historical 4,000 separate. Unpersisted 750000..769999 is not counted.

Retained-pass conditioning changed hidden-world support in 5 of 27 positions. Closed-branch-control: 1 changed recommendation, 1 strict reversal, +2 actual-world pips saved. Min-hand-pips: 0 changes. Fast-doubles: 2 changed recommendations, 1 strict reversal, +1 actual-world pip saved. Both strict reversals at seed 773582 (21 exact allocations before, 6 after, 5 legal actions). Seed 773507 was only a tie-break change. No finish-first or minus outcome improvement was observed for changed recommendations.

Continuation seeds: 61000000 + 1000*dealSeed + lexicographicAllocationIndex. Ranking: maximize finish-first rate, minimize expected remainder, maximize minus-finish rate, then actionKey tie break. Compare identical exact hidden worlds and policies before/after conditioning. True-world outcome used only for retrospective regret diagnostics, not selecting the move.

V8 CommonJS deterministic regression at seed 773582 passed twice (true deal present, exact candidate coverage, immutable source state, monotone posterior); Node CLI not run. The executable runner and per-position raw JSON are not yet persisted: this checkpoint is descriptive, NOT fully reproducible from repository alone.

Limitations: only 5 posterior-changing positions; first-eligible selection; equal hidden allocation prior; deterministic bots; no likelihood for voluntary plays; provisional branch semantics; block winner unassigned. No statistically reliable general strategy rule.

Next: persist executable all-legal-actions posterior runner and raw data; independent holdout 780000..899999; separate strict preference flips from tie-breaks and measure out-of-sample true-world regret.
