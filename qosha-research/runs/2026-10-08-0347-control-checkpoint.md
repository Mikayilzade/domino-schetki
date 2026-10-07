# Qoşa checkpoint — 2026-10-08 03:47 Asia/Baku

Engine qosa-research-0.5.3; rules qosa-1.0.0; 3x9. Full-round cumulative remains 180,000; 0 new full rounds.

Saved: simulator/pattern-control-runner.js; runs/2026-10-08-pattern-control-100-400.json (12+12 positions, 40 worlds, 2 policies); runs/2026-10-08-pattern-control-holdout-summary.json (20+20 positions, 60 worlds, 2 policies). Seed sets 100..399 and 400..799, hidden seed 980000+1000*dealSeed+worldIndex. New: 6,720 policy-world evaluations / 3,360 distinct position-world allocations.

Holdout preserve X-X+X-Y vs spend X-X: finish-first gain under closed-branch-control +23.54 pp for 3+ X and +15.31 pp for exactly 2 X; under min-hand-pips +17.33 pp and +22.56 pp. Extra-X contrast flips sign across policies (+8.23 pp vs -5.23 pp); same sign pattern on discovery seeds. No universal 3+ X advantage established.

V8 regression execution passed pattern-choice, hidden-world, decision-regret and inline control determinism. Node CLI not run. Assumption-labelled branch semantics; observational nonmatched control positions, first-eligible selection, limited positions.

Next: match controls by hand size/branch ends/opponent counts; add persisted control regression; replicate on disjoint seeds and another continuation policy.
