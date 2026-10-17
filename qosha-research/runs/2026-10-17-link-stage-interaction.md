# Retained double links x own/opponent stage — independent cohorts

- Timestamp (Asia/Baku): 2026-10-17 13:50:53 +04:00; engine `qosa-research-0.5.3`; recovered rules `qosa-1.0.0`; primary 3×9.
- Fresh deterministic seeds: discovery `828000..829999`, independent holdout `830000..831999`; each 2000 deals × 3 seat rotations. Policies: `closed-branch-control`, `min-hand-pips`, `fast-doubles`, canonical continuation.
- **12000 new complete baseline rounds**: discovery 5958 finishes / 42 blocks; holdout 5947 finishes / 53 blocks; 0 unresolved. 765 paired eligible positions, 1530 forced continuations, tracked separately.
- Higher-minus-lower retained double/connector links, finish-first:
  - Discovery all: n=367, delta=2.45 pp, CI=-3.03..7.93 pp; holdout all: n=398, delta=-0.75 pp, CI=-6.04..4.53 pp.
  - Next opponent 3–5 stones: discovery opp3to5: n=130, delta=5.38 pp, CI=-2.72..13.49 pp; holdout opp3to5: n=140, delta=5.71 pp, CI=-1.91..13.34 pp.
  - Next opponent 6+ stones: discovery opp6plus: n=225, delta=-2.22 pp, CI=-9.56..5.12 pp; holdout opp6plus: n=244, delta=-5.33 pp, CI=-12.72..2.06 pp.
  - Both own 4–6 and opponent 3–5: discovery opp3to5_own4to6: n=108, delta=4.63 pp, CI=-4.45..13.71 pp; holdout opp3to5_own4to6: n=110, delta=3.64 pp, CI=-5.45..12.73 pp.
- Immediate next-player legal finish availability changes in 1/367 and 1/398 linked positions, respectively (high-only 1/1, low-only 0/0). This is a **legal option**, not necessarily chosen by the continuation bot.
- Validation: deterministic V8 CommonJS test `{"passed":true,"seeds":"859000..859015","positions":4,"immediateThreatChecks":8}`; 0 primary-score mismatches, 0 source mutations, 0 unresolved. Node CLI not executed in this environment.
- **Finding:** do not promote link retention or a particular opponent-stage interaction to a human strategy rule unless independent cohorts agree with adequate support. These are observational full-information counterfactuals; different tiles also change accessible end values. Exploratory intervals and subgroup multiplicity are not confirmatory.
- **Cumulative credited full strategy rounds: 251400** (prior 239400 + 12000); historical 4000 kept separate. Paired continuations excluded from round total.
- Reproduce: `node qosha-research/simulator/link-stage-interaction.js test`; `node qosha-research/simulator/link-stage-interaction.js run 828000 2000`; `node qosha-research/simulator/link-stage-interaction.js run 830000 2000`. Data: `runs/2026-10-17-link-stage-interaction.json`.
- **Exact next hypothesis/action:** compare only positions where the higher-link move does **not increase the next opponent's legal action count**, then test with fixed-visible hidden-world Monte Carlo (same candidate actions and hidden-world allocations) and a second continuation policy. Report win chance, expected remainder, minus probability and regret separately.
