# Qoşa açdı — independent next-pass holdout

Timestamp (Asia/Baku): 2026-10-13 01:50 (+04).
Engine/rules: qosa-research-0.5.3 / qosa-1.0.0; mode: 3 players x 9 tiles.
Runner: qosha-research/simulator/next-pass-forecast-runner.js.
Reproduce: node qosha-research/simulator/next-pass-forecast-runner.js 1720000 1840000 30
Seeds: scan 1720000..1839999; 6240 deals scanned, 30 eligible positions.
Selected seeds: 1720018,1720092,1720155,1720317,1720432,1720451,1720497,1720579,1720731,1720985,1721139,1721255,1721406,1721442,1721602,1722075,1722777,1723200,1723624,1723969,1725249,1725309,1725435,1725694,1725731,1725737,1725861,1725989,1726122,1726239.
Seed formula for continuations: 61000000+1000*dealSeed+lexicographicAllocationIndex.
264 exact hidden allocations, 3111 candidate continuations; 0 new complete strategy rounds.
Strategies: closed-branch-control; min-hand-pips; fast-doubles. All candidate moves evaluated on matched hidden worlds.
Next-opponent pass forecast: connector higher in 12 positions, unrelated higher in 10, tie in 8.
For 22 non-ties, choosing the higher-pass option instead of the lower-pass option yielded first-to-finish differences:
- closed-branch-control: +22.42 pp (exploratory position 95% CI +2.97..+41.88); better/worse/tie positions 8/2/12;
- min-hand-pips: +20.91 pp (CI +1.61..+40.21); 7/2/13;
- fast-doubles: +1.52 pp (CI -1.05..+4.08); 2/1/19.
Distinct contrast, connector minus unrelated over all 30 positions: -20.67 pp (closed branch), -19.56 pp (min pips), -2.00 pp (fast doubles).
By next opponent remaining hand size (closed-branch): h=1 n=3 +33.33 pp; h=2 n=19 +20.70 pp. Subgroups underpowered.
Finding: an independent sample supports a *provisional model-specific association* between next-player pass probability and first-to-finish advantage against two policies, but not the fast-doubles policy. Do not infer a general causal human-play rule.
Validation: V8 CommonJS harness loaded 13 repository modules; deterministic self-test passed on seeds 1450177,1450360 (13 exact worlds). No Node CLI run. Source state unchanged; no live scoreboard/PWA edits.
Limitations: uniform hidden allocations not conditioned on opponent history; bot continuation; assumed branch semantics; first-eligible selection; exploratory intervals; block winner not assigned.
Cumulative validated complete strategy rounds: 180000 (historical 4000 separate); exact hidden worlds not merged with full rounds.
Exact next hypothesis/action: fresh disjoint 50+ positions; evaluate max-pass choice against direct max-finish-first choice using train/holdout hidden worlds, stratify by remaining opponent stones and changed branch ends, and incorporate observed pass history.
