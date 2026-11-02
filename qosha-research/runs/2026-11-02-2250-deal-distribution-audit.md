# Exact 3x9 initial-deal distribution audit — 2026-11-02T22:50:39+04:00 (Asia/Baku)

- **Engine/rules:** qosha-research-0.5.3; recovered qosa-1.0.0, primary 3 players x 9 stones plus one stock tile.
- **Scope:** deal-generation validation only. No round, strategy, branch, block, or match-scoring simulation.
- **Seed set:** 0–49,999 (50,000 deal draws). Each draw checked 28-tile identity conservation, 9/9/9 hand sizes, one stock tile, and exact tile-position/double-count reference distributions.
- **Execution:** Node v22.16.0, 172 assertions passed in an isolated harness using the exact fetched engine.js blob (SHA 82e5bd544a57683d5b4f7812b2d4abf80da894). A clean GitHub checkout still fails on DNS, so this was not a repository checkout execution.

## Key results

- Mean starting doubles per 9-tile hand: **2.25224 / 2.24808 / 2.24776**, versus exact expectation **2.25**.
- For each specific tile, seat probability is exactly 9/28 and stock probability 1/28. Observed counts over 50,000 seeds ranged **15,841–16,283** per seat and **1,681–1,871** in stock; all passed the fixed 7-sigma smoke bands.
- The 1-1 appeared in seats **16,029 / 16,043 / 16,074** times and in stock 1,854 times (exact stock probability 1/28).
- Conditional on 1-1 being in a 9-tile hand, that pre-opening hand has 2 or 3 doubles with exact probability **68.09%**. Observed: 32,898 of 48,146 such hands (68.33%). This is deal-composition context, not a tactical advantage.

## Confidence and limitations

Exact hypergeometric references plus a deterministic finite-seed smoke test found no gross positional/distribution anomaly. The 7-sigma bands are deliberately broad regression guards; they are not a proof of PRNG uniformity. The starter statistic is before the mandatory opening draw/follow-up. The first-round 1-1-in-stock redeal, all round rules, strategy comparisons, and match outcomes are outside this audit. Unique allocations across the seed set were not deduplicated.

Separate game cohorts remain unchanged: 88,886 deal allocations, 1,074 selected multi-action positions, 5,863 state-world assignments; no global deduplication.

## Exact next action

Run the committed test and block/branch Node regressions in a clean checkout when GitHub DNS is available. Then test the initializer's mandatory 1-1 draw/follow-up as a separate invariant, retaining canonical-up as a representation convention rather than a physical preference.

- Reproducer: [deal-distribution-test.js](../simulator/deal-distribution-test.js)
- Machine record: [JSON](./2026-11-02-2250-deal-distribution-audit.json)
