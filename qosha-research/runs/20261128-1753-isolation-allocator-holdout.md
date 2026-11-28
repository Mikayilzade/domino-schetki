# 2026-11-28 17:53 Asia/Baku — opening isolation allocator holdout

Engine qosha-research-0.5.3; recovered qosa-1.0.0; 3x9, stock consumed. Read README, RULES, EXPERIMENTS, STATUS, both gates and preflight; RESULTS returned empty via connector, including line range, so not overwritten. Standalone run-data checkpoint.

Executed actual GitHub hidden-world sampler and its eight-module dependency closure in isolated V8 CommonJS adapter (no external modules or stubs). Not a native full-checkout gate. Seeds 28000000..28019999 inclusive, 20,000 worlds; zero full gameplay deals or strategy rollouts. Focal hand [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[1,2],[1,3]], known [[1,1]], focal seat 0, sizes [9,9,9], stock 0, opening number 1, turns 1. Synthetic allocation fixture, not a reconstructed actual decision trace.

For each world check 28 unique tiles including known tile; for each unseen double x-x identify its holder and count whether that holder has no other tile containing x. Group by k, number of other hidden x-connectors. Exact probability C(17-k,8)/C(17,8).

| k | observations | isolated | observed | exact |
|---|---:|---:|---:|---:|
|4|40000|2097|5.2425%|1287/24310 = 5.2941%|
|5|60000|1163|1.9383%|495/24310 = 2.0362%|

120,000 inventory/holder checks passed; visible spec unchanged. Observations within a world are correlated; no independent-observation confidence interval asserted. Maximum absolute deviation under 0.10 percentage points. k=0..3 not represented by this fixture. No pass/choice conditioning, branch or scoring assumptions needed. No new strategy finding; confirms narrow allocation prior. Historical 180,000 matched-seat rounds separate; no all-time count. Win/first-place, remainder, round length, block, minus, branch effects and regret not measured. Native gates not executed this run.

Source blob identifiers: hidden-world 6d4d2c3d693a3d9b66a3d21c7f0d65474292a3e2; engine 82e5bd544a57683d5b4f7812beb2d4abf80da894; round-driver fbaad78865adbddde1ea6651e6a501dc0bde3203; turn-kernel 94657896e1f8e471ceb2e9a65d1842b6102dff18; turn-dispatcher 55b0bcf3f1653c64b4e06bc95d7e917a480562a0; decision-regret decf4ae09705176a2ea4eb9759457622a2a57294; strategy-runner b7078942bc8f5dac6a8b07494ae8aaeadbdb1f5f; initializer 2fad29e516454580ec9a06115354e9866f3096e6.

Next: native complete pinned checkout and gates remain priority; if unavailable, use this dependency closure to execute matched-seed provisional strategy diagnostics only after relevant invariant tests, or test allocator k=0..3 with distinct visible fixtures. Branch unlock, block allocation, loneZero remain provisional. No live PWA or Actions changes.
