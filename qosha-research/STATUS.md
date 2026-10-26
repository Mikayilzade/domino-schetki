# Qoşa research status

Updated: 2026-10-26 10:52:19 +04 (Asia/Baku)

## Verified cumulative scale
- **1,074,855** complete full rounds; historical 4,000 separate.
- **1,367,256** forced matched hidden-world continuations.
- **4,900** separate full-known-world diagnostics.
- Engine `qosa-research-0.5.3` / recovered `qosa-1.0.0`, 3×9; four-side number-lock **PROVISIONAL**.
- Fresh seeds **1561220..1561319**; next unused seed **>=1561320**.

## Latest checkpoint
- Pass-conditioned Monte Carlo: `simulator/pass-conditioned-mobility.js`, `runs/2026-10-26-1050-pass-conditioned-mobility-1561220.json`.
- 600 baseline rounds; 418 changed-choice post-pass positions; 3344 pass-conditioned allocations and 3344 uniform-control allocations; 13376 forced continuations.
- Mobility vs closed finish-first (conditional): 0.37 ±4.70 pp; uniform: -2.61 ±3.92 pp.
- Tempo vs closed finish-first (conditional): -5.62 ±5.65 pp; uniform: 0.78 ±4.81 pp.
- Uniform-world pass contradictions: mobility 72.5%; tempo 70.0%; conditional sampler enforces all observed no-stock passes.
- Deterministic V8 CommonJS regression green; Node CLI not executed. Uncorrected exploratory deal-cluster intervals; first eligible changed decisions, simple bots, authentic branch opening/block winner unresolved. Live scoreboard/PWA untouched.

## NEXT ACTION
- Independent holdout seeds >=1561320 with more pass-conditioned worlds and both-opponent pass-history strata; confirm real four-side lock/open and block-winner examples before human advice.
