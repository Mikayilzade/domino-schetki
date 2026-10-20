# Qoşa equal-pip independent holdout — 2026-10-20 12:55 Asia/Baku (+04)

Source branch: qosha-research-20261020-0750. Engine qosa-research-0.5.3; rules qosa-1.0.0; mode 3 players x 9 tiles.

Executed deterministic V8 CommonJS regression (1 fixture position / 24 forced continuations, passed) and fresh runner seeds 1340000..1349999: 10,000 deals scanned, 27 eligible positions, 64 worlds each (32 train / 32 held out), 1,728 hidden allocations, 8,448 forced continuations, zero unresolved. Policies: min-hand-pips and closed-branch-control. Candidate legal ordinary moves preserve vs break double+connector, with equal discarded pips; best candidate within each class chosen using training worlds only.

Held-out keep-minus-break first-finisher advantage:
- min-hand-pips +3.36 percentage points; exploratory position CI [-8.69,+15.40]; mean focal remainder -0.236 pips; minus-finish rate +17.59 pp; position signs 10 better / 9 tied / 8 worse.
- closed-branch-control +7.75 pp; exploratory CI [-3.34,+18.85]; mean focal remainder -0.363 pips; minus-finish +15.63 pp; signs 12/8/7.

Critical exploratory stratum: next clockwise opponent has <=2 stones, n=2, +82.81 pp under either policy; next opponent has >=3 stones, n=25, -3.00 pp min-pips and +1.75 pp branch-control. Two high-impact seeds: 1347359 and 1349932. Double-number exploratory effects: 0-0 n=14 +7.81/+7.81 pp; 2-2 n=8 +13.67/+19.14 pp; 3-3 n=6 -7.81/-7.81 pp (min-pips/branch-control). Small and overlapping strata: no strategy recommendation yet.

The previous +30.7..31.0 pp result on 1330000..1339999 did NOT replicate on this independent cohort. No reliable unconditional advantage has been established. Geometry confounding remains. First-finisher is not match-winner; block winner unassigned; branch-number opening is provisional; hidden worlds are uniform pass-conditioned; fixed deterministic bots; selected positions are not an unbiased population sample. Exploratory confidence intervals are not causal.

Reproduce:
`node qosha-research/simulator/connector-equal-pip-preservation-holdout.js test`
`node qosha-research/simulator/connector-equal-pip-preservation-holdout.js 1340000 10000 64 30`
World seeds: mixSeed32(dealSeed XOR imul(turn+1,0x9e3779b9) XOR imul(seat+1,0x85ebca6b) XOR imul(worldIndex+1,0xc2b2ae35)).

Cumulative verified: 266,700 complete strategy rounds (unchanged) + 101,584 forced continuations (93,136 previous + 8,448 new), historical 4,000 excluded.

Exact next action: run fresh seeds 1350000..1379999, 64 worlds, cap >=80, pre-stratify by next opponent <=2 vs >=3 and report position-level uncertainty, also inspect seed 1342602 counterexample. Do not interpret post-action geometry conditioning as causal isolation. No scoreboard/PWA changes, no GitHub Actions.
