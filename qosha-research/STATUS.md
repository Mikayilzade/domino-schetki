# Qoşa research status

Updated: 2026-10-25 00:51:37 +04

## Verified scale
- **685900** full-round continuations; **918576** forced hidden-world counterfactual continuations; historical 4,000 separate.
- Engine `qosa-research-0.5.3` / recovered `qosa-1.0.0`, primary 3×9; authentic branch number-lock **PROVISIONAL**.
- Fresh seeds consumed through **1456439**, next **>=1456440**.

## Latest checkpoint
- Added deterministic exact pass-conditioned hidden-world sampler. 4000 discovery rounds, 200 selected states, 2400 conditioned worlds, 9600 forced continuations.
- Uniform worlds violating known passes: 73.79% on selected constrained positions, conditioned worlds 0%. Baseline next-pass Brier plain/joint: 0.0261/0.0006.
- Crucial: `runRound` chooser is not invoked on passes. Passes recorded BEFORE each `stepRound`.
- Code `simulator/pass-conditioned-hidden-worlds.js`, data `runs/2026-10-25-pass-conditioned-1452440.json`. Scoreboard untouched.

## NEXT ACTION
Independent seeds >=1456440: unselected decision-state pass calibration and preregistered pass-aware action rule. Authenticate real branch locking.
