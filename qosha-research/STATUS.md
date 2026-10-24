# Qoşa research status

Updated: 2026-10-24 21:54:12 +04

## Verified scale
- **645900** full-round continuations; **861808** forced hidden-world counterfactual continuations. Historical 4,000 separate.
- Engine qosa-research-0.5.3 / recovered qosa-1.0.0; primary 3×9. Real four-branch number locking PROVISIONAL.
- Fresh seeds used through **1416439**; next independent seed >= **1416440**.

## Latest checkpoint
- 4,800 fresh discovery rounds (4,631 finishes, 169 blocks, 0 unresolved); 169 eligible 3-stone positions, 2,704 matched hidden worlds and 10,816 forced counterfactual continuations.
- A genuinely different `random-legal` continuation confirmed the **many-minus-few finish-first versus minus-finish tradeoff**: +12.83 ±3.38 pp finish-first, −21.75 ±3.05 pp minus-finish; `min-hand-pips` continuation: +7.80 ±2.78 pp finish-first, −43.45 ±5.42 pp minus-finish (exploratory position-cluster 95% half-width).
- **Immediate next-opponent finish: 0/2704** sampled hidden worlds under either action; NOT a safety claim: no next-opponent one-stone positions, only 11 two-stone positions. Positive-control detector test passed.
- Code: `simulator/chain-next-opponent-threat.js`; complete data: `runs/2026-10-24-2154-chain-next-opponent-1411640.json`. V8 tests passed; Node CLI not run.
- Scoreboard/PWA untouched.

## NEXT ACTION
Fresh seeds >=1416440: deliberately target next-opponent 1–2 stone states, test immediate finish threat and few/many outcomes under genuinely different policies; authenticate four-branch lock and block winner/loneZero/bust before match scoring.
