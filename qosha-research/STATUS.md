# Qoşa research status

Updated: 2026-10-24 01:45 (+04)

## Verified scale
- 324,900 independent full continuations under the current research engine, plus 532,608 paired hidden-world counterfactual continuations.
- Historical 4,000 rounds kept separate; quarantined older pre-fix run excluded.
- Latest engine `qosa-research-0.5.3`; recovered `qosa-1.0.0` rules, 3×9 primary.
- Full-round seed stability/invariants validated, but branch locking/opening still provisional pending a real-play fixture.

## Latest checkpoint
- `simulator/next-pass-mobility-guard-holdout.js` compares baseline, unrestricted next-pass same-tile tie-break, and tie-break guarded by own immediate legal-tile mobility.
- Fresh seeds 1372040..1373239; 1,200 deals, 21,600 full continuations, deterministic test green.
- Mobility guard does not reliably beat unrestricted tie-break across opponent profiles. No new universal strategy claim.

## NEXT ACTION
Stratify decisions by second opponent reply accessibility and own mobility sacrifice; evaluate on fresh disjoint seeds and validate a real-play branch-lock fixture. Do not edit live scoreboard/PWA files.
