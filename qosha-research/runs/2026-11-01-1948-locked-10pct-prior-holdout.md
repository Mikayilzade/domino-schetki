# Locked 10% prior holdout + branch-lock reachable-state contract — 2026-11-01 19:48:28 +04 (Asia/Baku)

## Reproducible cohort

- Engine: `qosha-research-0.5.3`; rules: recovered `qosa-1.0.0`, 3 players × 9 stones + 1 stock.
- Pass-choice runner: `simulator/pass-choice-prior-grid.js`; branch property runner: `simulator/branch-lock-reachability-contract.js`.
- Source modules were fetched from current GitHub `main` and executed in a V8 CommonJS-compatible harness. A clean native Node checkout remains blocked by container DNS; no source was edited for this run.
- The 10% closed-control prior was fixed from the earlier discovery cohort (seeds `3412770–3412969`). The reported holdout estimate uses that prior without re-selection; other prior-grid outputs were ignored for the holdout conclusion.

## Locked pass-choice holdout

- Seeds `3413170–3413569`: **400 unique complete deal allocations**, 0 duplicate deals; 400 deterministic replay checks and 400 28-tile conservation checks passed.
- Four synthetic opponent mixes × three focal-seat rotations: **4,800 diagnostic rounds**, 4,627 finishes / 173 blocks (**3.60%**), mean 25.485 turns, 0 unresolved. Minus finishes: −10 711, −20 16, −30 0, −40 0. This is pass-label calibration, not a strategy tournament.
- Selected 255 public-pass-informed positions; 78 uncertain positions / 113 uncertain action labels (397 certain labels).
- Label-weighted Brier (lower is better): pass-only **0.104728**; locked 10% mixture **0.105999**. The raw label-weighted mixture is slightly worse.
- Paired state-clustered gain (pass-only minus mixture): **+0.000939 ± 0.012501** approximate 95% half-width; interval **[−0.011562, +0.013440]**. It includes zero. Label-weighted Brier differences and state-clustered gains differ because the latter weights each visible position equally.
- Hidden worlds: 16,320 draws; **4,330 unique complete allocations within visible states**, 11,990 repeats. Mean ESS 52.71/64 (82.35%); mean unique worlds per selected state 32.45. These are per-state counts, not global unique allocations.

### Independent pooled holdout check

Combining the previous independent 10% holdout (seeds `3412970–3413169`, 35 uncertain positions / 46 labels) with this disjoint fixed-prior cohort gives **113 positions / 159 labels**:

- Pass-only Brier **0.110219**; locked 10% Brier **0.110240**.
- State-clustered gain **+0.002363 ± 0.009358** (approx. 95%); interval **[−0.006995, +0.011721]**.

No reliable predictive gain. **The discovery-selected 10% prior does not replicate as a useful improvement; no tactic is promoted.** Choice-history weighting is closed as unsupported for now.

## Reachable-state engine contract

- Seeds `3413570–3414119`: **550 unique allocations**, 0 duplicates (50-deal pilot + 500-deal contract run).
- **13,053 reachable positions**; 44,911 legal action candidates applied for transition checks: 35,567 singles, 9,295 double sequences, 49 mixed finishes. 985 pass transitions, 0 draws; 9,919 multi-action positions.
- 520 finishes / 30 blocks; 0 unresolved; maximum 32 turns.
- Regression checks passed: engine/deal, ordinary turn, round driver, finish-minus; four-branch kernel (24 four-double orders, synthetic −40); branch/block contract; scoring contract (1,056 assertions); branch-lock reachable-state contract.
- Tests verify the coded model's action/apply round trips, tile conservation, opened-number updates, inactive-side rejection, double-only geometry, mixed-finish exposure after its ordinary prefix, pass transitions, and configured finish classes. They **do not authenticate** physical four-branch locking/reopening or the blocked-round winner.

## Cumulative scale and limits

- Separate validation/opening/tie-break allocation cohort: **7,550** (prior 7,150 + this 400-deal full diagnostic cohort; the earlier preflight on the same seeds is not counted twice).
- Reachable-position property audits: **52,315** (39,262 previous + 13,053 this run).
- Branch-lock audit allocations tracked separately: 550 unique deals.
- Strategy-strength holdout remains **1,500 deals / 18,000 arm-rounds** (+ separate 120-deal / 1,440-arm pilot); this run adds no strategy-tournament arms.
- High confidence in deterministic replay, allocation accounting, and coded invariants; low external validity for synthetic choice likelihood. Four-side number-lock, late reopening, block/tie scoring, `loneZero=10`, and 101-point match semantics remain provisional/unverified.

## Exact next action

Stop re-tuning prior weights. Continue with a fresh branch-label action/transition permutation audit and isolated block-scoring fixtures; keep disputed rules labelled provisional unless an authentic real-game trace or explicit ruling is available.
