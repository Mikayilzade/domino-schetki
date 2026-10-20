# 2026-10-21 02:46 Asia/Baku: canonical pass holdout

Engine qosa-research-0.5.3; rules qosa-1.0.0; 3 players x 9 stones. Fresh seeds 1308688..1308927: 240 deals, 8640 completed matched continuations, 0 unresolved. Two opponent policies: min-hand-pips and closed-branch-control. Compared alpha20 and alpha28, each with plain, one-opponent and joint-opponent pass-history estimates; three focal seats. V8 deterministic/brute-force posterior regression passed; Node CLI not run.

Joint minus one first-finish rate (deal-cluster exploratory 95% intervals):
- min-pips alpha20: -0.56 pp [-1.57,+0.46]; alpha28: -0.69 pp [-1.75,+0.36].
- branch-control alpha20: -1.39 pp [-2.66,-0.12]; alpha28: -0.97 pp [-2.22,+0.27].
All comparisons exploratory; no multiplicity adjustment.

For shared alpha20-plain decisions where both opponents had pass history, joint vs one Brier error: min-pips n=286, 0.07742 vs 0.08266, delta -0.00525, deal-cluster CI [-0.00895,-0.00155]; branch-control n=339, 0.06330 vs 0.08102, delta -0.01771, CI [-0.02476,-0.01066]. Cluster estimates account for repeated decisions per deal.

Finding: joint history improves prediction calibration but not first-finish rate in these policies. No reliable human-game rule. Limitations: provisional branch semantics, uniform hidden allocation given passes, fixed bots, block winner unassigned; first-finish is not match win. Do not mix with older samples.

Reproduce using simulator/build-pass-canonical.js to generate joint-pass-memory-canonical.js; run its test, then run with arguments 1308688 240 20,28. Previous canonical holdout seeds 1308448..1308687 had 8640 continuations; combined two canonical holdouts: 17280, separate from 264900 previously recorded strategy continuations and historical 4000.

Next: on fresh seeds 1308928..1309167 evaluate only positions where joint and one choose different moves, using identical hidden worlds and canonical continuation; compare first-finish, remainder, minus and action regret.