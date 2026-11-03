# Mixed-finish exhaustive contract and score-floor boundary audit — 2026-11-03T09:49:17+04:00 (Asia/Baku)

- **Engine/rules:** qosha-research-0.5.3; recovered qosa-1.0.0; primary 3×9 model. Four-branch geometry and physical branch/opening semantics remain provisional.
- **Deals / seeds:** 0 simulated deals. No RNG or seed set was used; this was deterministic fixture enumeration.
- **Coverage:** mixed finish after an ordinary prefix with 1, 2, 3, and 4 closing doubles. Exhaustively applied all sequence orderings: 1 + 2 + 6 + 24 = **33** transitions. Three negative fixtures cover a closed prefix source, an inactive required branch, and an already-open double number.
- **Results:** new regression test passed **1,095 assertions**. It checked exact tile removal/conservation for the played hand, ordinary-prefix branch update, double-sequence geometry preservation, exact opened-number set, finish classification, and −10/−20/−30/−40 mapping. Score-floor integration covered **408** score/magnitude pairs (scores 0–101 × four minus sizes).
- **Existing contract checks rerun:** finish-minus integration passed for all four finish sizes; score-floor contract passed **41,237 assertions**; four-branch lock fixture passed, including all **24** four-double sequence orderings.
- **Finding:** the current dispatcher/kernel implementation is internally consistent across these fixtures. This is implementation validation only; it does not authenticate the physical rule interpretation or establish a strategic advantage. No strategy or deal sample was added.
- **Confidence / limits:** high for deterministic code-level fixture coverage; no external table-rule validation. loneZero=10, block winner/tie scoring, and physical branch-lock/reopening behavior remain unresolved.
- **Cumulative scale:** this run adds 0 deals and 0 strategy comparisons. The separate block-audit series remains 6,000 seed draws / 144,000 model-rounds; tie-break, hidden-world, and earlier smoke cohorts remain separate and are not pooled with the historical baseline.
- **Exact next action:** test draw-one-then-play/pass when the drawn tile enables a double sequence or mixed finish; verify stock consumption, pass counter reset/increment, hand conservation, and finish precedence. Keep branch/block assumptions labelled.
- **Reproducer:** [test](../simulator/mixed-finish-exhaustive-contract-test.js).
