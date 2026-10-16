# 2026-10-16 18:50 Asia/Baku — independent min-pips double-retention holdout

Engine qosa-research-0.5.3; recovered rules qosa-1.0.0 (branch semantics provisional); primary mode 3 players x 9 stones. V8 CommonJS run of GitHub simulator modules; Node CLI not run. Deterministic 2-position / 2-world replay self-test passed. No unresolved continuations.

Hypothesis: at a reachable choice with X-X and an X-Y connector, compare opening X-X immediately versus playing a legal ordinary stone that preserves both X-X and a connector. Discover first eligible position per deal using min-hand-pips (independent of the previous closed-branch-control discovery), choose lexicographically first legal action key in each class. Identical fixed-visible hidden worlds and continuation policies for both actions. All reported deltas = keep minus open; equal weight per position.

Cohort A: deal seeds 300000..300499; 33 scanned, 30 selected; 30 worlds/position = 900 sampled worlds; 5,400 candidate continuations. World seeds = 96000000 + 1000 * dealSeed + worldIndex. Selected seeds: 300000,300001,300002,300003,300004,300005,300006,300007,300008,300009,300010,300012,300013,300014,300015,300016,300019,300020,300021,300022,300023,300024,300025,300026,300027,300028,300029,300030,300031,300032.
- Finish-first delta: closed-branch-control +15.89 pp (exploratory position 95% CI +8.94..+22.84); min-hand-pips +19.78 pp (+12.47..+27.09); fast-doubles +21.44 pp (+11.63..+31.25).
- Focal remainder delta: -1.292 / -1.047 / -0.930 pips, respectively.
- Next-clockwise-player forced pass: keep minus open +11.67 pp; pass status differed in 111/900 hidden worlds.
- Next-player number of legal actions: keep minus open -2.269 (geometry/number opening confound).

Cohort B: deal seeds 330000..330499; 33 scanned, 30 selected; 900 sampled worlds; 5,400 candidate continuations. World seeds = 97000000 + 1000 * dealSeed + worldIndex. Selected seeds: 330000,330001,330003,330004,330005,330006,330007,330008,330009,330010,330012,330013,330014,330015,330016,330017,330018,330019,330020,330021,330022,330023,330024,330025,330026,330028,330029,330030,330031,330032.
- Finish-first delta: closed-branch-control +20.33 pp (CI +13.91..+26.76); min-hand-pips +14.78 pp (+8.60..+20.95); fast-doubles +16.67 pp (+8.37..+24.97).
- Next-player forced pass +10.00 pp; pass status differed in 94/900 worlds.
- Next-player legal actions delta -1.901.

Cumulative new sample: 60 positions, 1,800 hidden worlds, 10,800 candidate continuations, zero new full-round strategy samples. Verified prior cumulative complete strategy rounds remains 186,000; historical 4,000 separate. No old/quarantined samples credited.

Method details: uses existing pattern-paired-runner.eligibleGroups, initializer.initializeThreePlayerRound, round-driver.stepRound, hidden-world.sampleWorld and connector-equal-pip-runner.force. Discovery policy min-hand-pips; continuations closed-branch-control/min-hand-pips/fast-doubles. Focal hand/known tiles fixed, unknown opponent tiles resampled. The standalone driver source and raw rows could not be committed in this pass because GitHub rejected the batch write; these are a reproducibility gap, not a verified fully persisted dataset. The numeric summaries were executed and are provisional until standalone driver and raw rows are persisted.

Finding: preserving X-X plus a connector wins more often than opening X-X in these two independent model-specific cohorts. Opening X-X itself changes branch legality, opponent mobility and tempo, so this is NOT an isolated connector effect or a universal human strategy. Unconditioned hidden allocations, first-eligible selection, repeated allocations, bots, exploratory CIs, block winner unassigned and provisional branch rules remain limitations.

Exact next action: persist a standalone driver plus per-position JSON, replay both seed sets in Node; then test matched non-pattern controls with comparable post-action branch geometry and next-player legal mobility.
