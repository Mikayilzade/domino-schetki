# Independent pass-vs-win holdout — 2026-10-13T12:56:00+04:00 Asia/Baku

Engine `qosa-research-0.5.3` / recovered `qosa-1.0.0`; 3×9.
Seeds 2500000..2699999; scanned 17750, selected 80 positions, 782 exact hidden allocations, 8877 paired candidate continuations; 0 unresolved. No new complete rounds; verified cumulative remains 180,000 full strategy rounds, historical 4,000 separate.
Compared analytic next-opponent pass probability against a winner-trained choice, trained on one deterministic half of hidden allocations and evaluated on the disjoint held-out half; matched worlds, seeds and continuation bots. 59 informative positions; 44 have >=8 exact worlds.

## Winner-trained minus higher-pass: held-out finish-first
- closed-branch-control: n=59, changed 2, gain 2.03 pp, exploratory 95% CI -0.92 pp .. 4.98 pp; >=8 worlds n=44, changed 2, gain 2.73 pp, CI -1.22 pp .. 6.67 pp.
- min-hand-pips: n=59, changed 2, gain 2.03 pp, exploratory 95% CI -0.92 pp .. 4.98 pp; >=8 worlds n=44, changed 2, gain 2.73 pp, CI -1.22 pp .. 6.67 pp.
- fast-doubles: n=59, changed 0, gain 0.00 pp, exploratory 95% CI 0.00 pp .. 0.00 pp; >=8 worlds n=44, changed 0, gain 0.00 pp, CI 0.00 pp .. 0.00 pp.

Four-end geometry: changed-end counts {"2":80}.
Finding: winner-trained selection rarely disagrees with next-pass heuristic; positive point estimate does not establish reliable held-out superiority. No new general gameplay rule.
Validation: V8 CommonJS self-test passed; first two rows replay exactly; Node CLI not run.
Confidence/limitations: uniform exact hidden allocations, small train halves, first-eligible position selection, assumed branch-opening rules, deterministic bots, no block winner, uncorrected exploratory intervals; opponent prior passes not conditioned on. Do not interpret post-action reply categories causally.
Exact next: independent 2700000+ seeds; seek >=8-world genuine decision disagreements and evaluate observed-pass-conditioned posterior. No live scoreboard/PWA files touched.
Reproduce: `node qosha-research/simulator/pass-vs-win-split-runner.js 2500000 2700000 80`.
Data: `runs/2026-10-13-1252-pass-vs-win-independent-2500000.json`.
