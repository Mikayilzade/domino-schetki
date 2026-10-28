# 2026-10-28 14:48 (+04) — both doubles owned, matched legal opening choices

Engine qosa-research-0.5.3 + opening-both-doubles-owned-1.0; rules recovered qosa-1.0.0 first-round 3x9; both branch models provisional.
Deal seeds 2618000..2677999 (60000 deals; 57898 valid, 5661 eligible); hidden seeds 2678000..2697199 (19200 allocations; 600 positions x 32 worlds). No new complete rounds or full-game continuations. Both compared connectors are legal and both corresponding doubles are owned by focal player. First-opponent pass rates are mathematically identical for each pair.

Policies: high/low-pip legal choice, single tile vs optional multi-double chain (max four); matched hands, hidden worlds and policy. Lower-X versus higher-Y changes pip cost and branch end.

| Policy | Lower-X opp stones | Higher-Y opp stones | Lower-minus-higher (95% exploratory position-cluster CI) | Return mobility difference | First pass difference | Branch-model differences (moves/return) |
|---|---:|---:|---:|---:|---:|---|
| high-single | 1.83672 | 1.83672 | 0.00000 [0.00000, 0.00000] | 0.00000 | 0.00000 | 0/0 |
| high-chain | 1.83672 | 1.83672 | 0.00000 [0.00000, 0.00000] | 0.00000 | 0.00000 | 0/0 |
| low-single | 1.83755 | 1.83755 | 0.00000 [0.00000, 0.00000] | 0.00000 | 0.00000 | 0/0 |
| low-chain | 1.83755 | 1.83755 | 0.00000 [0.00000, 0.00000] | 0.00000 | 0.00000 | 0/0 |

Tests: canonical 0-1, locked branches, no ordinary-plus-double append, two-double sequence, 28-tile conservation, 100 seed replays, three independent exact 48,620-partition checks of equal first-pass rates. These tests are model-internal, not proof of physical late-arrival branch semantics.

Finding: the first-pass advantage disappears when both doubles are owned (by construction). Two-opponent differences, if any, can reflect connector value/geometry and opponent policy; **no validated win-rate advantage**. Neither branch model is authenticated; report return mobility as provisional. First 600 eligible deals and closest-owned-pair selection bias; not representative of all positions. No complete-game wins, median pips, block rate, minus frequencies or regret measured.

Cumulative separate categories: 1,380,975 incompatible-model complete rounds unchanged; 1,898,856 forced continuations unchanged; 490000 opening deals; 626200 hidden allocations. Historical 4,000 separate. Next unused seed >= 2697200.

Reproduce: `node qosha-research/simulator/opening-both-doubles-owned.js test`; `node qosha-research/simulator/opening-both-doubles-owned.js 2618000 60000 2678000 32 600`. Raw: `runs/2026-10-28-1448-both-doubles-owned-2618000-2697199.json`.

Exact next hypothesis/action: independently test pip/geometry-matched decisions in a branch-invariant early window, and authenticate late-arrival branch unlock and blocked tie before any full-game win claim.
