# 2026-10-22 15:46 (+04) | mobility full-deal checkpoint
Engine: qosa-research-0.5.3. Rules: recovered qosa-1.0.0, provisional branch opening. Mode: 3 players x 9 tiles.
Seeds: 1353840..1354639, 800 deals, three focal seats, two opponent bots (min-hand-pips and closed-branch-control), two focal policies. 9,600 complete deterministic continuations; zero unresolved.
Focal baseline: min-hand-pips. Challenger: on the same branch, play connector X-Y instead of U-Y while retaining X-X and another X-linked tile, but only if X-X is openable, pip cost <=2 and immediate own playable-tile count improves.
Min-pips opponents: 9 overrides in 2400 paired seats; finish-first difference 0.000 percentage points; mean remainder difference +0.0017 pips; exploratory seed-cluster 3SE [-0.177, 0.177] pp.
Branch-control opponents: 1 override in 2400 paired seats; finish-first difference -0.0417 pp; mean remainder +0.0008 pips; 3SE [-0.167, 0.083] pp.
Finding: only 10 actual overrides in 4800 paired seats. No reliable general win benefit; previous selected-position signals cannot be generalized to complete rounds.
Validation: V8 CommonJS deterministic replay passed on 80 seeds/960 continuations; Node CLI not run. Fixed deterministic bots; no block winner; immediate mobility is not realized future-turn mobility. No historical or quarantined samples mixed.
Cumulative after this run: 399300 full continuations and 440060 separate counterfactual continuations.
Next: persist executable full-deal runner, execute Node CLI, preregister broader trigger to obtain >=100 changed decisions on independent seeds and measure realized next-turn mobility.