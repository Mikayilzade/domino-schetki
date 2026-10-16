# Hand-stratified two-double holdout — 2026-10-16 15:53 Asia/Baku

- Engine `qosa-research-0.5.3`, recovered rules `qosa-1.0.0`; 3 players × 9 stones; later-round starter; branch opening provisional.
- Unique deals: 4000, A seeds 1090000..1091999, B seeds 1092000..1093999.
- Focal: closed-branch-control versus moderate-double-hold, identical deals/seats. Other two players: moderate-double-hold or fast-doubles.
- Inclusion: focal starts with exactly two doubles excluding 1-1. Target pair 2-2 + 6-6, compared to other pairs containing 6-6.
- Adjustment strata: starter status, 12-pip starting-hand sum bin, both doubles connected to ordinary tiles. Only strata with >=1 target and >=3 other-six seats. Target-weighted, not exact hand matching.
- Self-test: {"deterministic12":true,"deck":12,"unresolved":0}. V8 CommonJS evaluation; Node CLI not executed.
- Completed continuations 18084; eligible seat-policy comparisons 9042; unresolved 0.

| Set | Other players | Seats | Rounds | Overall control-minus-hold first-finish pp | 2-2+6-6 n | Pair delta pp | Adjusted incremental vs other-six pp | Target coverage |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| A | moderate-double-hold | 2199 | 4398 | 7.87 | 133 | 1.50 | -8.31 | 100.00% |
| A | fast-doubles | 2199 | 4398 | 6.96 | 133 | 20.30 | 9.60 | 100.00% |
| B | moderate-double-hold | 2322 | 4644 | 8.05 | 134 | 13.43 | 1.48 | 100.00% |
| B | fast-doubles | 2322 | 4644 | 7.49 | 134 | 14.93 | 1.46 | 100.00% |

## Additional metrics
- A/moderate-double-hold: first-finish control 39.88%, hold 32.01%; focal remainder difference -0.40 pips; minus-finish difference 5.37 pp; block difference 0.59 pp; mean turn difference 0.86; adjusted target covered 133/133, strata 10.
- A/fast-doubles: first-finish control 53.89%, hold 46.93%; focal remainder difference -0.04 pips; minus-finish difference 7.00 pp; block difference -0.64 pp; mean turn difference 1.03; adjusted target covered 133/133, strata 10.
- B/moderate-double-hold: first-finish control 40.22%, hold 32.17%; focal remainder difference -0.44 pips; minus-finish difference 6.07 pp; block difference 0.34 pp; mean turn difference 0.83; adjusted target covered 134/134, strata 12.
- B/fast-doubles: first-finish control 54.09%, hold 46.60%; focal remainder difference -0.10 pips; minus-finish difference 8.61 pp; block difference 0.04 pp; mean turn difference 1.06; adjusted target covered 134/134, strata 12.

## Interpretation and limitations
- Do not claim 2-2+6-6 has an intrinsic advantage from this result. Adjusted contrasts remain observational, with small target cells and no deal-cluster uncertainty intervals.
- Paired-policy effects are model-specific. Finish-first excludes blocks (block winner unassigned); not match win rate. Separate −10/−20/−30/−40 rates not measured in this runner.
- Recovered branch/open rules remain assumption-labelled. All rounds are deterministic V8 executions; independent Node CLI confirmation is pending.
- Previously recorded GitHub rounds: 456680. This run adds 18084 distinct continuations; recorded cumulative 474764. Quarantined 11272 and 33496 rounds excluded; historical 4000 excluded.
- No scoreboard/PWA files touched.

## Reproduce
From repo root:
`node qosha-research/simulator/two-double-confound-runner.js 1090000 2000 moderate-double-hold`
`node qosha-research/simulator/two-double-confound-runner.js 1090000 2000 fast-doubles`
`node qosha-research/simulator/two-double-confound-runner.js 1092000 2000 moderate-double-hold`
`node qosha-research/simulator/two-double-confound-runner.js 1092000 2000 fast-doubles`

## Exact next action
Implement deal-cluster bootstrap intervals for adjusted target-vs-other-six contrasts; match on connector patterns and all other starting tiles, then compare against a new independent seed holdout. Avoid announcing a special double-pair trick without replicated uncertainty-controlled evidence.

