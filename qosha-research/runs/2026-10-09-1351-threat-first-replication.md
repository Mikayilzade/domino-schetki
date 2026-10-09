# Independent frozen-threshold replication — 2026-10-09 13:51 Asia/Baku

- Engine/rules: `qosa-research-0.5.3` / recovered `qosa-1.0.0`; primary 3 players × 9 stones. No gameplay changes.
- Run: 48 distinct reachable positions, 2,400 sampled hidden worlds (25 training and 25 disjoint evaluation per position), 7,200 paired forced continuations, zero new complete strategy rounds.
- Deal seed scans: closed-branch-control 222000..227999, min-hand-pips 228000..233999; quota 12 positions per discovery-policy × mobility-direction group. Exact selected seeds in JSON. World seeds `14000000+1000*dealSeed+worldIndex`.
- Frozen policy: when next opponent has exactly one tile, estimate its immediate-finish risk from training worlds; switch from own mobility-aligned placement of the same X-Y tile to the other open end only if risk falls by at least 12 percentage points.
- Overrides: 18/48. Out-of-sample immediate-finish risk change: -11.83 pp; exploratory position-clustered 95% CI [-16.78 pp, -6.89 pp].
- Focal finish-first change (threat-first minus mobility), 95% CI: closed-branch-control -1.33 pp [-6.92 pp, 4.25 pp]; min-hand-pips -1.33 pp [-6.92 pp, 4.25 pp]; random-legal -0.17 pp [-5.62 pp, 5.29 pp].
- Focal mean remainder change: -0.169 pips (closed-branch-control and min-hand-pips), -0.111 (random-legal). Round length +0.408 turns for first two policies.
- New finding: immediate opponent threat reduction replicates independently, but there is **no reliable finish-first improvement**; no general recommendation to prioritize immediate threat over own mobility.
- Validation: deterministic baseline self-test passed (seed 210009); run completed in V8 CommonJS harness, not Node CLI. Complete reproducibility: `node qosha-research/simulator/threat-first-replication.js 12 25 25`.
- Confidence/limits: moderate for reduction in immediate risk in this simulated setting; weak for any win-rate improvement. Assumed branch opening/locking; simple deterministic bots; no assigned block winner; hidden allocations ignore opponent pass history; first-eligible selection; exploratory unadjusted CIs clustered by position; next opponent only.
- Previous GitHub-verified scale: 180,000 full strategy rounds and 73,010 hidden worlds (plus 400 separate provisional pilot worlds). This adds 2,400 hidden worlds, giving **75,410** reproducible worlds. Historical 4,000 strategy rounds separate.
- Exact next action: identify conditions under which risk reduction changes finish-first rate; test both opponents at one tile on fresh seeds and consider block-risk consequences.
- Data: `runs/2026-10-09-1351-threat-first-replication.json`; code: `simulator/threat-first-replication.js`.
