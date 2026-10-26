# Qoşa research status

Updated: 2026-10-27 02:57:01 +04 (Asia/Baku)

## Verified cumulative scale
- **1166175** complete full rounds; historical 4,000 separate.
- **1704536** matched hidden-world forced continuations.
- **4,900** separate full-known-world diagnostics.
- Engine qosa-research-0.5.3 / recovered qosa-1.0.0, 3×9; four-side number-lock **PROVISIONAL**.
- Fresh seeds **1575740..1576539**; next unused seed **>=1576540**.

## Latest checkpoint
- 800 deals, 4800 complete rounds, 16184 forced continuations, 289 selected different-end side pairs with informative opponent passes. 6-check deterministic V8 CommonJS test passed; Node CLI not run.
- Conditional-vs-uniform trained first-finish on matched pass-compatible holdout: **1.73 ± 1.18 pp** (exploratory 95% deal-cluster half-width); 62 choice switches. No confirmed human-play rule.
- Runner `simulator/pass-conditioned-side.js`; raw `runs/2026-10-27-pass-conditioned-side-1575740.json`. Scoreboard/PWA untouched.

## NEXT ACTION
- Independent seeds >=1576540, 16+ training worlds and stronger opponent policies; isolate one-vs-two pass histories and validate authentic branch locking and block winner.
