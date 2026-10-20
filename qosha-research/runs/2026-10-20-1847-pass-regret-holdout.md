# 2026-10-20 18:47 (+04) — independent pass-conditioned regret holdout

- Engine/rules: qosa-research-0.5.3 / qosa-1.0.0 (branch semantics provisional); primary 3 players x 9 tiles.
- Reproduction: `node qosha-research/simulator/pass-disagreement-regret.js 1304000 1304750 60 100 28`; first disagreement per seed; 304 seeds scanned, 60 positions, 100 identical hidden worlds per candidate, 6000 allocations, 58200 candidate continuations, 0 unresolved. Seed mixing and hidden allocation as in `pass-disagreement-regret.js` and `pass-conditioned-sampler.js`. Two continuation policies: min-hand-pips and closed-branch-control.
- Regression: `pass-conditioned-sampler.test()` passed in V8 CommonJS harness; Node CLI not run.
- Joint-pass choice minus one-pass choice, equal weight per position, finish-first:
  - min-hand-pips: -4.52 percentage points; exploratory position-cluster 95% CI -10.96..+1.92; positive/negative/tie 23/25/12.
  - closed-branch-control: -8.33 pp; exploratory CI -14.38..-2.29; positive/negative/tie 14/34/12.
- Remainder joint-minus-one: +0.3355/+0.3740 pips; intervals cross zero. Minus-finish joint-minus-one: -1.97/-5.77 pp (second exploratory CI -9.28..-2.25).
- Action-type stratification (closed-branch continuation): single->single n=34, -10.03 pp; single->double-sequence n=18, -14.83 pp; double-sequence->double-sequence n=8, +13.50 pp. These small strata are exploratory, not causal.
- Finding: independent changed-decision holdout favors the one-pass choice under branch-control continuation. This is NOT proof that two-pass inference is intrinsically harmful: the selection is on disagreement, bots are fixed, branch semantics are assumed, and the one-pass/joint policies also choose different branch/double actions. The 95% interval is exploratory without correction for multiple tests.
- Cumulative: prior verified 264900 full continuations on separate branch, unchanged; this run adds 6000 hidden allocations and 58200 paired candidate continuations, not full strategy rounds. Keep counters separate.
- Next: independent alpha20/28/36 matched-position ablation; isolate additional double opening and branch effects. Preserve original candidate/world data and compare against alternate continuation bots. No scoreboard/PWA files touched.
