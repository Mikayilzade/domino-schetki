# Equal-pip double-opening: number and support independent holdout

- Timestamp (Asia/Baku): 2026-10-21T07:52:56 +04:00
- Engine/rules: qosa-research-0.5.3 / qosa-1.0.0; 3×9; branch opening provisional.
- Independent seeds: min-pips 1321000..1321180 (end exclusive), branch-control 1325000..1325174 (end exclusive).
- 354 deals scanned; 200 positions; 8000 hidden worlds; 32000 matched candidate continuations; 0 unresolved; 0 full strategy rounds added.
- Comparison: same-state one double X-X vs one ordinary A-B with A+B=2X; equal discarded pips; identical hidden worlds and two continuation bots.
- V8 CommonJS regression: {"passed":true,"positions":4,"continuations":48}; Node CLI not run.

## Aggregate double minus single
- Immediate next-player distinct playable tile types: 1.804 (exploratory 95% CI 1.692..1.916).
- First-finisher, min-pips: -15.41 pp; branch-control: -12.86 pp.
- Mean focal remaining-pips difference: min-pips 1.201, branch-control 1.256.

## Pre-specified exploratory strata
| Stratum | Positions | Mobility Δ | First-finisher Δ min-pips | First-finisher Δ branch |
|---|---:|---:|---:|---:|
| support0 | 26 | 2.395 | -18.85 pp | -12.02 pp |
| support1 | 82 | 1.926 | -12.56 pp | -11.89 pp |
| support2plus | 92 | 1.529 | -16.98 pp | -13.97 pp |
| nextAtMostTwo | 0 | — | n/a | n/a |
| nextThreePlus | 200 | 1.804 | -15.41 pp | -12.86 pp |
| focalAtMostFour | 7 | 1.668 | -19.29 pp | -20.36 pp |
| focalFivePlus | 193 | 1.809 | -15.27 pp | -12.59 pp |
| mobilityIncrease | 198 | 1.822 | -15.52 pp | -12.88 pp |
| mobilityNonIncrease | 2 | 0.000 | -5.00 pp | -11.25 pp |
| double1 | 0 | — | n/a | n/a |
| double2 | 69 | 1.700 | -17.57 pp | -13.12 pp |
| double3 | 76 | 1.730 | -13.82 pp | -9.90 pp |
| double4 | 37 | 2.012 | -17.16 pp | -15.74 pp |
| double5 | 18 | 2.092 | -10.28 pp | -18.47 pp |

## Interpretation and limits
- Only X=1..5 can have an ordinary equal-pip alternative in double-six; 0-0 and 6-6 cannot be evaluated with this design. These numbers are NOT zero-effect findings.
- Subgroup differences may reflect hand connectivity, changed available branch geometry, and first-eligible selection. Do not interpret a positive subgroup as a universal opening rule; CI by position, overlapping subgroups and post-hoc inspection are exploratory.
- Fixed bots, uniform hidden allocations without opponent-choice likelihood, provisional locked/open semantics, blocks have no assigned winner, first finisher is not full-match winner. Historical 264900 full strategy continuations and 17280 canonical continuations remain separate.
- New strategic claim: replicated model-specific association of early opening with lower first-finisher chance; still NOT causal/human-universal.

## Exact next hypothesis/action
- On independent seeds >=1329000 oversample cases where opening increases next-player mobility by <=0 and where it wins under both bots. Compare **same post-action next-player legal tile set**, focal X-connector count, number X and next-hand size; if no overlap exists, report non-identifiability instead of claiming causal branch effect.
- Reproduce: `node qosha-research/simulator/equal-pip-number-support.js test` then `node qosha-research/simulator/equal-pip-number-support.js 1321000 1329000 200 40`.
- Raw linked rows: `runs/2026-10-21-0750-equal-pip-number-support.json`.
