# 2026-11-28 16:51 Asia/Baku — redeal and full-round audit

Engine qosha-research-0.5.3 / recovered qosa-1.0.0, 3x9. Actual repository modules executed in isolated V8 CommonJS loader; node:assert/strict shim uses JSON structural equality for these plain fixtures. Native preflight and full gates not executed. README, RULES, EXPERIMENTS, STATUS and gates read; RESULTS.md exceeds connector limit and line-range returned empty, not overwritten. Source blobs: {"initializer-redeal-conservation-audit":"bd2c353a70574829d2b1a3a5e2269e5af833f092","engine":"82e5bd544a57683d5b4f7812beb2d4abf80da894","initializer":"2fad29e516454580ec9a06115354e9866f3096e6","redeal-full-round-audit":"a439b46473cac35a7d4e96bafe82136d1383f28b","round-driver":"fbaad78865adbddde1ea6651e6a501dc0bde3203","turn-kernel":"94657896e1f8e471ceb2e9a65d1842b6102dff18","turn-dispatcher":"55b0bcf3f1653c64b4e06bc95d7e917a480562a0"}.

Existing suite test() results (replays, not fresh independent cohorts): {"initializer":{"passed":true,"seedDraws":24,"uniqueAllocations":24,"assertions":2433,"previousWinnerInitializations":72,"firstRoundRedeals":1},"fullRound":{"passed":true,"rounds":24,"transitions":566,"inventorySnapshots":590,"assertions":5907}}.

Fresh audit: `require('./redeal-full-round-audit').runAudit({firstRoundStartSeed:28120000,firstRoundAcceptedDeals:300,continuationStartSeed:28121000,continuationSeedDraws:300})`.

```json
{
  "schema": "qosa-redeal-full-round-audit/v1",
  "timestamp": null,
  "engine": "qosha-research-0.5.3",
  "rules": "recovered qosa-1.0.0 coded model; 3 players x 9 tiles + one stock; physical branch/opening and block interpretation provisional",
  "policy": "deterministic seed/turn/player hash selects an index from current legal action list; validation policy only, not a strategic arm",
  "firstRound": {
    "startSeed": 28120000,
    "attemptEndSeed": 28120314,
    "attempts": 315,
    "acceptedDeals": 300,
    "redealSignals": 15,
    "retryHistogram": {
      "0": 287,
      "1": 11,
      "2": 2
    },
    "maxRetryObserved": 2,
    "uniqueAcceptedAllocations": 300,
    "duplicateAcceptedAllocations": 0,
    "metrics": {
      "rounds": 300,
      "finishes": 282,
      "blocks": 18,
      "unresolved": 0,
      "blockRate": 0.06,
      "meanTurns": 24.803333333333335,
      "medianTurns": 25,
      "minusFrequencies": {
        "0": 274,
        "-10": 8,
        "-20": 0,
        "-30": 0,
        "-40": 0
      },
      "meanTerminalPipsPerSeat": 6.681111111111111,
      "medianTerminalPipsPerSeat": 6,
      "meanTerminalHandSize": 1.038888888888889,
      "meanTerminalDoubles": 0.0044444444444444444,
      "transitions": 7141,
      "inventorySnapshots": 7441,
      "driverEquivalenceChecks": 7141,
      "playedTileChecks": 6884,
      "inRoundDraws": 0,
      "maxDrawsPerTurn": 0,
      "passTurns": 554,
      "actionTurns": 6587,
      "openingFollowups": 281,
      "openingPasses": 19,
      "openingDraws": 300,
      "finishDoublesTotal": 8
    }
  },
  "continuation": {
    "startSeed": 28121000,
    "endSeed": 28121299,
    "seedDraws": 300,
    "uniqueAllocations": 300,
    "duplicateSeedPairs": [],
    "stockOneOneDeals": 11,
    "handOwnedOneOneDeals": 289,
    "previousWinnerIndex": "seed modulo 3; used only when 1-1 is in stock",
    "metrics": {
      "rounds": 300,
      "finishes": 286,
      "blocks": 14,
      "unresolved": 0,
      "blockRate": 0.04666666666666667,
      "meanTurns": 24.686666666666667,
      "medianTurns": 25,
      "minusFrequencies": {
        "0": 276,
        "-10": 9,
        "-20": 0,
        "-30": 1,
        "-40": 0
      },
      "meanTerminalPipsPerSeat": 6.872222222222222,
      "medianTerminalPipsPerSeat": 6,
      "meanTerminalHandSize": 1.1088888888888888,
      "meanTerminalDoubles": 0.0022222222222222222,
      "transitions": 7106,
      "inventorySnapshots": 7406,
      "driverEquivalenceChecks": 7106,
      "playedTileChecks": 6829,
      "inRoundDraws": 0,
      "maxDrawsPerTurn": 0,
      "passTurns": 561,
      "actionTurns": 6545,
      "openingFollowups": 273,
      "openingPasses": 27,
      "openingDraws": 289,
      "finishDoublesTotal": 12
    }
  },
  "combined": {
    "rounds": 600,
    "transitions": 14247,
    "inventorySnapshots": 14847,
    "driverEquivalenceChecks": 14247,
    "playedTileChecks": 13713,
    "inRoundDraws": 0,
    "unresolved": 0
  },
  "assertions": 148377,
  "limitations": "Internal coded-model validation only; not physical-rule authentication or strategy evidence. In 3x9, the one stock tile is consumed during opening setup, so no in-round draw is expected in this cohort; draw-enabled paths remain covered by separate fixtures. Block winner/tie scoring and loneZero=10 remain unresolved. Seed replay does not prove PRNG uniformity."
}
```

Finding: full-deck conservation and manual dispatcher/driver equivalence checked after each transition, including first-round retry and continuation paths. No strategy contrast, win/first-place or regret estimate; branch semantics, block scoring and loneZero remain provisional. Historical 180,000 separate; prior 2,000 smoke rounds plus 600 new audit rounds = 2,600 across these two disjoint seed cohorts, not an all-time total. Next: native complete checkout/preflight and gate fingerprints, then matched policy contrasts. No live files changed.
