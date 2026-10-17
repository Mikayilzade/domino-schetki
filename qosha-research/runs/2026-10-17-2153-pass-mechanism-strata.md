# Pass mechanism strata — 2026-10-17 21:53 Asia/Baku

Engine `qosa-research-0.5.3`, recovered `qosa-1.0.0`; primary 3 players x 9 stones. Runner: `simulator/pass-mechanism-strata.js`. Reproduce with:
`node qosha-research/simulator/pass-mechanism-strata.js test`
`node qosha-research/simulator/pass-mechanism-strata.js 860000 890000 30 64`
`node qosha-research/simulator/pass-mechanism-strata.js 890000 920000 30 64`

Independent seed sets 860000..889999 and 890000..919999: 6515 and 6720 deals scanned; 30 eligible positions each, 23 and 25 with unequal exact next-pass forecasts. Total 3072 sampled matched hidden allocations, 18432 candidate continuations (three policies x two actions x each allocation), zero unresolved. Discovery min-hand-pips; continuation closed-branch-control, min-hand-pips, fast-doubles. World seed `(1900000000+Math.imul(dealSeed,107)+worldIndex)>>>0`. New full strategy rounds: zero; verified cumulative full rounds: 186000, plus separate historical 4000.

Compare equal-pip connector versus unrelated single, both retaining X-X and another connector; orient by higher exact next-pass forecast. Actual immediate next-opponent response strata (higher-pass action only / lower-pass only / both / neither): 614/91/173/594 in first set; 586/77/164/773 in second set.

Position-weighted finish-first difference, higher-forecast minus lower-forecast:
- First set, next opponent **can move after BOTH** actions (16 positions): closed-branch +36.16 pp, min-pips +36.16 pp, fast-doubles +0.44 pp. Higher-only pass (23 positions): +40.61 / +38.75 / +1.36 pp.
- Second set, next opponent **can move after BOTH** actions (20 positions): closed-branch +19.46 pp, min-pips +19.68 pp, fast-doubles 0.00 pp. Higher-only pass (25 positions): +26.63 / +25.86 / +0.51 pp.
- Exploratory position-cluster 95% intervals for closed-branch neither subgroup: +13.19..+59.13 pp, +1.39..+37.52 pp. Opponent hand size: one stone in 7 informative positions, two stones in 41. Geometry differed after the two candidate actions in all 48 informative positions.

**Finding (provisional):** the benefit of a high exact-pass-forecast move against two bot policies persists even when the next opponent does not pass after either candidate. Immediate pass alone therefore does not explain the observed advantage; geometry/connector access and policy responses remain confounded. Fast-doubles shows no meaningful first-place benefit. Not a universal human-play rule.

Deterministic self-test and both runs passed in a V8 CommonJS harness (not Node CLI). Limitations: first-eligible selection, uniform hidden allocations ignoring past opponent choices, sampled worlds with replacement, provisional branch semantics, post-action-stratum selection is descriptive rather than causal, no block winner assignment, exploratory CIs, only late game.

Next: seek same-geometry candidate controls or quantify their scarcity; on new matched full-round seeds compare pass-maximizing versus closed-branch-control policies for finish-first, pips, and minus. No scoreboard/PWA modifications.
