# Public next-pass policy — matched-seed holdout (2026-10-18 03:54 Asia/Baku)

Engine `qosa-research-0.5.3`, rules `qosa-1.0.0`, 3 players × 9 tiles. **12,000 complete rounds**, four 3,000-round tournaments, zero unresolved, 785 blocks. Independent seed cohorts `1061000..1061999` and `1062000..1062999`; three seat rotations per seed. Previously documented 186,000 full strategy rounds remain separate; cumulative 198,000 with this experiment (historical 4,000 excluded). Executed in V8 CommonJS harness, not Node CLI.

Arm A: `public-next-pass` / `public-no-pass` / `closed-branch-control`. Arm B: `public-next-pass` / `public-no-pass` / `min-hand-pips`. First two strategies use identical immediate-finish priority and opening/pip/key tie-breaks, except that the pass-aware strategy first maximizes exact next-player pass probability. Publicly played tiles are inferred as complement of all remaining stones; only that public set, focal hand and opponents' hand sizes enter the decision. For each legal action: unknown pool N; legal unknown tile count m; next opponent hand size k; exact P(pass)=C(N-m,k)/C(N,k). Tests: deterministic replay, 28-tile conservation, hidden-opponent tile swap invariance; all passed in V8.

| Cohort | Arm | Pass-aware finish-first | No-pass finish-first | Third bot | Mean remaining pips (pass/no-pass) |
|---|---|---:|---:|---:|---:|
| 1061000..1061999 | A | 38.03% | 23.23% | 31.90% | 5.63 / 7.32 |
| 1061000..1061999 | B | 41.63% | 28.30% | 23.50% | 4.90 / 6.39 |
| 1062000..1062999 | A | 36.97% | 24.60% | 32.17% | 5.75 / 7.03 |
| 1062000..1062999 | B | 41.20% | 28.53% | 23.77% | 4.83 / 6.47 |

Blocks 205 / 197 / 188 / 195; mean turns 26.68 / 26.28 / 26.73 / 26.26. Pass-aware −10 counts 236 / 291 / 258 / 323; −20 counts 30 / 31 / 18 / 17; −30 counts 3 / 2 / 0 / 0; −40 none. No-pass −10 156 / 188 / 165 / 208; −20 10 / 14 / 7 / 12; −30 0 / 0 / 1 / 1. Pass-aware differed from no-pass at 4374 / 4949 / 4325 / 4896 non-finishing decisions. No-pass's mean immediate pass-probability gap was 4.9–5.1 percentage points.

**Provisional finding:** prioritizing exact public next-player pass probability beat the identical no-pass comparator in all four matched arms/cohorts by **12.4–14.8 percentage points** in finish-first rate. This is NOT a match-win metric: block winners unassigned. It is not a human-game causal rule: opponents are simple deterministic bots, uniform hidden worlds ignore earlier opponent actions, branch rules are assumption-labelled, and geometry changes alongside pass probability. Historical RNG not seed-compatible. Full continuation decision regret not measured (immediate pass gap is a separate proxy).

Code: `simulator/public-pass-tournament.js`. Reproduce `node qosha-research/simulator/public-pass-tournament.js test`, then `node qosha-research/simulator/public-pass-tournament.js 1061000 1000` and `... 1062000 1000`; compare both arms per cohort. Raw summary includes starting/ending doubles, double ownership and branch-opening counts.

**Exact next action:** verify Node CLI replay, compare against stronger opponent mixes on fresh seeds, and measure full-continuation paired regret at divergent choices; then condition hidden distributions on observed passes.
