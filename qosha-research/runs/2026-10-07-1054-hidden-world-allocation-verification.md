# 2026-10-07 10:54 (+04) — hidden-world allocation verification

- engine/rules target: `qosa-research-0.6.1` / recovered `qosa-1.0.0` 3×9 rules
- strategy deals added: 0; cumulative validated strategy rounds remain 180,000
- world seeds: `700..724` (25 deterministic hidden worlds)
- fixture: focal hand `1-2,1-3`; 10 known/played tiles; hidden opponent sizes 8+7; stock 1
- verification: independent reimplementation of the persisted `mixSeed` + xorshift + Fisher–Yates allocation logic produced **25/25 unique actual hidden allocation fingerprints**
- persisted regression: `simulator/hidden-world-test.js` already asserts the same 25/25 property and fixed visible candidate set
- execution limitation: this runtime could not clone GitHub to execute the Node regression suite (network/DNS unavailable to container); therefore Node green is not claimed
- new finding: the previous allocation-diversity blocker is independently satisfied for seeds 700..724; no gameplay-strategy claim yet
- confidence: high for allocation uniqueness; paired decision-regret remains unvalidated until executable Node regressions run
- exact next action: execute `hidden-world-test.js` and `decision-regret-test.js`; if green, persist the first numerical 25-world paired-regret table using the same seeds and continuation policy.
