# 2026-10-16 23:45 Asia/Baku — independent min-pips connector/next-response holdout

Engine `qosa-research-0.5.3`; recovered `qosa-1.0.0`, 3×9. No gameplay-rule changes.
Discovery: `two-opponent-conditional-holdout.collect(650000,690000,24)` (min-hand-pips, first eligible equal-pip connector vs unrelated single; X-X and another connector retained). 6,957 eligible/ready deal seeds scanned; selected 24 positions:
650140,650218,650730,651314,652154,652428,652688,652861,653021,653053,653058,653707,653873,654059,654288,654322,654760,655263,655970,656061,656378,656583,656741,656956.

Fixed-visible hidden worlds: 25/position, `seed=67000000+1000*dealSeed+worldIndex`, index 0..24. Total 600 sampled worlds, 3,600 forced continuations (2 candidate actions × 3 continuation bots × 600 worlds), 0 unresolved. Deterministic V8 CommonJS two-position/two-world replay PASS; Node CLI NOT executed.

Paired differences **connector minus unrelated**; equal weight per position:
- closed-branch-control: first-finish **−19.17 pp** (exploratory position-normal 95% interval −34.79..−3.54 pp); remaining pips **+2.180**; minus finish **−17.83 pp**.
- min-hand-pips: first-finish **−20.00 pp** (−35.17..−4.83 pp); remaining pips **+2.158**; minus finish **−19.50 pp**.
- fast-doubles: first-finish **+1.50 pp** (−0.65..+3.65 pp); remaining pips **+0.347**; minus finish 0.00 pp.
- next clockwise opponent: connector-minus-unrelated immediate pass **−6.00 pp** (interval includes zero); distinct playable tiles **+0.107** (interval includes zero); same selected response tile **54.83%**, including **12.00%** both-pass worlds.
- branch geometry: connector action left **fewer accessible branch ends in all 24 positions**; no equal/more-end control in this cohort.
- X=0 in 22 positions; X>0 in 2. Do NOT infer number-specific effects.

Finding: under two bots, spending the connector underperforms on first-finish despite no reliably larger immediate next-opponent pass rate. This is consistent with future access/branch geometry mattering, but is NOT causal proof. Fast-doubles does not replicate the disadvantage.

Reproducibility: a V8 CommonJS in-memory runner used persisted `connector-response-geometry-runner.geometry/nextResponse`, `connector-equal-pip-runner.force`, `hidden-world.sampleWorld`, and min-pips `two-opponent-conditional-holdout.collect`; candidate keys `pair.connector` and `pair.other`; the exact seed list/formula above. Standalone runner and per-position raw rows were attempted but the GitHub multi-file commit was rejected; **this checkpoint is summary-only and must not be presented as full raw-data reproducibility**.

Verified previous full strategy rounds: **186,000**, historical 4,000 separate; this run adds **0** full rounds. Hidden worlds never count as full rounds.

Limitations: first-eligible selection, 24 position clusters, hidden worlds unconditioned on earlier opponent actions, deterministic bots, provisional branch opening, unassigned block winner, exploratory intervals, all 24 positions differ in accessible branch ends. No universal human-play rule.

Exact next action: persist a standalone min-pips response runner with full per-position JSON; rerun the same seeds for byte-level replay, execute Node CLI tests, then seek a fresh cohort with equal accessible ends to isolate geometry and investigate fast-doubles exception.
