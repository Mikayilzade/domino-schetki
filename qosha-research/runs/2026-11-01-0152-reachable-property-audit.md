# Reachable 3×9 trajectory property audit

**Timestamp:** 2026-11-01 01:52:41 +04 (Asia/Baku)  
**Engine:** qosa-research-0.5.3. Five core modules were fetched from GitHub and their local mirror Git blob hashes matched: engine.js 82e5bd544a57683d5b4f7812b2ed2d4abf80da894; initializer.js 8c3ba3b9baab4194a3e11b59db54fbf110fb2b49; turn-dispatcher.js 55b0bcf3f1653c64b4e06bc95d7e917a480562a0; turn-kernel.js 94657896e1f8e471ceb2e9a65d1842b6102dff18; round-driver.js fbaad78865adbddde1ea6651e6a501dc0bde3203.  
**Rules:** recovered qosa-1.0.0, 3 players × 9 tiles + one stock. For later-round 1-1-in-stock cases, previousWinnerIndex = seed mod 3. The seeded-uniform-legal policy is only a deterministic trajectory explorer, not a strategy.

## Workload and checks

- 200 seed draws, 3406020–3406219; **200 unique full allocations**, 0 duplicate allocations.
- **4,742 reachable decision states**; every one of **16,293 enumerated legal actions** was applied as a candidate transition.
- **0 tile-conservation, action/transition tile-count, stock-accounting, or round-driver/dispatcher agreement failures.** Every candidate successor retained exactly the 28 unique tiles across hands, stock, and played history.
- Five deterministic action-history replay checks passed: 3406020, 3406021, 3406022, 3406120, 3406219.
- The trajectory paths contained 4,398 plays and 344 forced passes; 170 selected plays used multiple tiles. The largest legal action set in one position had 64 choices.
- Opening accounting: 190 stock draws after the 1-1 starter was in a hand; 10 cases had 1-1 in stock and assigned the previous winner as starter; 9 opening follow-ups were forced passes. The stock was consumed during initialization in every 3×9 trajectory, so no in-round draw occurred in this cohort.
- Four separate draw/pass fixtures passed: legal in-hand play suppresses a draw; drawn tile can be played; unplayable draw is retained on pass; empty-stock pass does not draw.

## Outcome and limitations

All 200 trajectories reached an engine terminal state (192 finish, 8 block) within 33 turns including the opening setup. Block/branch semantics remain provisional; these terminal-kind counts are engine diagnostics only, not winner/tie scoring or strategy evidence. No strategy deals, strategy comparisons, or hidden worlds were added.

The existing five regression suites (test.js, turn-test.js, dispatcher-test.js, initializer-test.js, round-test.js) passed under Node v22.16.0 against the exact local mirror. A clean GitHub checkout/CLI remains DNS-blocked, so this is not described as a clean-checkout run.

**Next:** extend the property suite with targeted reachable multi-double and mixed-finish positions; keep strategy ranking blocked until physical branch reopening and blocked-round tie scoring are authenticated.

Machine-readable metrics: [2026-11-01-0152-reachable-property-audit.json](2026-11-01-0152-reachable-property-audit.json). Reproduce with node qosha-research/simulator/reachable-property-audit.js 3406020 200.