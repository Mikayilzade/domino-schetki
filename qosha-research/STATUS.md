# Qoşa research status

Updated: 2026-10-27 10:50:30 +04 (Asia/Baku)

## Verified cumulative scale
- **1234575** complete rounds; historical 4,000 separate.
- **1898856** matched forced hidden-world continuations (unchanged).
- **4900** separate known-world diagnostics; **5734** counterfactual immediate next-opponent pass labels.
- Engine qosa-research-0.5.3 / recovered qosa-1.0.0 3×9; four-side number-lock PROVISIONAL.
- Latest fresh seeds 1584340..1587939; next >=1587940.

## Latest checkpoint
- 3600 deals, 21600 baseline rounds, 1425 selected positions and 2850 next-pass labels.
- Non-certain: 607 labels, uniform Brier 0.11849 vs conditional 0.10327; gain 0.01662 ± 0.00921 (exploratory 95% position-cluster).
- Independent holdout gain 0.01552 ± 0.01264 (334 labels); BOTH-pass non-certain only 15 labels, gain 0.01020 ± 0.09405.
- 2243 model-certain labels, 0 errors. No new confirmed human-play tactic. Policy-choice likelihood not modeled.
- 4-check deterministic V8 CommonJS replay passed; Node CLI not executed. Data/report: `qosha-research/runs/2026-10-27-1050-next-pass-uncertain-1584340-1587939.json`, `qosha-research/runs/2026-10-27-1050-next-pass-uncertain-1584340-1587939.md`. Scoreboard/PWA untouched.

## NEXT ACTION
- Fresh seeds >=1587940: explicitly model prior opponent choice likelihood and hold out non-certain/BOTH-pass forecasts; authenticate branch locking and blocked winner.
