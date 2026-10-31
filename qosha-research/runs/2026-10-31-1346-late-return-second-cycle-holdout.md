# 2026-10-31T13:48:47.562+04:00 — independent later-turn chronological holdout

- **Engine/rules:** `qosa-research-0.5.3 + late-return-second-cycle-holdout/v1`; recovered `qosa-1.0.0` 3×9 + stock; both late-arrival branch interpretations **PROVISIONAL**.
- **Workload:** **2,048 NEW seeded conditional hidden allocations**, development `3394120..3395143` and disjoint holdout `3395144..3396167`; 0 new opening deals, 0 complete rounds, 0 full-game continuations. Every world starts from the same validated nine-event prefix, but advances a **new clockwise 3-turn cycle (seats 1,2,0)** with a deterministic low-pip common-legal-action policy. The resulting chronological extensions differ by world; only worlds with a common legal action at every step and >=2 common ordinary candidate placements are included in comparisons. The two provisional models are compared on the **same allocation and same physical actions**, never silently substituting an illegal move.
- **Development:** 316/1024 eligible, 390 no common action, 318 too few candidates, 772 candidate placements, **12352** two-opponent continuations; 30 distinct 3-turn extensions. Stopping-dependent pass-change worlds 41, branch-dependent 196, robust pass-safe 187; stopping mobility +320/−0.
- **Independent holdout:** 278/1024 eligible, 370 no common action, 376 too few candidates, 691 candidate placements, **11056** continuations; 31 distinct extensions. Stopping-dependent 32, branch-dependent 153, robust pass-safe 177; mobility +345/−0.
- **Combined:** 2048 sampled hidden allocations, **594 eligible later positions**, 1463 candidate placements, **23408** deterministic short continuations. Stopping-dependent forced-pass status in 73/594 eligible worlds; branch-dependent in 349/594. Robust pass-safe candidate in 364/594. These are **conditional selected-history frequencies, not natural-game win probabilities**.
- **Opponent continuation policy sensitivity:** repeating the *same first 1,024 seeds* with **high-pip** chronological extension selection gave 759 eligible positions, 108 stopping-affected and 422 branch-affected. This reuses worlds and **is not counted as new sampling**.
- **Validation:** original GitHub sources `engine.js`, `late-return-rule-sensitivity.js`, `late-return-voluntary-double-stop.js`, `late-return-hidden-holdout.js` were loaded into a V8 CommonJS-compatible harness; conservation, replay legality, same-world candidate actions, forced-pass honesty, deterministic first-16 seeds and repeated 32-seed prefix were checked. **Clean-checkout Node CLI remains pending.** No scoreboard/PWA files modified.
- **Interpretation/confidence:** previous one-fixed-late-hand findings are not automatically representative of the next chronological cycle. The additional cycle produces distinct reachable later histories and preserves stopping/branch sensitivity, but **no new confirmed winning tactic**. Severe conditioning: fixed public prefix, common-legal-action filtering, policy-dependent extension, no human choice likelihood; branch unlocking, blocked ties, `loneZero`, bust and 101 scoring unauthenticated. No valid full-round first-place, median remainder, block, minus, or regret inference.
- **Cumulative (separate populations):** **1,380,975** incompatible-model complete rounds unchanged; **1,898,856** full-game forced continuations unchanged; **630,000** opening deals unchanged; **1,187,216** seeded hidden allocations (prior 1,185,168 + 2,048). Historical 4,000 separate. Next unused seed **>=3396168**.
- **Reproduce:** `node qosha-research/simulator/late-return-second-cycle-holdout.js 3394120 1024 low` and `node qosha-research/simulator/late-return-second-cycle-holdout.js 3395144 1024 low`.
- **Exact next hypothesis/action:** run both batches in clean Node 22; investigate pass-safe candidates under **both** extension policies on disjoint histories; authenticate physical late-arrival reopening and blocked-tie scoring before any full-game winning/minus claim.

