# Exhaustive synthetic block-candidate seat-permutation contract — 2026-11-03T05:48:35+04:00 (Asia/Baku)

## Scope and reproducibility

- **Engine/rules:** qosha-research-0.5.3; recovered qosa-1.0.0. Block winner/tie allocation remains unresolved.
- **Experiment:** exhaustive synthetic remainder vectors, not full rounds. For each of 3 and 5 seats, every vector with per-seat pip remainder 0–5 was checked under every seat permutation.
- **Deals/seeds:** 0 deals; no seed set (deterministic exhaustive enumeration).
- **Strategies:** none. This is a candidate-rule metamorphic audit, not a strategy comparison.
- **Reproducer:** `simulator/block-winner-permutation-contract.js`.

## Results

- Vectors: 216 for 3 seats and 7,776 for 5 seats.
- Seat-permutation cases: 1,296 (3 seats) and 933,120 (5 seats), 934,416 total.
- **7,472,736 assertions passed** across candidate-set mapping, unique-minimum/no-winner-on-tie mapping, illustrative equal-share mapping, and last-passer candidate mapping with passer identity relabelled.
- No invariant-policy mismatch.

The explicitly order-sensitive policy “first minimum in the current seat-array order” selected a different tied candidate than the original-order reference in **186,485 / 346,026 = 53.89%** of tied permutation comparisons. By tie size, the rates were 50.00% (2-way), 66.67% (3-way), 75.00% (4-way), and 80.00% (5-way), exactly the expected (1-1/k) identity-change rate under all seat permutations.

## Finding and limits

The minimum-pip candidate **set** is seat-permutation invariant. Candidate policies that preserve identity semantics—unique minimum or unresolved tie; last-passer priority after remapping the passer; and an illustrative equal-share vector—also map correctly. A raw array-index tie-break is representation-sensitive when the minimum is tied.

This is a structural/combinatorial result, not a tactical finding. The mismatch rate is expected from the definition of the raw-order policy; it does not imply a real-table seat advantage. The remainder vectors are synthetic and not claimed to be legal or reachable blocked hands. No winner, point award, tie split, or physical block rule is authenticated.

## Cumulative separate cohorts

No deal or strategy cohort was added. Existing cohorts remain separate and unchanged: 2,120 matched tie-break seed draws / 12,720 paired rounds; 88,886 prior deal allocations; 1,074 selected multi-action positions; 5,863 state-world assignments; and 5,000 invariant-smoke rounds. No global deduplication across cohorts and no pooling with the historical baseline.

## Exact next action

Collect **reachable blocked states** under explicitly labelled branch/block models, compare minimum-pip candidate sets and tie frequencies, and retain all candidate winner/tie interpretations as provisional. Do not assign block points or promote a winner rule without physical-rule evidence.
