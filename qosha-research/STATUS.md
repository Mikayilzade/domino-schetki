# Qoşa research status

Updated: 2026-10-27 08:54:45 +04 (Asia/Baku)

## Verified cumulative scale
- **1198575** complete rounds; historical 4,000 separate.
- **1898856** matched forced hidden-world continuations (unchanged this run).
- **4,900** separate known-world diagnostics; **1000** new counterfactual next-opponent pass labels.
- Engine qosa-research-0.5.3 / recovered qosa-1.0.0 3×9; four-side number-lock PROVISIONAL.
- Latest fresh seeds 1580740..1581939; next >= 1581940.

## Latest checkpoint
- 1200 deals, 7200 baseline rounds, 500 selected positions; exact conditional vs uniform next-pass Brier 0.01671 vs 0.10167 (gain 0.08495 ± 0.01164).
- Holdout gain 0.08481 ± 0.01738; BOTH-pass n=38. 7 deterministic V8 CommonJS checks; Node CLI not executed.
- Code and full rows: `simulator/pass-next-calibration.js`, `runs/2026-10-27-0850-next-pass-calibration-1580740.json`; short interpretation in sibling `.md`. Scoreboard/PWA untouched.

## NEXT ACTION
- Fresh seeds >= 1581940; independent Brier replication, especially BOTH-pass; validate branch locks and blocked winner; no human-play tactic promoted yet.
