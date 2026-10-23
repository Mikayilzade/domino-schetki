# Qoşa research status

Updated: 2026-10-24 02:51 (+04)

## Verified scale
- **335,700** independent full continuations under current research engine, plus **532,608** paired hidden-world counterfactual continuations.
- Historical 4,000 rounds separate; quarantined pre-fix run excluded.
- Engine `qosa-research-0.5.3`; recovered `qosa-1.0.0` rules, primary 3×9.
- Deterministic round invariants and matched-seed replay passed; branch locking/opening remains provisional pending real-play fixture.

## Latest checkpoint
- `simulator/next-pass-second-opponent-audit.js` checks whether pass-oriented side selection changes the SECOND opponent's actual legal replies (audit only, not policy).
- Seeds 1373240..1373839: 600 deals, 10,800 full matched continuations, replay green.
- In 565 unrestricted changed placements, second opponent lost playable tiles 358 times vs gained 24; however win gains remain small and exploratory. No universal strategy rule established.

## NEXT ACTION
Validate own-mobility sacrifice and second-opponent accessibility strata on independent seeds 1373840+, then obtain a real-game branch opening/locking fixture. Do not edit live scoreboard/PWA files.
