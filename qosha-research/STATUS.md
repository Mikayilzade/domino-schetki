# Qoşa research status

Updated: 2026-10-25 13:07:42 +04

## Verified cumulative scale
- **766,692** complete full-round discovery/tournament continuations (**757,717** prior + **8,975** new).
- **1,057,920** forced hidden-world counterfactual continuations (**1,056,384** prior + **1,536** new). Historical 4,000 separate; unpersisted pilot excluded.
- Engine `qosa-research-0.5.3` / recovered `qosa-1.0.0`, primary 3×9; four-branch number locking **PROVISIONAL**.
- Latest fresh disjoint seed window **1499540..1502539**; next seed **>=1502540**.

## Latest checkpoint
- New `simulator/branch-legal-structure.js` V8 CommonJS deterministic test green; Node CLI not run. 8975 complete discovery trajectories, 24 selected legal equal-pip positions, 768 matched hidden allocations, 1536 forced continuations; 0 unresolved.
- Double-opening minus ordinary single finish-first **-10.55 ±7.74 pp** (exploratory position CI), next opponent playable +1.04. Next-1 subgroup n=4 is too small for inference.
- Retained X-Y connector subgroup: zero n=6, >=1 n=18; confounded, not causal. Equal-pip ordinary X-Y vs X-X comparison is algebraically impossible, since X+Y=2X requires X=Y. New design must control pip gap rather than demand equality.
- Reproduce from `runs/2026-10-25-1251-legal-structure-1499540.json`; scoreboard/PWA untouched.

## NEXT ACTION
- Fresh seeds >=1502540: independent connector-pattern study using pip-gap controls and larger one-stone cohort; validate authentic branch locking and block-winner scoring.
