# Qoşa independent exact next-player mobility holdout — 2026-10-18T21:02 +04:00

- Engine `qosa-research-0.5.3` / rules `qosa-1.0.0`; primary 3×9, later round. Test: `node qosha-research/simulator/late-open-number-independent.js test` passed in V8 CommonJS harness (not Node CLI).
- Reproduce: `node qosha-research/simulator/late-open-number-independent.js 1260000 145000 48 40`.
- Deal seeds scanned `1260000..1349936` (89937 deterministic deals), 48 first-eligible positions; 1920 hidden allocations, 7680 forced continuations, zero new full strategy rounds. Previous reported full-round scale **215,520** (unchanged; historical separate).
- Matched connector-vs-control actions spend equal pips and leave equal number of accessible ends; same worlds and two policies (`closed-branch-control`, `moderate-double-hold`). Prior-to-outcome exact hypergeometric sign groups: connector reduces next-player play probability by >=5pp, increases by >=5pp, or changes <5pp.
- All 48: first-place delta connector minus control **-1.04 pp / -0.31 pp** (no overall advantage).
- Restrict group n=7: exact next-play delta -60.88 pp; first-place **53.21 pp / 60.71 pp**; remainder delta -4.04 / -3.95 pips.
- Enable group n=10: exact next-play delta 34.32 pp; first-place **-42.00 pp / -44.50 pp**.
- Neutral group n=31: first-place -0.08 pp / 0.16 pp. Exact-vs-sampled mobility delta MAE 2.35 pp.
- Finding: the sign of next-opponent immediate legal-play opportunity replicates as a strong **conditional predictor** on independent deal seeds; preserving a connector is NOT generally beneficial. Do not treat conditional association as causal or a universal move rule.
- Confidence/limitations: only 7 restricting and 10 enabling positions, selection by first eligible state, 40 worlds/position, uncorrected exploratory position CIs, fixed bots, assumption-labelled branch rules, unconditioned opponent histories, block winner unassigned. The 48 include the first 24 from this *same* new seed set (not a second independent replication); disjoint from the prior 1.2m seed set.
- Exact next hypothesis/action: fresh independent seed range, stratify by exact end-number identity and next-player hand size; test third-player mobility and posterior conditioning on earlier passes.
- Raw per-position paired metrics and exact combinatorial mobility: `runs/2026-10-18-2054-open-number-independent.json`.
