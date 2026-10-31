# Reachable four-branch lock/open contract

**Timestamp:** 2026-11-01 03:54:47 +04 (Asia/Baku)  
**Engine:** `qosa-research-0.5.3` + `branch-lock-reachability-contract/v1`  
**Rules scope:** recovered `qosa-1.0.0`, 3 players × 9 stones + one stock. Four-branch opening, late-arrival unlocking, and block/tie scoring remain **PROVISIONAL**.

## Workload

- Seed draws: **500**, `3406720–3407219`; **500 unique full allocations**, 0 duplicates.
- **11,795 reachable decision positions**; **41,451 legal action candidates applied**.
- Candidate types: 32,482 single; 8,912 double-sequence; 57 mixed-finish.
- Actual traversal: 924 forced passes, 0 in-round draws, 8,949 positions with multiple actions; 476 finish / 24 block terminal kinds (diagnostic only; not strategy data).

## Contract checks

- Tile conservation, action identity, hand remainder, stock accounting, and exact opened-number updates: **0 failures**.
- Ordinary singles are gated by an opened number; inactive sides reject placements.
- A single/mixed ordinary prefix changes only its selected branch. Double-only sequences preserve branch geometry.
- All 24 orders of the four exposed doubles `2-2, 3-3, 4-4, 5-5` applied and opened the same set.
- **Mixed-finish check:** a finish double is tested against the branch geometry *after* the ordinary prefix. That prefix may expose the double's number; checking only the pre-prefix state would be an invalid test assumption.
- The exact late-arrival chronology fixture passed: same played set and final branch ends; global-ever-open legal count 8 in both histories, while current-only legal count falls from 8 to 5. The three affected tiles are `0-2, 2-5, 2-6`. This is model-specific, not physical-rule authentication.

## Finding and confidence

The current research kernel's reachable lock/open transitions are internally consistent for this cohort. Chronology matters under the current-only provisional interpretation; the global-ever-open fixture is order-invariant. **No reliable tactical finding**: no strategy arms or hidden worlds were sampled.

High confidence for internal property checks; low external validity. A read-only inspection of the scoreboard files found manual score-entry/statistics, not a branch-rule engine, so it does not resolve the physical late-arrival rule. The clean GitHub clone/Node CLI remains DNS-blocked; exact GitHub-fetched source blobs were executed in a V8 CommonJS-compatible harness.

## Cumulative scale and next action

Across the three sequential property-audit cohorts: **1,200 unique 3×9 allocations, 27,399 reachable positions, 98,933 candidate applications**. Strategic populations are unchanged: 1,500 action-orbit holdout deals / 18,000 arm-rounds (+ separate 120-deal pilot / 1,440 arm-rounds). Legacy incompatible-model populations and the historical baseline remain separate.

**Next:** run 24-permutation branch-label action/transition checks on a stratified sample of these reachable states; obtain an authenticated real-game trace/ruling for late-arrival branch unlocking and blocked-tie scoring before strategy rankings.
