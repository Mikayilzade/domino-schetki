# Qoşa research status

Updated: 2026-10-26 09:51:30 +04 (Asia/Baku)

## Verified cumulative scale
- **1,074,255** complete full rounds; historical 4,000 separate.
- **1,353,880** forced matched hidden-world continuations.
- **4,900** separate full-known-world diagnostics.
- Engine `qosa-research-0.5.3` / recovered `qosa-1.0.0`, 3×9; number-lock **PROVISIONAL**.
- Fresh seeds **1561100..1561219**; next unused seed **>=1561220**.

## Latest checkpoint
- Independent fixed-visible Monte Carlo opening-switch replication using `simulator/hidden-world-mobility.js` and `runs/2026-10-26-0948-hidden-world-switch-holdout-1561100.json`.
- 720 complete baseline rounds; 1215 selected changed-choice positions; 14580 sampled hidden worlds; 29160 forced paired continuations.
- Hybrid minus closed-control finish-first: mobility -3.55 ±1.88 pp; tempo -3.25 ±1.96 pp (exploratory deal-cluster 95% half-widths). Opening-switch versus same-type subgroups in JSON; not causal.
- Deterministic V8 CommonJS replay and synthetic branch/scoring tests passed; Node CLI not executed. Uniform unknown allocations do not condition on pass history. Scoreboard/PWA untouched.

## NEXT ACTION
- Add exact no-stock pass-conditioned hidden-world allocation to first-divergence sampler, verify deterministic replay and invariants; independent seeds >=1561220. Authenticate four-side locking and block-winner fixtures.
