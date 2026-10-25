# Qoşa research status

Updated: 2026-10-25 20:49 +04 (Asia/Baku)

## Verified cumulative scale
- **909,735** complete full-round discovery/tournament continuations.
- **1,295,616** forced matched hidden-world counterfactual continuations; historical 4,000 separate.
- Engine `qosa-research-0.5.3` / recovered `qosa-1.0.0`; primary 3×9; number-lock/four-branch semantics **PROVISIONAL**.
- Latest disjoint seed window **1547740..1550939** (3,200 deals). Next fresh seed **>=1550940**.

## Latest checkpoint
- Reused `simulator/connector-high-x-broad-runner.js`; deterministic V8 CommonJS test green (Node CLI not run). **3,200 unique deals, 9,600 full trajectories, 1,569 selected legal-choice positions, 18,828 matched hidden worlds, 75,312 forced continuations**, zero unresolved. Full raw rows and summary: [2026-10-25 20:49 independent holdout](runs/2026-10-25-2049-high-x-broad-holdout-1547740.json).
- 6-6 selected **508** positions; next clockwise opponent 2–4 stones only **5**, versus 5–8 stones **503**. For 5–8: playing 6-6 rather than legal same-X connector (positive pip advantage to double) reduced focal finish-first **14.99 ±2.01 pp** under min-pips bots and **16.00 ±2.18 pp** under closed-branch-control bots (exploratory uncorrected deal-cluster 95% normal half-width). Across all 508: **−14.99 / −15.98 pp**. For 2–4 stones: **−15.00 ±33.63 / −13.33 ±26.64 pp** (n=5; no reliable conclusion).
- Third independent broad-state 6-6 cohort confirms *within-model early-position direction*, **not** a causal effect of unlocking or validated human advice. The legal actions change tile identity and retained hand, and branch locking remains unverified. Finish-first ≠ 101-point match win. Live scoreboard/PWA unchanged.

## NEXT ACTION
- On fresh seeds >=1550940, create a **late-6-6 targeted reachable-state selector** (next opponent 2–4 stones), with deterministic tests and explicit selection accounting; do not mix early/late populations. Seek real-table four-branch locked/open fixture and block-winner rule. Run Node CLI regressions when feasible; never promote causal/human advice from provisional kernel.
