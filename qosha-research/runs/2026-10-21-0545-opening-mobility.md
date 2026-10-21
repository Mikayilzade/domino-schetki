# 2026-10-21 05:45 Asia/Baku — double-opening next-opponent mobility

- Engine `qosa-research-0.5.3`, recovered rules `qosa-1.0.0`, 3×9. Branch-opening interpretation provisional.
- Fresh seeds `1311828..1317999`, 272 deals scanned, 60 selected disagreements, 3840 hidden worlds, 25856 candidate continuations, 0 unresolved.
- Alpha20 one-pass vs joint-pass, same hidden worlds; canonical min-pips and branch-control continuation. All differences = joint minus one.
- V8 CommonJS regression: {"mobility":{"passed":true,"positions":2},"paired":{"passed":true,"positions":2,"scanned":7,"continuations":16}}; Node CLI not run.

## Preregistered strata
### all (n=60)
- Next player distinct playable tile types: 60 positions, mean 0.9646, exploratory CI 0.6913..1.2379; pass: 60 positions, mean 0.0198, exploratory CI -0.0028..0.0424.
- Next player immediate finish option: 60 positions, mean 0.0044, exploratory CI -0.0043..0.0131; minus finish option: 60 positions, mean 0.0044, exploratory CI -0.0043..0.0131.
- min-hand-pips first-finisher: 60 positions, mean -0.0703, exploratory CI -0.1434..0.0028; focal remaining pips: 60 positions, mean 0.1888, exploratory CI -0.3648..0.7424.
- closed-branch-control first-finisher: 60 positions, mean -0.0763, exploratory CI -0.1401..-0.0125; focal remaining pips: 60 positions, mean 0.3479, exploratory CI -0.1526..0.8484.
### jointOpensMore (n=31)
- Next player distinct playable tile types: 31 positions, mean 1.6230, exploratory CI 1.3297..1.9163; pass: 31 positions, mean 0.0000, exploratory CI 0.0000..0.0000.
- Next player immediate finish option: 31 positions, mean 0.0000, exploratory CI 0.0000..0.0000; minus finish option: 31 positions, mean 0.0000, exploratory CI 0.0000..0.0000.
- min-hand-pips first-finisher: 31 positions, mean -0.1492, exploratory CI -0.2401..-0.0582; focal remaining pips: 31 positions, mean 0.7490, exploratory CI 0.1006..1.3974.
- closed-branch-control first-finisher: 31 positions, mean -0.1381, exploratory CI -0.2056..-0.0706; focal remaining pips: 31 positions, mean 0.7339, exploratory CI 0.2641..1.2037.
### equalPips (n=10)
- Next player distinct playable tile types: 10 positions, mean 0.8875, exploratory CI 0.4003..1.3747; pass: 10 positions, mean 0.0422, exploratory CI -0.0405..0.1249.
- Next player immediate finish option: 10 positions, mean 0.0000, exploratory CI 0.0000..0.0000; minus finish option: 10 positions, mean 0.0000, exploratory CI 0.0000..0.0000.
- min-hand-pips first-finisher: 10 positions, mean -0.1391, exploratory CI -0.3350..0.0569; focal remaining pips: 10 positions, mean 1.4719, exploratory CI 0.5288..2.4150.
- closed-branch-control first-finisher: 10 positions, mean -0.2437, exploratory CI -0.4118..-0.0757; focal remaining pips: 10 positions, mean 1.4078, exploratory CI 0.3184..2.4972.
### equalPipSingleToDouble (n=5)
- Next player distinct playable tile types: 5 positions, mean 1.2750, exploratory CI 0.6950..1.8550; pass: 5 positions, mean 0.0000, exploratory CI 0.0000..0.0000.
- Next player immediate finish option: 5 positions, mean 0.0000, exploratory CI 0.0000..0.0000; minus finish option: 5 positions, mean 0.0000, exploratory CI 0.0000..0.0000.
- min-hand-pips first-finisher: 5 positions, mean -0.0906, exploratory CI -0.2982..0.1169; focal remaining pips: 5 positions, mean 1.5063, exploratory CI 0.0538..2.9587.
- closed-branch-control first-finisher: 5 positions, mean -0.1375, exploratory CI -0.3310..0.0560; focal remaining pips: 5 positions, mean 0.8500, exploratory CI -0.5759..2.2759.
### openingNextAtMostTwo (n=1)
- Next player distinct playable tile types: 1 positions, mean 0.1250, exploratory CI 0.1250..0.1250; pass: 1 positions, mean 0.0000, exploratory CI 0.0000..0.0000.
- Next player immediate finish option: 1 positions, mean 0.0000, exploratory CI 0.0000..0.0000; minus finish option: 1 positions, mean 0.0000, exploratory CI 0.0000..0.0000.
- min-hand-pips first-finisher: 1 positions, mean -0.3125, exploratory CI -0.3125..-0.3125; focal remaining pips: 1 positions, mean 0.2500, exploratory CI 0.2500..0.2500.
- closed-branch-control first-finisher: 1 positions, mean -0.3125, exploratory CI -0.3125..-0.3125; focal remaining pips: 1 positions, mean 0.2500, exploratory CI 0.2500..0.2500.
### openingNextThreePlus (n=30)
- Next player distinct playable tile types: 30 positions, mean 1.6729, exploratory CI 1.3870..1.9588; pass: 30 positions, mean 0.0000, exploratory CI 0.0000..0.0000.
- Next player immediate finish option: 30 positions, mean 0.0000, exploratory CI 0.0000..0.0000; minus finish option: 30 positions, mean 0.0000, exploratory CI 0.0000..0.0000.
- min-hand-pips first-finisher: 30 positions, mean -0.1437, exploratory CI -0.2371..-0.0504; focal remaining pips: 30 positions, mean 0.7656, exploratory CI 0.0961..1.4351.
- closed-branch-control first-finisher: 30 positions, mean -0.1323, exploratory CI -0.2011..-0.0635; focal remaining pips: 30 positions, mean 0.7500, exploratory CI 0.2654..1.2346.

## Interpretation / confidence
These are disagreement-selected comparisons, not population win rates. Opening a double can coincide with changing own hand and discarded pip value, so the immediate mobility difference is not isolated causality. Equal-pip controls are small. Overlapping strata are not independent; intervals are exploratory.
Fixed bots, provisional opening semantics, uniform pass-conditioned allocations with no opponent-choice likelihood, block winner unassigned, first-finisher not full-match winner. Do not promote a universal human-game rule.
Previous 264900 full strategy continuations and 17280 canonical full continuations remain separate; this pass adds 25856 candidate continuations only.

## Next exact action
Fresh seeds >=1318000, >=100 equal-pip single-to-double positions, >=96 worlds each, match next-player hand size and post-action legal tile sets, then compare opening effects under both policies.

Reproduce: `node qosha-research/simulator/next-mobility-pass.js test` and `node qosha-research/simulator/next-mobility-pass.js 1311828 1318000 60 64`; paired outcome data from `node qosha-research/simulator/pass-disagreement-canonical.js 1311828 1318000 60 64 20`.
Raw data: `runs/2026-10-21-0545-opening-mobility.json`.
