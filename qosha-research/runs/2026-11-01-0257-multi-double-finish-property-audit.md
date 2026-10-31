# Reachable multi-double and mixed-finish property audit

**Timestamp:** 2026-11-01 02:57:11 +04 (Asia/Baku)  
**Engine/rules:** qosa-research-0.5.3; recovered qosa-1.0.0, primary 3 players × 9 stones + one stock. Physical branch reopening and block/tie scoring remain provisional.  
**Runner:** simulator/multi-double-finish-property-audit.js

## Cohort and method

- 500 seeded deal draws, seeds **3406220–3406719**; **500 unique allocations**, 0 duplicate allocations.
- Node v22.16.0 local harness; current research modules were mirrored from GitHub for execution. A clean GitHub checkout remains DNS-blocked, so this is not claimed as a clean-checkout run.
- Every reachable legal action at each visited decision position was applied and checked. Path selection was seeded legal exploration, with a mixed-finish action deliberately selected whenever available to enrich validation coverage. This is an engine test policy, **not a strategy**.

## Results

- **10,862 reachable decision positions**; **41,189 candidate actions applied**.
- 8,997 double-sequence candidates; **3,466 multi-double candidates** (sequence length ≥2); maximum sequence length observed: **4**.
- **46 mixed-finish action candidates**: 44 with one finishing double and 2 with two. The coverage policy selected 43 mixed finishes during its paths.
- No tile-conservation, played-tile/remainder, branch transition, opened-number transition, or finish-minus invariant failed.
- Direct finish-minus contract and existing finish-minus integration test passed for **−10/−20/−30/−40**. No all-double terminal candidate occurred in this reachable cohort; that absence is not evidence of impossibility. The −30/−40 contract check is direct classification coverage, not a reachable-game observation.
- Existing dispatcher and round-driver regression tests also passed in the same local harness.
- **0 strategy deals, 0 strategy comparisons, 0 hidden worlds.** Path finish counts are intentionally coverage-biased and are not population metrics.

## Finding, confidence, and limitation

The current research dispatcher consistently applies reachable multi-double and mixed-finish actions: tile counts and identities, remaining hand, opening-state changes, branch updates, and finish-minus markers matched the tested contracts. Confidence is high for these internal invariants over this seeded cohort, but this does not authenticate the physical branch rule or establish a tactical advantage.

## Exact next action

Add targeted four-branch locked/open and late-arrival regression properties. Keep strategy rankings blocked until physical branch reopening and blocked-tie scoring are confirmed.

Machine-readable metrics: [JSON](2026-11-01-0257-multi-double-finish-property-audit.json).
