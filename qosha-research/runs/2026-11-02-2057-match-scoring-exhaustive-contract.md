# Exhaustive active-PWA match-scoring contract — 2026-11-02T20:57:24+04:00 (Asia/Baku)

## Scope

Expanded the source-derived match-scoring regression suite. This is an implementation-contract audit, not a physical-rule ruling and not a domino gameplay cohort. No round engine, live scoreboard/PWA file, or strategy was changed.

## Tests

Node v22.16.0, isolated temporary harness. The fetched `match-scoring.js` adapter and the exact `applyScoreDelta(score,delta){return Math.max(0,score+delta);}` helper expression from the verified research engine blob were exercised locally. The repository checkout itself remained unavailable because the container cannot resolve GitHub DNS; the new committed test imports the repository module normally.

- Existing `match-scoring-test.js`: **23 assertions passed**.
- New `match-scoring-exhaustive-test.js`: **64,066 assertions passed**:
  - 8,080 non-zero score/delta cases across scores 0–100 and deltas −40…+40;
  - 101 zero-event no-op cases;
  - 10,201 survivor score-pair rankings, including stable input-order ties;
  - all 120 explosion orders for five entities, checking that the result gate stops with two survivors after the third explosion.
- Total this run: **64,089 assertions passed**.

Verified source blobs: `engine.js` `82e5bd544a57683d5b4f7812b2d4abf80da894`; `match-scoring.js` `8e91a87672cca56d65fa6ac6e07d4eb3589d019b`; existing `match-scoring-test.js` `d51c2491975a74ab6241a8c0a350221a9264fe78`.

## Finding and limitations

The tested adapter contract is internally consistent for score flooring, the 101 threshold, survivor ranking, and the five-player stop-at-two sequence. This validates code behavior only. It does **not** authenticate the physical table rules, the exact meaning of `loneZero=10`, block winner/tie allocation, or branch lock/open semantics. No tactical finding; no strategy promoted.

## Cohort and cumulative scale

- New deals: 0; seeds: none; strategies: none.
- Separate prior game cohorts unchanged: 88,886 deal allocations, 1,074 selected multi-action positions, 5,863 state-world assignments; additive summaries with no global deduplication.

## Exact next action

Run the committed test in a clean repository Node checkout when available, then return to the primary engine-validation queue: authenticated branch lock/open behavior and blocked-round winner/tie fixtures. Keep match scoring as the named source-derived PWA contract and keep `loneZero=10` unresolved until a concrete rule fixture is supplied.

Test: [match-scoring-exhaustive-test.js](../simulator/match-scoring-exhaustive-test.js)  
Data: [JSON run record](./2026-11-02-2057-match-scoring-exhaustive-contract.json)
