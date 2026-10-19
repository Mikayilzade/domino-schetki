# Qoşa açdı — paired-design audit, 2026-10-19 10:52 Asia/Baku

- Rules/engine: qosa-1.0.0 / qosa-research-0.5.3; 3×9, later-round. Existing runner tests passed in V8 CommonJS.
- Fresh deterministic seeds: 2026200..2026299, 100 unique deals. 2,400 complete simulations (600 mixed-policy rounds + 1,800 isolated-policy rounds), 0 unresolved.
- Mixed three-way win rates (history / uniform): vs closed-branch-control 39.00% / 27.33% (+11.67 pp); vs min-hand-pips 39.00% / 29.00% (+10.00 pp).
- Isolated focal same-seed/same-seat comparison (history minus uniform): vs closed-branch-control +0.33 pp (95% seed-cluster CI -1.40..+2.07 pp); vs min-hand-pips 0.00 pp (CI -2.08..+2.08 pp).
- Finding: a large relative advantage in mixed three-way tournaments coexists with a near-zero paired effect against two fixed opponents. Mixed and isolated designs have different opponent compositions; do not interpret the mixed delta as a causal improvement from remembering passes.
- Confidence: moderate for this simulator-only design contrast; 100 deals, exploratory CIs, provisional branch rules, no block winner/101 scoring, Node CLI not run.
- Next: implement an executable same-seed fixed-opponent mixed-vs-isolated ablation and measure decision regret only where pass history changes a legal move. Do not credit 2,400 rounds to a GitHub-verified cumulative count until this checkpoint is persisted.
