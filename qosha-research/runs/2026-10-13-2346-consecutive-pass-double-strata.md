# Independent pass-policy / double-retention holdout — 2026-10-13 23:46 Asia/Baku

Engine: `qosa-research-0.5.3`; rules: recovered `qosa-1.0.0`; mode: 3 players x 9 tiles. No gameplay-rule change.

Reproduce with `node qosha-research/simulator/consecutive-pass-policy-runner.js 2965000 2985000 40 40`. World seed: `(820000000+Math.imul(dealSeed,401)+worldIndex)>>>0`. 1703 deals scanned, 40 first-eligible disagreement positions, 1600 fixed-visible hidden worlds (40 per position), zero unresolved continuations. Policies: `closed-branch-control`, `min-hand-pips`. All candidates in each world used identical deterministic continuation policies.

- Closed branch: changed 15/40; mean next-pass chance 22.21% -> 36.74%; finish-first delta **-0.69 pp** (exploratory position 95% interval -6.70..+5.32 pp), mean remainder +0.042 pips, minus-finish +3.19 pp (interval -1.85..+8.23 pp), block +1.00 pp.
- Min-hand-pips: changed 39/40; next-pass 4.17% -> 36.74%; finish-first delta **-4.88 pp** (interval -13.54..+3.79 pp), mean remainder +0.369 pips, minus-finish +8.88 pp (interval -0.84..+18.59 pp), block +0.94 pp.

Preliminary subgroup audit (descriptive, NOT causal):
- Min-hand-pips, chosen move retains more doubles than baseline: 29/40 positions; finish-first -5.26 pp, minus-finish +13.28 pp. Same or fewer doubles: 11/40, finish-first -3.86 pp, minus-finish -2.73 pp.
- Min-hand-pips, chosen move leaves K=0 newly playable unknown tiles: 6 positions, finish-first +9.17 pp, minus-finish -12.08 pp; K>0: 34 positions, finish-first -7.35 pp, minus-finish +12.57 pp.
- Next opponent hand <=2: only 5 positions, too few for reliable inference.
- Closed branch, K=0: 6 positions; K>0: 34. No more-double-retained cases in closed-branch policy.

**New finding:** the third independent cohort again shows a *directional* increase in minus finishes against min-hand-pips (+8.88 pp), but exploratory intervals for both first-place and minus-finish overlap zero. Keeping doubles is associated with more minus finishes in a selected subgroup, but does not establish a human-play rule or causality.

Confidence and limitations: all estimates exploratory; first-eligible disagreement selection, uniform hidden worlds, 40 worlds per position, deterministic bots, assumed branch-opening semantics, block winner unassigned, subgroup post-action selection and small n. V8 CommonJS runner execution against GitHub source; Node CLI not executed. No new complete strategy rounds; verified prior full strategy rounds **180,000** (historical 4,000 separate); three pass-policy cohorts total **4,000 matched hidden worlds**.

Exact next hypothesis/action: independent seeds `2985000..` and matched comparisons that hold K, discarded pips, and remaining hand size constant while varying retained double chains; oversample K=0 and next-player hand size 1–2. Do not promote a rule without disjoint-seed replication and uncertainty excluding zero.
