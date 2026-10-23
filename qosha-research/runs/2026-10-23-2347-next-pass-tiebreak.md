# Next-pass same-tile tie-break holdout — 2026-10-23 23:47 Asia/Baku

- Engine/rules: qosa-research-0.5.3 / recovered qosa-1.0.0 (branch locking provisional).
- Mode: 3×9; 300 disjoint seeds 1370940..1371239; 3600 full matched continuations; no counterfactual hidden-world continuations.
- Baseline: min-hand-pips. Challenger: when the baseline selects an ordinary stone, only consider another legal side for **the same stone**, selecting the side with the highest hypergeometric next-player pass probability. Opponents: min-hand-pips or closed-branch-control. Same deals/seats for both strategies.
- Invariant tests: exact hypergeometric fixture, 3-seed deterministic replay, no duplicate visible tiles and full-round termination: passed.
- Key metrics:
  - min-hand-pips: finish-first 0.78 pp ±1.52 pp (exploratory 95% seed-cluster); pips -0.05; changed placements 193/638; immediate predicted/observed next-pass change 20.79 / 21.76 pp.
  - closed-branch-control: finish-first 1.22 pp ±1.12 pp (exploratory 95% seed-cluster); pips -0.11; changed placements 97/318; immediate predicted/observed next-pass change 34.49 / 36.08 pp.
- Finding: No reliable new general strategy rule; do not promote a next-pass tie-breaker.
- Limitations: Uniform unknown tile allocation without conditioning on prior passes or earlier action likelihood; provisional branch locking; no block winner; finish-first not match victory. Intervals exploratory and uncorrected; changing branches may alter more than the next opponent's immediate move. Prior historical samples not merged.
- Reproduce: `node qosha-research/simulator/next-pass-tiebreak-holdout.js test`; `node qosha-research/simulator/next-pass-tiebreak-holdout.js 1370940 300`.
- Data: `runs/2026-10-23-2347-next-pass-tiebreak-1370940-1371239.json`.
- Exact next hypothesis/action: Retest any apparent advantage on disjoint seeds and check locked/open branch rules against a real-game fixture; if inconclusive, test next-pass only as secondary tie-break after own mobility.
- Verified prior cumulative: 290100 full + 532608 paired counterfactual continuations (historical 4000 excluded). This checkpoint adds 3600 matched full continuations and 0 paired counterfactuals.
