# Qoşa açdı research — current status

Last checkpoint: 2026-11-03T05:48:35+04:00 Asia/Baku.

- Latest checkpoint: exhaustive synthetic block-candidate seat-permutation contract. It enumerated 216 three-seat and 7,776 five-seat remainder vectors (per-seat pips 0–5), then all 6 / 120 seat permutations.
- 934,416 permutation cases and 7,472,736 assertions passed for minimum-candidate set mapping, unique-minimum/no-winner-on-tie mapping, illustrative equal-share mapping, and last-passer identity mapping.
- The raw “first minimum by current array order” tie-break changed selected tied identity in 186,485 / 346,026 comparisons (53.89%). This is expected combinatorics and representation sensitivity, not a tactical or real-seat advantage.
- Scope: synthetic vectors only; no legal blocked hands, deals, strategy rounds, point allocation, or physical winner/tie rule authenticated. Block scoring remains unresolved.
- No strategy promoted. No deal cohort added. Existing separate cohorts remain: 2,120 tie-break seed draws / 12,720 paired rounds; 88,886 prior allocations; 1,074 multi-action positions; 5,863 state-world assignments; 5,000 invariant-smoke rounds. No cross-cohort global dedup or historical-baseline pooling.
- Exact next action: sample reachable blocked states under explicitly labelled branch/block models; record candidate sets/tie frequencies only, without assigning points or promoting a winner rule.

Report: qosha-research/runs/2026-11-03-0548-block-winner-permutation-contract.md
Data: qosha-research/runs/2026-11-03-0548-block-winner-permutation-contract.json
Reproducer: qosha-research/simulator/block-winner-permutation-contract.js
