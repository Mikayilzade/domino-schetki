# Qoşa research status

Updated: 2026-10-26 13:52:35 +04 (Asia/Baku)

## Verified cumulative scale
- **1085415** complete full rounds; historical 4,000 separate.
- **1446296** forced matched hidden-world continuations.
- **4,900** separate full-known-world diagnostics.
- Engine `qosa-research-0.5.3` / recovered `qosa-1.0.0`, 3×9; four-side number-lock **PROVISIONAL**.
- Fresh seeds **1562080..1563079**; next unused seed **>=1563080**.

## Latest checkpoint
- `simulator/pass-posterior-contract-test.js`, `qosha-research/runs/2026-10-26-1352-two-sided-holdout-1562080.json`.
- 6000 complete baseline rounds, 170 rare both-pass constrained changed decisions, 16320 allocations, 32640 forced continuations.
- mobility-hybrid: n=49 changed-choice positions / 41 deal clusters; both-pass alternative−control finish-first -6.20 ±8.86 pp; discovery -5.37, holdout -6.91 pp; both-pass posterior interaction 1.52 ±5.91 pp; 84.1% uniform worlds violate a known pass.
- tempo-hybrid: n=65 changed-choice positions / 54 deal clusters; both-pass alternative−control finish-first -1.43 ±6.63 pp; discovery -4.78, holdout 1.93 pp; both-pass posterior interaction -4.09 ±6.26 pp; 83.3% uniform worlds violate a known pass.
- min-hand-pips: n=56 changed-choice positions / 44 deal clusters; both-pass alternative−control finish-first -6.39 ±7.10 pp; discovery -7.24, holdout -5.62 pp; both-pass posterior interaction -0.80 ±4.71 pp; 84.4% uniform worlds violate a known pass.
- Exploratory confidence intervals include zero; no validated winning hybrid. Posterior contract tests passed in V8 CommonJS, Node CLI not run. Live scoreboard/PWA untouched.

## NEXT ACTION
- On unused seeds >=1563080, test posterior-aware move selection and regret; authenticate real branch opening and blocked-round winner.