## Run data
```json
{
  "engine": "qosa-research-0.5.3",
  "splits": [
    {
      "label": "A",
      "seed": 1090000,
      "count": 2000
    },
    {
      "label": "B",
      "seed": 1092000,
      "count": 2000
    }
  ],
  "rounds": 18084,
  "eligible": 9042,
  "unresolved": 0,
  "result": [
    {
      "label": "A",
      "seed": 1090000,
      "count": 2000,
      "opponents": {
        "moderate-double-hold": {
          "checks": {
            "deals": 2000,
            "eligible": 2199,
            "rounds": 4398,
            "unresolved": 0,
            "deck": 2000
          },
          "overall": {
            "n": 2199,
            "controlFinish": 0.39881764438381084,
            "holdFinish": 0.32014552069122326,
            "deltaPP": 7.867212369258754,
            "meanPipsDelta": -0.39881764438381084,
            "minusDeltaPP": 5.366075488858572,
            "blockDeltaPP": 0.5911778080945884,
            "meanTurnDelta": 0.8590268303774443,
            "pairedGain": 398,
            "pairedLoss": 225
          },
          "pair26": {
            "n": 133,
            "controlFinish": 0.3157894736842105,
            "holdFinish": 0.3007518796992481,
            "deltaPP": 1.5037593984962405,
            "meanPipsDelta": -0.3157894736842105,
            "minusDeltaPP": 2.255639097744361,
            "blockDeltaPP": 0.7518796992481203,
            "meanTurnDelta": 1.0601503759398496,
            "pairedGain": 19,
            "pairedLoss": 17
          },
          "adjusted": [
            {
              "comparator": "other6",
              "targetSeats": 133,
              "coveredTargetSeats": 133,
              "coverage": 1,
              "strata": 10,
              "adjustedDifferencePP": -8.314476383762242
            },
            {
              "comparator": "all",
              "targetSeats": 133,
              "coveredTargetSeats": 133,
              "coverage": 1,
              "strata": 10,
              "adjustedDifferencePP": -6.865348196168294
            }
          ]
        },
        "fast-doubles": {
          "checks": {
            "deals": 2000,
            "eligible": 2199,
            "rounds": 4398,
            "unresolved": 0,
            "deck": 2000
          },
          "overall": {
            "n": 2199,
            "controlFinish": 0.538881309686221,
            "holdFinish": 0.4693042291950887,
            "deltaPP": 6.957708049113233,
            "meanPipsDelta": -0.04365620736698499,
            "minusDeltaPP": 7.0031832651205095,
            "blockDeltaPP": -0.6366530241018645,
            "meanTurnDelta": 1.0331969076853116,
            "pairedGain": 429,
            "pairedLoss": 276
          },
          "pair26": {
            "n": 133,
            "controlFinish": 0.5639097744360902,
            "holdFinish": 0.3609022556390977,
            "deltaPP": 20.30075187969925,
            "meanPipsDelta": -0.7669172932330827,
            "minusDeltaPP": 12.030075187969924,
            "blockDeltaPP": -7.518796992481203,
            "meanTurnDelta": 0.8195488721804511,
            "pairedGain": 38,
            "pairedLoss": 11
          },
          "adjusted": [
            {
              "comparator": "other6",
              "targetSeats": 133,
              "coveredTargetSeats": 133,
              "coverage": 1,
              "strata": 10,
              "adjustedDifferencePP": 9.595806655131286
            },
            {
              "comparator": "all",
              "targetSeats": 133,
              "coveredTargetSeats": 133,
              "coverage": 1,
              "strata": 10,
              "adjustedDifferencePP": 12.721474705580011
            }
          ]
        }
      }
    },
    {
      "label": "B",
      "seed": 1092000,
      "count": 2000,
      "opponents": {
        "moderate-double-hold": {
          "checks": {
            "deals": 2000,
            "eligible": 2322,
            "rounds": 4644,
            "unresolved": 0,
            "deck": 2000
          },
          "overall": {
            "n": 2322,
            "controlFinish": 0.40223944875107664,
            "holdFinish": 0.32170542635658916,
            "deltaPP": 8.05340223944875,
            "meanPipsDelta": -0.4388458225667528,
            "minusDeltaPP": 6.072351421188631,
            "blockDeltaPP": 0.34453057708871665,
            "meanTurnDelta": 0.8255813953488372,
            "pairedGain": 432,
            "pairedLoss": 245
          },
          "pair26": {
            "n": 134,
            "controlFinish": 0.4552238805970149,
            "holdFinish": 0.3208955223880597,
            "deltaPP": 13.432835820895523,
            "meanPipsDelta": -0.5074626865671642,
            "minusDeltaPP": 7.462686567164179,
            "blockDeltaPP": 0.746268656716418,
            "meanTurnDelta": 0.8283582089552238,
            "pairedGain": 34,
            "pairedLoss": 16
          },
          "adjusted": [
            {
              "comparator": "other6",
              "targetSeats": 134,
              "coveredTargetSeats": 134,
              "coverage": 1,
              "strata": 12,
              "adjustedDifferencePP": 1.4845544242592057
            },
            {
              "comparator": "all",
              "targetSeats": 134,
              "coveredTargetSeats": 134,
              "coverage": 1,
              "strata": 12,
              "adjustedDifferencePP": 4.997801345848653
            }
          ]
        },
        "fast-doubles": {
          "checks": {
            "deals": 2000,
            "eligible": 2322,
            "rounds": 4644,
            "unresolved": 0,
            "deck": 2000
          },
          "overall": {
            "n": 2322,
            "controlFinish": 0.540913006029285,
            "holdFinish": 0.46597760551248923,
            "deltaPP": 7.493540051679587,
            "meanPipsDelta": -0.1029285099052541,
            "minusDeltaPP": 8.613264427217915,
            "blockDeltaPP": 0.04306632213608958,
            "meanTurnDelta": 1.0645994832041343,
            "pairedGain": 487,
            "pairedLoss": 313
          },
          "pair26": {
            "n": 134,
            "controlFinish": 0.5522388059701493,
            "holdFinish": 0.40298507462686567,
            "deltaPP": 14.925373134328357,
            "meanPipsDelta": -0.5970149253731343,
            "minusDeltaPP": 11.194029850746269,
            "blockDeltaPP": -1.492537313432836,
            "meanTurnDelta": 1.1865671641791045,
            "pairedGain": 36,
            "pairedLoss": 16
          },
          "adjusted": [
            {
              "comparator": "other6",
              "targetSeats": 134,
              "coveredTargetSeats": 134,
              "coverage": 1,
              "strata": 12,
              "adjustedDifferencePP": 1.4554611182992463
            },
            {
              "comparator": "all",
              "targetSeats": 134,
              "coveredTargetSeats": 134,
              "coverage": 1,
              "strata": 12,
              "adjustedDifferencePP": 6.718592311700093
            }
          ]
        }
      }
    }
  ]
}
```
