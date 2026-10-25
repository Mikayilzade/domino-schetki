# Qoşa research status

Updated: 2026-10-25 13:48 +04

## Verified cumulative scale
- **773,021** complete full-round discovery/tournament continuations (**766,692** prior + **6,329** new).
- **1,064,640** forced hidden-world counterfactual continuations (**1,057,920** prior + **6,720** new). Historical 4,000 separate.
- Engine `qosa-research-0.5.3` / recovered `qosa-1.0.0`, primary 3×9; four-branch number locking **PROVISIONAL**.
- Latest reserved disjoint seed windows `1502540..1503739` and `1503740..1504939`; next seed **>=1504940**.

## Latest checkpoint
- New `simulator/connector-pip-gap-runner.js`: deterministic V8 CommonJS replay green; Node CLI not run. **2,142 distinct deal seeds scanned**, **6,329** complete discovery continuations, **70** selected next-opponent-one-stone positions, **3,360** matched hidden allocations, **6,720** forced continuations; zero unresolved.
- Legal same-X comparison: play unopened `X-X` double or legal ordinary `X-Y` connector retaining X-X, with **pip difference X-Y**, so exact pip matching is impossible. Double minus connector next opponent immediate finish **+50.06 pp** (cohorts +47.86/+52.14 pp); focal finish-first **−23.13 pp** (cohorts −34.25/−12.62 pp), exploratory intervals; mean pip gap **−2.69** (65/70 negative).
- **Not causal real-game advice**: different discarded pips, retained hand, branch geometry; selected positions, provisional branch locks, no block winner/loneZero/bust/101 scoring validation. Positive-gap group n=5 only.
- Raw per-position data and reproducibility: `runs/2026-10-25-connector-pip-gap-1502540-1503740.json`; detailed checkpoint appended to `RESULTS.md`. Live scoreboard/PWA untouched.

## NEXT ACTION
- Fresh seeds **>=1504940**: oversample **positive X-Y pip-gap** same-X pairs, balance absolute pip gap and retained X-connectors; independent matched-world holdout. Obtain authentic four-branch lock/open fixture and block winner rule; run Node CLI regressions.
