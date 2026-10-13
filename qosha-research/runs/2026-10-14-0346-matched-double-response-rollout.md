# 2026-10-14 03:46 (+04) — paired response continuation

Engine qosa-research-0.5.3 / rules qosa-1.0.0; primary 3×9.
Previously audited 20 positions, 800 NEW matched hidden allocations, 2400 policy-world evaluations, zero unresolved, no new full strategy rounds; verified cumulative 180000 full strategy rounds. Seeds: 3147315,3148251,3150395,3153250,3154001,3154153,3157113,3157675,3157696,3158507,3158948,3159510,3160473,3160598,3162540,3162948,3165876,3171721,3175574,3176263. Hidden-world seed (1120000000+Math.imul(dealSeed,71)+worldIndex)>>>0, worldIndex 0..39. Policies: closed-branch-control, min-hand-pips, fast-doubles.

Keep-more-doubles minus spend-more-doubles first-place: +26.50 pp (exploratory 95% position CI +13.62..+39.38), +21.375 pp, +19.00 pp respectively. Closed-branch mean remainder -1.195 pips; minus finish +21.25 pp. Immediate opponent response: both-play 543, both-pass 22, keep-only-pass 134, spend-only-pass 101. Both-play still shows an advantage, but exact playable-tile sets and branch states differ: no causal isolated benefit of retaining doubles is established.

V8 CommonJS deterministic self-test passed; Node CLI not executed. Selected two-pass positions, uniform hidden worlds, deterministic bots, assumed branch opening, block winner unassigned. Results are provisional.

Reproduce: node qosha-research/simulator/matched-double-response-rollout.js test
node qosha-research/simulator/matched-double-response-rollout.js 40

Next: independent earlier-game controls with matched exact playable-tile sets and history-conditioned opponent allocations.
