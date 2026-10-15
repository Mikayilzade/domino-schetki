# Qoşa açdı — exact first-response replication (2026-10-15 06:51 Asia/Baku)

Rules `qosa-1.0.0`, engine `qosa-research-0.5.3`, mode 3×9, GitHub branch `qosha-research-20261012-first-response`.
New full strategy rounds: **0**. Verified cumulative full strategy rounds: **180,000**, historical 4,000 separate.

Discovery: deal seeds `1260000..1319999`; 5,663 deals scanned; first 25 eligible positions selected, 238 exact hidden allocations, 2,775 candidate continuations, 0 unresolved. Seeds: `1260000,1260035,1260036,1260880,1261007,1261226,1261357,1261933,1262258,1262874,1263163,1263181,1263270,1263372,1263464,1264073,1264104,1264310,1264661,1264826,1264924,1265096,1265398,1265627,1265662`.

Method: compare legal equal-pip connector X-Y vs unrelated single, both preserving X-X and another X connector. All candidates use the **same exhaustive hidden allocations** and deterministic continuation seeds `49000000+1000*dealSeed+lexicographicAllocationIndex`. Uniform hidden allocations within each position; equal weight per position. Policies: `closed-branch-control`, `min-hand-pips`, `fast-doubles`. Differences below are connector minus unrelated.

| Metric | Closed branch | Min pips | Fast doubles |
|---|---:|---:|---:|
| Finish-first delta | -24.40 pp | -23.60 pp | -0.27 pp |
| Remaining-pip delta | +2.297 | +2.273 | +0.405 |
| Beneficial minus-finish delta | -26.67 pp | -25.87 pp | -1.60 pp |
| Block-rate delta | 0 pp | 0 pp | -1.33 pp |
| Next opponent legal options delta | +0.137 | +0.137 | +0.137 |

Next opponent reply: changed 54.27%, pass-flip 35.73%, different tile 13.20%; across 238 allocations: same action 95, pass flip 84, different tile 31, both pass 15, same tile/different side 13. Reply category is a post-action mediator, not a causal control.

Exploratory uncorrected 95% position intervals for finish-first: closed `[-38.58,-10.22]` pp, min pips `[-37.90,-9.30]` pp, fast doubles `[-5.30,+4.76]` pp. The independent GitHub-persisted 2026-10-12 cohort showed -17.28/-17.75/-0.25 pp. Direction repeats for two policies but **not** for fast doubles; this is a model-specific finding, not a universal rule.

Validation: unmodified GitHub runner loaded with 16 dependencies into a V8 CommonJS harness. Its deterministic self-test passed on seeds 1100677 and 1101051 (31 allocations); new 25-position run completed. Node CLI not executed. Reproduce:
```sh
node qosha-research/simulator/exact-first-response-runner.js test
node qosha-research/simulator/exact-first-response-runner.js 1260000 1320000 25
```

Confidence: moderate only for this model/selected positions. Limits: assumed four-branch locked/open rules; uniform hidden allocations ignore prior opponent choices; first-eligible selection; fixed bots; block winner unassigned; exploratory intervals. Exact allocations remove hidden-world sampling error, not position-selection uncertainty. No new full rounds credited.

Next: add category-conditioned outcome and reconstruction tests to the runner, run independent seeds >=1320000 under alternate discovery policy, inspect four-end geometry and forced-pass mechanisms without causal overclaiming. Previous unsaved local 2026-10-15 04:52 checkpoint (40 positions, 358 allocations) remains **unverified in GitHub** and is not merged into this run.
