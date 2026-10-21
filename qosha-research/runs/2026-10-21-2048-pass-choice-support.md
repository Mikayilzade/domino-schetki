# Independent support-stratified pass-choice holdout — 2026-10-21 20:51:28 Asia/Baku

Engine `qosa-research-0.5.3` / rules `qosa-1.0.0`, 3 players × 9 stones. V8 CommonJS regression and full deterministic replay passed; Node CLI was not executed.

Fresh discovery seeds **1305440..1305889**; scanned **78** min-pips deals and **57** branch-control deals (overlap possible). Selected **36 changed-choice positions** (18 per profile). **23 positions** exhaustively enumerated because support <=128; **13 positions** sampled using 128 **distinct** deterministic hidden allocations each. Total **2446 distinct position-conditioned hidden worlds**, **4892 forced-choice continuations**, zero unresolved. Same world and continuation policy for alpha20-one and alpha20-joint.

Position-equal joint-minus-one finish-first: min-pips **4.04 pp**, exploratory 95% CI [-6.50, 14.57], better/worse/tie 7/7/4; branch-control **-10.76 pp**, exploratory CI [-19.34, -2.19], better/worse/tie 2/11/5. Mean focal remainder joint-minus-one: -0.74 / 1.18 pips.

**Useful finding (model-specific, provisional):** branch-control opponents again penalize joint-pass choice on this fresh cohort (−10.76 pp), while min-pips opponents show heterogeneous positions and no reliable improvement. In the **13 exactly enumerated branch-control positions**, joint-minus-one = **-11.24 pp** (0 positive, 8 negative, 5 tied). This rules out Monte Carlo duplication as the explanation for those exact-position outcomes, but does not establish a general strategy law.

Important correction to sampling interpretation: sampling 128 worlds from a posterior with only 1–128 possible allocations repeats worlds; exact enumeration now replaces those repeats. CIs are exploratory position-level t approximations, uncorrected for same-deal dependence/selection.

Prior verified **290,100 complete continuations unchanged**; prior **41,472** separate pass-choice counterfactual continuations + **4892** new = **46364** separately tracked. Historical 4,000 and quarantined runs excluded.

Reproduce: `node qosha-research/simulator/pass-choice-support-strata.js test` then `node qosha-research/simulator/pass-choice-support-strata.js 1305440 450 18 128`. Raw rows: `runs/2026-10-21-pass-choice-support-1305440.json`.

**Exact next hypothesis/action:** perform full-deal matched-seed alpha20-one vs alpha20-joint comparisons (all focal decisions, not only changed-choice states), with seat rotations and cluster uncertainty; separately enlarge both-opponent-pass stratum and condition on observed opponent action likelihood. Do not promote a general human rule from selected positions.