```json
{
  "timestamp": "2026-10-31T13:48:47.562+04:00",
  "dev": {
    "schema": "qosha-late-return-second-cycle-holdout/v1",
    "engine": "qosa-research-0.5.3 + late-return-second-cycle-holdout/v1",
    "rules": "recovered qosa-1.0.0 3x9; both physical branch models PROVISIONAL",
    "seedStart": 3394120,
    "seedEnd": 3395143,
    "seededConditionalWorlds": 1024,
    "extensionPolicy": "low",
    "models": [
      "global-ever-open",
      "all-current-only"
    ],
    "opponentPolicies": [
      "low",
      "high",
      "double-first",
      "double-last"
    ],
    "stopping": [
      "single",
      "greedy"
    ],
    "accepted": 316,
    "noCommonAction": 390,
    "fewerThanTwoCandidates": 318,
    "candidates": 772,
    "continuations": 12352,
    "stoppingAffectedWorlds": 41,
    "branchAffectedWorlds": 196,
    "robustPassSafeWorlds": 187,
    "stoppingPassFlips": 157,
    "branchPassFlips": 2217,
    "mobilityIncreases": 320,
    "mobilityDecreases": 0,
    "distinctChronologicalExtensions": 30,
    "distinctHiddenAllocations": 1024,
    "completeRounds": 0,
    "fullGameContinuations": 0,
    "limitations": "Synthetic selected prefix, common-action selection bias, unmodelled historical opponent choice likelihood, unverified branch reopening and blocked ties; no win/minus/regret inference"
  },
  "hold": {
    "schema": "qosha-late-return-second-cycle-holdout/v1",
    "engine": "qosa-research-0.5.3 + late-return-second-cycle-holdout/v1",
    "rules": "recovered qosa-1.0.0 3x9; both physical branch models PROVISIONAL",
    "seedStart": 3395144,
    "seedEnd": 3396167,
    "seededConditionalWorlds": 1024,
    "extensionPolicy": "low",
    "models": [
      "global-ever-open",
      "all-current-only"
    ],
    "opponentPolicies": [
      "low",
      "high",
      "double-first",
      "double-last"
    ],
    "stopping": [
      "single",
      "greedy"
    ],
    "accepted": 278,
    "noCommonAction": 370,
    "fewerThanTwoCandidates": 376,
    "candidates": 691,
    "continuations": 11056,
    "stoppingAffectedWorlds": 32,
    "branchAffectedWorlds": 153,
    "robustPassSafeWorlds": 177,
    "stoppingPassFlips": 113,
    "branchPassFlips": 1771,
    "mobilityIncreases": 345,
    "mobilityDecreases": 0,
    "distinctChronologicalExtensions": 31,
    "distinctHiddenAllocations": 1024,
    "completeRounds": 0,
    "fullGameContinuations": 0,
    "limitations": "Synthetic selected prefix, common-action selection bias, unmodelled historical opponent choice likelihood, unverified branch reopening and blocked ties; no win/minus/regret inference"
  },
  "highPolicySameWorlds": {
    "schema": "qosha-late-return-second-cycle-holdout/v1",
    "engine": "qosa-research-0.5.3 + late-return-second-cycle-holdout/v1",
    "rules": "recovered qosa-1.0.0 3x9; both physical branch models PROVISIONAL",
    "seedStart": 3394120,
    "seedEnd": 3395143,
    "seededConditionalWorlds": 1024,
    "extensionPolicy": "high",
    "models": [
      "global-ever-open",
      "all-current-only"
    ],
    "opponentPolicies": [
      "low",
      "high",
      "double-first",
      "double-last"
    ],
    "stopping": [
      "single",
      "greedy"
    ],
    "accepted": 759,
    "noCommonAction": 0,
    "fewerThanTwoCandidates": 265,
    "candidates": 2636,
    "continuations": 42176,
    "stoppingAffectedWorlds": 108,
    "branchAffectedWorlds": 422,
    "robustPassSafeWorlds": 436,
    "stoppingPassFlips": 616,
    "branchPassFlips": 6156,
    "mobilityIncreases": 1669,
    "mobilityDecreases": 38,
    "distinctChronologicalExtensions": 145,
    "distinctHiddenAllocations": 1024,
    "completeRounds": 0,
    "fullGameContinuations": 0,
    "limitations": "Synthetic selected prefix, common-action selection bias, unmodelled historical opponent choice likelihood, unverified branch reopening and blocked ties; no win/minus/regret inference"
  },
  "combined": {
    "worlds": 2048,
    "accepted": 594,
    "candidates": 1463,
    "continuations": 23408,
    "stoppingAffected": 73,
    "branchAffected": 349,
    "robustSafe": 364,
    "mobilityIncreases": 665,
    "mobilityDecreases": 0
  },
  "nextSeed": 3396168
}
```
