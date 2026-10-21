# Independent equal-pip double-opening legal-set overlap holdout

- Timestamp (Asia/Baku): 2026-10-21T08:54:41 +04:00
- Engine/rules: qosa-research-0.5.3 / qosa-1.0.0, primary 3 players x 9 stones.
- Fresh seed cohorts: 1329000..1329093 (94 scanned, min-hand-pips discovery) and 1333000..1333112 (113 scanned, closed-branch-control discovery).
- Sample: 207 deals scanned, 120 first-eligible reachable positions, 40 hidden worlds per position = 4,800 matched hidden allocations, 19,200 candidate continuations, zero unresolved. No new complete strategy rounds.
- Candidates: one legal double X-X opening vs one ordinary A-B with A+B=2X, equal discarded pips, identical sampled hidden allocations and continuation policies.
- Continuation bots: min-hand-pips and closed-branch-control; canonical action tie-breaking.
- Deterministic checks: existing equal-pip-double-mobility.test() and equal-pip-number-support.test() passed in V8 CommonJS harness, plus unchanged source-state check for each of 120 positions. Node CLI not executed.

## New results (double minus ordinary single)

- Next opponent distinct playable tile types: +1.7746 (exploratory 95% position-level CI +1.6295 to +1.9197).
- First-to-finish probability: min-hand-pips -16.75 percentage points (CI -20.69 to -12.81); closed-branch-control -17.71 points (CI -21.28 to -14.14).
- Focal remaining pips: min-hand-pips +1.251 (CI +0.861 to +1.641); closed-branch-control +1.748 (CI +1.253 to +2.242).
- Focal minus-finish rate (beneficial outcome): min-hand-pips -3.63 pp (CI -6.50 to -0.75); closed-branch-control -8.40 pp (CI -12.04 to -4.75).
- EXACT SAME next-player playable tile-key set under both candidates: 167 / 4,800 hidden worlds, spread across 51 / 120 positions.
- Non-increasing next-player playable tile-type count: 728 / 4,800 worlds. Equal tile-type count but DIFFERENT legal tile-key sets: 417 / 4,800 worlds; equal count is not a controlled same-set comparison.
- For the 51 positions with any exact legal-set overlap, mean position-level first-to-finish delta was -13.78 pp (CI -23.38 to -4.19) vs min-pips and -12.74 pp (CI -24.19 to -1.30) vs branch-control. These are selected subgroups and cannot establish causation.
- Opening had positive first-finish delta under both bots in 7 / 120 positions and negative under both in 78 / 120. There ARE exceptions; do not present a universal rule.

## Confidence, interpretation and limits

This independently replicates the model-specific disadvantage of early double opening with equal pips removed. The 167 exact-next-player-legal-set overlaps show that immediate next-player move access alone is not sufficient to explain all model outcomes, but focal hand connectivity and future branch geometry remain confounders. Conditioning on post-action legal sets is itself selective. No causal human-game claim is justified. All confidence intervals are exploratory normal intervals over positions, not over 4,800 independent worlds.

The engine still assumes provisional branch opening semantics, uniformly samples hidden allocations without opponent-choice likelihood, uses two fixed continuation bots, selects the first eligible position, and assigns no winner on blocks. First-to-finish is not full-match win. Historical 264,900 full strategy continuations, 17,280 canonical continuations and this run's 19,200 paired continuations remain separate.

## Reproduction

Use the existing source files `simulator/equal-pip-double-mobility.js`, `simulator/equal-pip-number-support.js`, `simulator/pass-conditioned-sampler.js`, `simulator/round-driver.js` and `runs/2026-10-20-2352-canonical-geometry.js`.

Collect the first 60 eligible positions for seeds 1329000..1330999 with min-hand-pips and 60 for seeds 1333000..1334999 with closed-branch-control (actual stopping seeds above). For each position and j=0..39 sample one world with `mixSeed32((dealSeed + imul(j+1,0x9e3779b9)) >>> 0)`; force the canonical equal-pip double and ordinary single separately. Immediately compare sorted distinct tile keys from next-player `turnOptions`, then continue both states with each of the two canonical bots until termination. Compute differences double minus single for finish-first, focal remaining pips and beneficial minus-finish; average over worlds within each position, then across 120 positions. Check that original state JSON is unchanged.

## Exact next hypothesis/action

On fresh seeds >=1336000, explicitly match focal post-action connectivity and next-player exact legal tile set, controlling double number X, X-linked connectors, next-hand size and branch geometry. Include a third continuation policy (fast-doubles). If no adequate overlap exists, report geometry-versus-double-retention non-identifiability rather than a causal mechanism. Execute Node CLI regressions before promoting confidence.
