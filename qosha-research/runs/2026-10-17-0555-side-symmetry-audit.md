# Side-label symmetry audit — 2026-10-17 05:55 Asia/Baku

Engine: qosa-research-0.5.3; recovered qosa-1.0.0; 3×9; no rules changed.
Seed cohorts: 840000..840149 (turn>=6), 850000..850149 independent holdout (turn>=6), 860000..860149 (turn>=15).
Selection: first reachable same tile playable on two branches with identical end number, per deal, closed-branch-control discovery.
Positions: 148 + 150 + 144 = **442**; paired forced continuations **5,304**; new full strategy rounds **0**; verified cumulative **201,000** full rounds (historical 4,000 separate).
Continuation policies: closed-branch-control, min-hand-pips, fast-doubles. Each forced action continued twice with original side-name tie break and twice with side-free tie break. Same complete deal and deterministic policy for both choices.
Independent holdout (n=150), counts of differing *full final states* with original tie break: branch-control **35**, min-pips **67**, fast-doubles **79**. Differing focal first-finish outcomes: **9 / 13 / 16**. With side-free tie break: **0 differences for every policy in all 442 positions**. Discovery and late cohorts also 0 symmetry failures.
Finding: in the current side-symmetric kernel, playing the SAME tile on two branches with identical end value is geometrically equivalent. The original strategy-runner.js stableKey includes the physical side label; its arbitrary tie break creates apparent move-regret differences that disappear under side-invariant continuation. This is a **simulator artifact**, not evidence that a human should prefer left/right/up/down.
Validation: deterministic GitHub-sourced V8 CommonJS execution and 8-position replay passed; Node CLI not run.
Confidence: high for this model-specific symmetry audit; limited by provisional branch semantics, full-known worlds, first-eligible selection, deterministic bots, and unassigned block winner.
Next: persist an executable side-symmetry regression, adopt optional side-free policy tie break without changing baseline defaults, then rerun the matched 810000..814999 full-round tournament to test ranking robustness. Do not touch scoreboard/PWA.
