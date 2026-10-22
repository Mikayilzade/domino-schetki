# Retained connector matched holdout — 2026-10-22 13:59:35 Asia/Baku (+04)

Engine/rules: qosa-research-0.5.3 / recovered qosa-1.0.0, 3 players × 9 stones; branch semantics provisional.

Independent discovery seeds 1334840..1343839 (disjoint from previous 1331840..1334839). Discovery: 320 eligible positions (80 per double 3-3/5-5 and discovery policy min-hand-pips/closed-branch-control); 3629/1306 seeds scanned by respective policies. Selection before outcomes: 30 matched pairs (60 positions), 57 distinct selected seeds, 15 negative and 15 positive signed pip-gap pairs. Match exact discovery bot, double number, signed pip gap (which fixes alternative endpoint value), and focal hand-size bucket <=5/>5; greedily minimize next-hand size, focal size, turn differences.

Matched hidden allocations: 7033 across positions, 13 positions with exact support, cap 128 per position. Two forced choices (connector X-Y vs same-side nonconnector U-Y, both retain X-X), three continuation bots (min-hand-pips, closed-branch-control, fast-doubles), 42198 forced continuations, zero unresolved. No new full-deal rounds.

First-place advantage of connector vs nonconnector with an additional X-linked stone remaining / without an additional one / matched difference (exploratory pair 3-SE):
- min-hand-pips: +4.03 pp / -0.68 pp / +4.71 pp [-6.78, +16.20].
- closed-branch-control: +2.70 pp / -3.47 pp / +6.17 pp [-6.98, +19.32].
- fast-doubles: +2.64 pp / +1.39 pp / +1.25 pp [-8.42, +10.93].
Immediate next-opponent pass gain: +18.17 pp with retained connector vs +18.20 pp without (difference -0.03 pp).

Finding: positive but inconclusive association with an additional retained connector; all first-place intervals include zero. No reliable universal rule. The association is not explained by a larger immediate pass effect in this sample.

Validation: deterministic V8 CommonJS regression passed (2 fixture pairs, 8 hidden allocations); full run complete with zero unresolved. Node CLI unavailable in this runtime. No simulator gameplay-rule changes.

Limitations: held/not-held comparison is observational between different positions, NOT a randomized causal effect; hidden worlds matched only within a position, not across matched pairs. Hands, geometry and pass history differ. Assumed branch semantics, no block winner, fixed bots, pass-compatible uniform hidden worlds omit prior-choice likelihood, first-eligible position selection, exploratory pair intervals with no multiplicity/seed-dependence correction.

Reproduce: node qosha-research/simulator/connector-held-matched-holdout.js test
Then: node qosha-research/simulator/connector-held-matched-holdout.js 1334840 9000 80 128 15
Raw JSON: runs/2026-10-22-1359-connector-held-matched.json

Verified cumulative: 389700 full continuations (unchanged) + 397922 separate counterfactual continuations (355724 previous + 42198 this run), excluding historical/quarantined.

Next: fresh seeds >=1343840; tighter exact focal/next hand-size matching and within-position future-connector mobility; Node CLI checks.
